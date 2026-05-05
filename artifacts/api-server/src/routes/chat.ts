import type { Express, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { db, chatConversations, chatMessages } from "@workspace/db";
import { eq, desc, gt, and, sql } from "drizzle-orm";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { getAdminRoleColor, getAdminRoleColors } from "../admin-role-color";

async function attachAdminRoleColors<T extends { sender: string; senderUserId?: string | null }>(
  messages: T[],
): Promise<(T & { senderRoleColor: string | null })[]> {
  const adminIds = messages
    .filter((m) => m.sender === "admin" && m.senderUserId)
    .map((m) => m.senderUserId as string);
  const map = await getAdminRoleColors(adminIds);
  return messages.map((m) => ({
    ...m,
    senderRoleColor:
      m.sender === "admin" && m.senderUserId ? map.get(m.senderUserId) ?? null : null,
  }));
}

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY!,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const SYSTEM_PROMPT = `You are Iṣéyá Assistant, a friendly, concise chatbot for Iṣéyá — a Nigerian mobile-first job marketplace that connects everyday Nigerian workers (drivers, nannies, cleaners, security, retail staff, tradespeople, agents, and skilled professionals) with employers and recruiting agencies.

Tone: warm, encouraging, plain English (some Pidgin is okay if the visitor uses it). Short answers (2-4 sentences). Use bullet points only when listing steps.

What you can help with:
- Explain how Iṣéyá works for job seekers, employers, and agents
- Guide visitors to: register, browse jobs (/browse-jobs), post a job (/post-job), get verified, or upgrade their subscription
- Explain verification, subscriptions, payments (Paystack/Flutterwave), and safety tips
- Answer FAQ-style questions about pricing, refunds, and how to contact support

Boundaries:
- You DO NOT have access to a specific user's account, applications, payments, or job postings. If asked, tell them to log in and check their dashboard, or to request a human agent.
- You DO NOT make promises about hire outcomes, job approvals, refunds, or verification timelines.
- For complaints, disputes, suspected fraud, payment issues, or anything sensitive, recommend the user click the "Talk to a human" button so a real Iṣéyá team member can help.

Always be helpful, never hostile. If you don't know, say so and offer the human handoff.`;

const PROACTIVE_GREETING =
  "Hi! I'm the Iṣéyá Assistant. I can help you find jobs, hire workers, or explain how the platform works. What would you like to do today? You can also tap \"Talk to a human\" anytime to reach our team.";

// ----- Token / id helpers (unguessable) -----
function newSessionId() {
  return "cs_" + crypto.randomBytes(18).toString("base64url");
}
function newAccessToken() {
  return crypto.randomBytes(32).toString("base64url");
}
function tokensMatch(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// ----- Simple in-memory rate limit (per-IP, sliding window) -----
const rateBuckets = new Map<string, number[]>();
function rateLimit(req: Request, res: Response, max: number, windowMs: number): boolean {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const key = `${req.path}:${ip}`;
  const now = Date.now();
  const bucket = (rateBuckets.get(key) || []).filter((t) => now - t < windowMs);
  if (bucket.length >= max) {
    res.status(429).json({ message: "Too many requests, please slow down." });
    return false;
  }
  bucket.push(now);
  rateBuckets.set(key, bucket);
  // Periodic cleanup
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets) {
      if (!v.length || now - v[v.length - 1] > windowMs * 4) rateBuckets.delete(k);
    }
  }
  return true;
}

// ----- Visitor conversation auth -----
function readVisitorToken(req: Request): string | null {
  const h = req.headers["x-chat-token"];
  if (typeof h === "string" && h) return h;
  return null;
}

async function loadAuthorizedConversation(
  sessionId: string,
  token: string | null,
) {
  const found = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.sessionId, sessionId))
    .limit(1);
  const conv = found[0];
  if (!conv) return null;
  if (!conv.accessToken) return null; // refuse legacy sessions without token
  if (!tokensMatch(conv.accessToken, token)) return null;
  return conv;
}

async function requireAdminChat(req: any, res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await storage.getUser(userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  const perms = await storage.getAdminPermissions(userId);
  if (perms && perms.canManageChats === false && perms.canManageTickets === false) {
    return res.status(403).json({ message: "You don't have permission to manage chats" });
  }
  req.adminUser = user;
  next();
}

async function appendMessage(
  conversationId: number,
  sender: "user" | "bot" | "admin" | "system",
  content: string,
  senderUserId?: string | null,
) {
  const [msg] = await db
    .insert(chatMessages)
    .values({ conversationId, sender, content, senderUserId: senderUserId ?? null })
    .returning();
  return msg;
}

async function generateBotReply(
  history: { sender: string; content: string }[],
): Promise<string> {
  const messages = history
    .filter((m) => m.sender === "user" || m.sender === "bot")
    .map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (messages.length === 0) return PROACTIVE_GREETING;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages,
    });
    const block = response.content[0];
    const text = block && block.type === "text" ? block.text.trim() : "";
    return (
      text ||
      "Sorry — I couldn't think of a reply just now. Tap \"Talk to a human\" and our team will help."
    );
  } catch (err: any) {
    console.error("[chat] anthropic error:", err?.message || err);
    return "I'm having trouble reaching the assistant right now. Please tap \"Talk to a human\" to reach our team.";
  }
}

async function createFreshConversation(req: any) {
  const userId = req.session?.userId || null;
  const sid = newSessionId();
  const token = newAccessToken();
  const [created] = await db
    .insert(chatConversations)
    .values({
      sessionId: sid,
      accessToken: token,
      userId,
      mode: "bot",
      status: "open",
    })
    .returning();
  await appendMessage(created.id, "bot", PROACTIVE_GREETING);
  return { conv: created, accessToken: token };
}

export function registerChatRoutes(app: Express) {
  // ===== PUBLIC / VISITOR =====

  // Start (or resume) a conversation
  app.post("/api/chat/start", async (req: any, res) => {
    try {
      if (!rateLimit(req, res, 30, 60_000)) return;
      const { sessionId } = req.body || {};
      const providedToken = readVisitorToken(req);

      let conv: any = null;
      let accessToken: string | null = null;
      if (sessionId && providedToken) {
        conv = await loadAuthorizedConversation(sessionId, providedToken);
        if (conv && conv.status === "closed") conv = null; // start fresh after close
      }

      if (!conv) {
        const fresh = await createFreshConversation(req);
        conv = fresh.conv;
        accessToken = fresh.accessToken;
      } else {
        const userId = req.session?.userId || null;
        if (userId && !conv.userId) {
          await db
            .update(chatConversations)
            .set({ userId })
            .where(eq(chatConversations.id, conv.id));
          conv.userId = userId;
        }
      }

      const rawMessages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.conversationId, conv.id))
        .orderBy(chatMessages.id);
      const messages = await attachAdminRoleColors(rawMessages);

      // Strip token from stored conv before responding
      const { accessToken: _t, ...convSafe } = conv as any;
      res.json({
        conversation: convSafe,
        messages,
        accessToken, // only present on fresh conversation creation
      });
    } catch (err: any) {
      console.error("[chat/start]", err);
      res.status(500).json({ message: "Failed to start chat" });
    }
  });

  // Visitor sends a message
  app.post("/api/chat/:sessionId/message", async (req: any, res) => {
    try {
      if (!rateLimit(req, res, 20, 60_000)) return;
      const { sessionId } = req.params;
      const token = readVisitorToken(req);
      const conv = await loadAuthorizedConversation(sessionId, token);
      if (!conv) return res.status(401).json({ message: "Conversation not found or unauthorized" });

      const content = (req.body?.content || "").toString().trim();
      if (!content) return res.status(400).json({ message: "Message required" });
      if (content.length > 4000)
        return res.status(400).json({ message: "Message too long" });
      if (conv.status === "closed")
        return res.status(400).json({ message: "Conversation is closed" });

      const userMsg = await appendMessage(conv.id, "user", content);
      await db
        .update(chatConversations)
        .set({
          lastMessageAt: new Date(),
          unreadForAdmin: sql`${chatConversations.unreadForAdmin} + 1`,
        })
        .where(eq(chatConversations.id, conv.id));

      let botMsg = null;
      if (conv.mode === "bot") {
        const history = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, conv.id))
          .orderBy(chatMessages.id);
        const reply = await generateBotReply(history);
        botMsg = await appendMessage(conv.id, "bot", reply);
        await db
          .update(chatConversations)
          .set({ lastMessageAt: new Date() })
          .where(eq(chatConversations.id, conv.id));
      }

      res.json({ userMessage: userMsg, botMessage: botMsg, mode: conv.mode });
    } catch (err: any) {
      console.error("[chat/message]", err);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Visitor polls for messages (since a given message id)
  app.get("/api/chat/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const token = readVisitorToken(req);
      const conv = await loadAuthorizedConversation(sessionId, token);
      if (!conv) return res.status(401).json({ message: "Conversation not found or unauthorized" });

      const since = parseInt((req.query.since as string) || "0", 10) || 0;
      const rawMessages = await db
        .select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.conversationId, conv.id),
            gt(chatMessages.id, since),
          ),
        )
        .orderBy(chatMessages.id);
      const messages = await attachAdminRoleColors(rawMessages);

      // Atomic decrement for messages we just delivered to the user
      const inboundDelivered = messages.filter(
        (m) => m.sender === "bot" || m.sender === "admin" || m.sender === "system",
      ).length;
      if (inboundDelivered > 0) {
        await db
          .update(chatConversations)
          .set({
            unreadForUser: sql`GREATEST(0, ${chatConversations.unreadForUser} - ${inboundDelivered})`,
          })
          .where(eq(chatConversations.id, conv.id));
      }

      const { accessToken: _t, ...convSafe } = conv as any;
      res.json({ conversation: convSafe, messages });
    } catch (err: any) {
      console.error("[chat/poll]", err);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Visitor requests a human takeover
  app.post("/api/chat/:sessionId/request-human", async (req, res) => {
    try {
      if (!rateLimit(req, res, 5, 60_000)) return;
      const { sessionId } = req.params;
      const token = readVisitorToken(req);
      const conv = await loadAuthorizedConversation(sessionId, token);
      if (!conv) return res.status(401).json({ message: "Conversation not found or unauthorized" });
      if (conv.status === "closed")
        return res.status(400).json({ message: "Conversation is closed" });

      if (conv.mode !== "human") {
        await db
          .update(chatConversations)
          .set({
            mode: "human",
            lastMessageAt: new Date(),
            unreadForAdmin: sql`${chatConversations.unreadForAdmin} + 1`,
          })
          .where(eq(chatConversations.id, conv.id));
        await appendMessage(
          conv.id,
          "system",
          "You've been queued for a human agent. Someone from the Iṣéyá team will reply here shortly.",
        );
      }
      res.json({ ok: true });
    } catch (err: any) {
      console.error("[chat/request-human]", err);
      res.status(500).json({ message: "Failed to request human" });
    }
  });

  // ===== ADMIN =====

  // List conversations (token never returned)
  app.get(
    "/api/admin/chat/conversations",
    isAuthenticated,
    requireAdminChat,
    async (req: any, res) => {
      try {
        const status = (req.query.status as string) || "open";
        const rows = await db
          .select({
            id: chatConversations.id,
            sessionId: chatConversations.sessionId,
            userId: chatConversations.userId,
            visitorName: chatConversations.visitorName,
            visitorEmail: chatConversations.visitorEmail,
            mode: chatConversations.mode,
            status: chatConversations.status,
            adminId: chatConversations.adminId,
            unreadForAdmin: chatConversations.unreadForAdmin,
            unreadForUser: chatConversations.unreadForUser,
            lastMessageAt: chatConversations.lastMessageAt,
            createdAt: chatConversations.createdAt,
          })
          .from(chatConversations)
          .where(eq(chatConversations.status, status))
          .orderBy(desc(chatConversations.lastMessageAt));
        res.json(rows);
      } catch (err: any) {
        console.error("[admin/chat/list]", err);
        res.status(500).json({ message: "Failed to list conversations" });
      }
    },
  );

  // Get one conversation + its messages
  app.get(
    "/api/admin/chat/conversations/:id",
    isAuthenticated,
    requireAdminChat,
    async (req: any, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const conv = (
          await db
            .select()
            .from(chatConversations)
            .where(eq(chatConversations.id, id))
            .limit(1)
        )[0];
        if (!conv) return res.status(404).json({ message: "Not found" });

        const rawMessages = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, id))
          .orderBy(chatMessages.id);
        const messages = await attachAdminRoleColors(rawMessages);

        // Atomic decrement based on visitor messages we just showed admin
        const inbound = messages.filter((m) => m.sender === "user").length;
        if (inbound > 0) {
          await db
            .update(chatConversations)
            .set({
              unreadForAdmin: sql`GREATEST(0, ${chatConversations.unreadForAdmin} - ${inbound})`,
            })
            .where(eq(chatConversations.id, id));
        }

        const { accessToken: _t, ...convSafe } = conv as any;
        res.json({ conversation: convSafe, messages });
      } catch (err: any) {
        console.error("[admin/chat/get]", err);
        res.status(500).json({ message: "Failed to fetch conversation" });
      }
    },
  );

  // Admin takes over (switch to human mode + assign)
  app.post(
    "/api/admin/chat/conversations/:id/takeover",
    isAuthenticated,
    requireAdminChat,
    async (req: any, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const adminId = req.session.userId;
        await db
          .update(chatConversations)
          .set({ mode: "human", adminId, lastMessageAt: new Date() })
          .where(eq(chatConversations.id, id));
        const adminName =
          (req.adminUser?.firstName || "") + " " + (req.adminUser?.lastName || "");
        await appendMessage(
          id,
          "system",
          `${adminName.trim() || "An Iṣéyá agent"} has joined the conversation.`,
          adminId,
        );
        await db
          .update(chatConversations)
          .set({
            unreadForUser: sql`${chatConversations.unreadForUser} + 1`,
          })
          .where(eq(chatConversations.id, id));
        res.json({ ok: true });
      } catch (err: any) {
        console.error("[admin/chat/takeover]", err);
        res.status(500).json({ message: "Failed to take over" });
      }
    },
  );

  // Admin sends a message
  app.post(
    "/api/admin/chat/conversations/:id/message",
    isAuthenticated,
    requireAdminChat,
    async (req: any, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        const adminId = req.session.userId;
        const content = (req.body?.content || "").toString().trim();
        if (!content) return res.status(400).json({ message: "Message required" });
        if (content.length > 4000)
          return res.status(400).json({ message: "Message too long" });

        const conv = (
          await db
            .select()
            .from(chatConversations)
            .where(eq(chatConversations.id, id))
            .limit(1)
        )[0];
        if (!conv) return res.status(404).json({ message: "Not found" });
        if (conv.status === "closed")
          return res.status(400).json({ message: "Conversation is closed" });

        const msg = await appendMessage(id, "admin", content, adminId);
        await db
          .update(chatConversations)
          .set({
            mode: "human",
            adminId: conv.adminId || adminId,
            lastMessageAt: new Date(),
            unreadForUser: sql`${chatConversations.unreadForUser} + 1`,
          })
          .where(eq(chatConversations.id, id));
        const senderRoleColor = await getAdminRoleColor(adminId);
        res.json({ ...msg, senderRoleColor });
      } catch (err: any) {
        console.error("[admin/chat/message]", err);
        res.status(500).json({ message: "Failed to send message" });
      }
    },
  );

  // Admin closes the conversation
  app.post(
    "/api/admin/chat/conversations/:id/close",
    isAuthenticated,
    requireAdminChat,
    async (req: any, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        await db
          .update(chatConversations)
          .set({ status: "closed", lastMessageAt: new Date() })
          .where(eq(chatConversations.id, id));
        await appendMessage(
          id,
          "system",
          "This conversation has been closed by the Iṣéyá team. Start a new chat anytime.",
        );
        res.json({ ok: true });
      } catch (err: any) {
        console.error("[admin/chat/close]", err);
        res.status(500).json({ message: "Failed to close" });
      }
    },
  );

  // Admin returns control to the bot
  app.post(
    "/api/admin/chat/conversations/:id/return-to-bot",
    isAuthenticated,
    requireAdminChat,
    async (req: any, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        await db
          .update(chatConversations)
          .set({ mode: "bot", adminId: null, lastMessageAt: new Date() })
          .where(eq(chatConversations.id, id));
        await appendMessage(
          id,
          "system",
          "You're back with the Iṣéyá Assistant. I'll do my best to help — say \"talk to a human\" anytime.",
        );
        res.json({ ok: true });
      } catch (err: any) {
        console.error("[admin/chat/return-to-bot]", err);
        res.status(500).json({ message: "Failed to return to bot" });
      }
    },
  );
}
