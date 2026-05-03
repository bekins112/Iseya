import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, UserRound, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { ChatConversation, ChatMessage } from "@/lib/types";
import { playNotificationSound } from "@/lib/notificationSound";

const STORAGE_KEY = "iseya_chat_credentials_v1";
const POLL_INTERVAL_MS = 4000;

interface StoredCreds {
  sessionId: string;
  accessToken: string;
}

interface ChatState {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
}

function loadCreds(): StoredCreds | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.sessionId && parsed.accessToken) return parsed;
  } catch {}
  return null;
}
function saveCreds(c: StoredCreds | null) {
  if (!c) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

async function apiCall(
  url: string,
  opts: { method: "GET" | "POST"; body?: any; token?: string | null } = { method: "GET" },
) {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers["X-Chat-Token"] = opts.token;
  const res = await fetch(url, {
    method: opts.method,
    headers,
    credentials: "include",
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return res.json();
}

export default function ChatWidget() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ChatState>({ conversation: null, messages: [] });
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const credsRef = useRef<StoredCreds | null>(loadCreds());
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMsgIdRef = useRef<number>(0);

  const hideOnRoute =
    location.startsWith("/admin") ||
    location.startsWith("/onboarding") ||
    location === "/verify-email";

  async function ensureConversation() {
    if (state.conversation) return state.conversation;
    setStarting(true);
    setError(null);
    try {
      const stored = credsRef.current;
      const data = await apiCall("/api/chat/start", {
        method: "POST",
        body: { sessionId: stored?.sessionId },
        token: stored?.accessToken || null,
      });
      // If server issued a new token, this is a fresh conversation
      const newCreds: StoredCreds = data.accessToken
        ? { sessionId: data.conversation.sessionId, accessToken: data.accessToken }
        : (stored as StoredCreds);
      credsRef.current = newCreds;
      saveCreds(newCreds);

      const msgs: ChatMessage[] = data.messages || [];
      lastMsgIdRef.current = msgs.length ? msgs[msgs.length - 1].id : 0;
      setState({ conversation: data.conversation, messages: msgs });
      return data.conversation as ChatConversation;
    } catch (e: any) {
      setError("Couldn't start chat. Please try again.");
      return null;
    } finally {
      setStarting(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    setUnread(0);
    if (!state.conversation) ensureConversation();
  }

  async function handleSend() {
    const content = draft.trim();
    if (!content || sending) return;
    const conv = state.conversation || (await ensureConversation());
    if (!conv) return;
    const creds = credsRef.current;
    if (!creds) return;

    setSending(true);
    setError(null);
    setDraft("");
    const tempId = -Date.now();
    setState((s) => ({
      ...s,
      messages: [
        ...s.messages,
        {
          id: tempId,
          conversationId: conv.id,
          sender: "user",
          content,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    try {
      const data = await apiCall(`/api/chat/${creds.sessionId}/message`, {
        method: "POST",
        body: { content },
        token: creds.accessToken,
      });
      setState((s) => {
        const messages = s.messages.filter((m) => m.id !== tempId);
        if (data.userMessage) messages.push(data.userMessage);
        if (data.botMessage) messages.push(data.botMessage);
        if (messages.length) lastMsgIdRef.current = messages[messages.length - 1].id;
        return { ...s, messages };
      });
    } catch (e: any) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("429") || msg.includes("too many")) {
        setError("You're sending messages too fast. Wait a moment.");
      } else {
        setError("Couldn't send. Please try again.");
      }
      setState((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== tempId) }));
    } finally {
      setSending(false);
    }
  }

  async function handleRequestHuman() {
    const conv = state.conversation || (await ensureConversation());
    if (!conv) return;
    const creds = credsRef.current;
    if (!creds) return;
    try {
      await apiCall(`/api/chat/${creds.sessionId}/request-human`, {
        method: "POST",
        body: {},
        token: creds.accessToken,
      });
      poll();
    } catch {
      setError("Couldn't reach our team. Try again in a moment.");
    }
  }

  async function poll() {
    const conv = state.conversation;
    const creds = credsRef.current;
    if (!conv || !creds) return;
    try {
      const data = await apiCall(
        `/api/chat/${creds.sessionId}/messages?since=${lastMsgIdRef.current}`,
        { method: "GET", token: creds.accessToken },
      );
      const newMsgs: ChatMessage[] = data.messages || [];
      if (newMsgs.length) {
        lastMsgIdRef.current = newMsgs[newMsgs.length - 1].id;
        setState((s) => ({
          conversation: data.conversation || s.conversation,
          messages: [...s.messages, ...newMsgs],
        }));
        const inbound = newMsgs.filter(
          (m) => m.sender === "bot" || m.sender === "admin" || m.sender === "system",
        ).length;
        if (inbound) {
          playNotificationSound();
          if (!open) setUnread((u) => u + inbound);
        }
      } else if (data.conversation) {
        setState((s) => ({ ...s, conversation: data.conversation }));
      }
    } catch (e: any) {
      // 401 means our credentials are stale (e.g. backend recreated DB) — clear and re-init next open
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("401") || msg.includes("unauthorized")) {
        credsRef.current = null;
        saveCreds(null);
        setState({ conversation: null, messages: [] });
        lastMsgIdRef.current = 0;
      }
    }
  }

  useEffect(() => {
    if (!state.conversation) return;
    const t = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.conversation?.id, open]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, open]);

  if (hideOnRoute) return null;

  const conv = state.conversation;
  const inHumanMode = conv?.mode === "human";
  const isClosed = conv?.status === "closed";

  async function handleStartNew() {
    credsRef.current = null;
    saveCreds(null);
    setState({ conversation: null, messages: [] });
    lastMsgIdRef.current = 0;
    await ensureConversation();
  }

  return (
    <>
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="Open chat"
          data-testid="button-open-chat"
          className="fixed z-[60] bottom-24 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/20 flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <div
          data-testid="panel-chat"
          className="fixed z-[60] bottom-24 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] h-[70vh] max-h-[560px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                {inHumanMode ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div>
                <div className="font-semibold text-sm leading-tight">
                  {inHumanMode ? "Iṣéyá Team" : "Iṣéyá Assistant"}
                </div>
                <div className="text-[11px] opacity-90 leading-tight">
                  {inHumanMode ? "A real human is here to help" : "Instant answers, 24/7"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              data-testid="button-close-chat"
              className="p-1 rounded hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/30"
          >
            {starting && (
              <div className="flex items-center justify-center text-sm text-muted-foreground py-6">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting chat…
              </div>
            )}
            {state.messages.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
                <Loader2 className="h-3 w-3 animate-spin" /> {inHumanMode ? "Sending…" : "Assistant is typing…"}
              </div>
            )}
            {error && (
              <div className="text-xs text-red-600 px-2 py-1">{error}</div>
            )}
          </div>

          {conv && !isClosed && !inHumanMode && (
            <button
              onClick={handleRequestHuman}
              data-testid="button-request-human"
              className="text-xs text-primary hover:underline px-3 py-2 border-t bg-background text-left"
            >
              Talk to a human →
            </button>
          )}
          {isClosed && (
            <div className="px-3 py-2 border-t bg-background flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                This conversation was closed.
              </span>
              <Button size="sm" variant="outline" onClick={handleStartNew} data-testid="button-start-new-chat">
                Start a new chat
              </Button>
            </div>
          )}

          {!isClosed && (
            <div className="p-2 border-t flex items-end gap-2 bg-background">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={inHumanMode ? "Message the team…" : "Ask about Iṣéyá…"}
                rows={1}
                data-testid="input-chat-message"
                className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 max-h-28"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!draft.trim() || sending}
                data-testid="button-send-chat"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function MessageBubble({ m }: { m: ChatMessage }) {
  if (m.sender === "system") {
    return (
      <div className="text-center text-[11px] text-muted-foreground italic py-1">
        {m.content}
      </div>
    );
  }
  const mine = m.sender === "user";
  const isAdmin = m.sender === "admin";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
          mine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : isAdmin
              ? "bg-emerald-100 text-emerald-950 border border-emerald-200 rounded-bl-sm"
              : "bg-white border rounded-bl-sm"
        }`}
      >
        {!mine && (
          <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">
            {isAdmin ? "Iṣéyá Team" : "Assistant"}
          </div>
        )}
        {m.content}
      </div>
    </div>
  );
}
