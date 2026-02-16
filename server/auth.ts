import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import svgCaptcha from "svg-captcha";
import { z } from "zod";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    userId: string;
    captchaText: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["applicant", "employer"]).optional(),
  age: z.number().min(16).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  captcha: z.string().min(1, "Please enter the CAPTCHA text"),
});

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.get("/api/auth/captcha", (req, res) => {
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 3,
      color: true,
      background: "#f0f0f0",
      width: 200,
      height: 60,
      fontSize: 50,
      charPreset: "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789",
    });
    req.session.captchaText = captcha.text;
    req.session.save(() => {
      res.type("svg").send(captcha.data);
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const input = registerSchema.parse(req.body);

      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));

      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const [user] = await db
        .insert(users)
        .values({
          email: input.email,
          password: hashedPassword,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role || "applicant",
          age: input.age,
        })
        .returning();

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 15 * 60 * 1000);
      await db.update(users).set({ emailVerificationCode: code, emailVerificationExpiry: expiry }).where(eq(users.id, user.id));

      try {
        const { sendVerificationEmail } = await import("./email");
        await sendVerificationEmail(input.email, code, input.firstName);
      } catch (emailErr) {
        console.log(`[Email Verification] Code for ${input.email}: ${code}`);
      }

      res.status(201).json(safeUser);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Register error:", err);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const input = loginSchema.parse(req.body);

      const storedCaptcha = req.session.captchaText;
      if (!storedCaptcha || input.captcha.toLowerCase() !== storedCaptcha.toLowerCase()) {
        return res.status(400).json({ message: "Incorrect CAPTCHA. Please try again." });
      }
      delete req.session.captchaText;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email));

      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Login error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/change-password", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const schema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
      });
      const input = schema.parse(req.body);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId));

      if (!user || !user.password) {
        return res.status(400).json({ message: "Password change not available for this account" });
      }

      const valid = await bcrypt.compare(input.currentPassword, user.password);
      if (!valid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      await db
        .update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, req.session.userId));

      res.json({ message: "Password changed successfully" });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Change password error:", err);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.post("/api/auth/send-verification", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId));

      if (!user || !user.email) {
        return res.status(400).json({ message: "No email associated with this account" });
      }

      if (user.emailVerified) {
        return res.json({ message: "Email already verified" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 15 * 60 * 1000);

      await db
        .update(users)
        .set({
          emailVerificationCode: code,
          emailVerificationExpiry: expiry,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.session.userId));

      try {
        const { sendVerificationEmail } = await import("./email");
        await sendVerificationEmail(user.email, code, user.firstName || "User");
      } catch (emailErr) {
        console.log(`[Email Verification] Code for ${user.email}: ${code}`);
      }

      res.json({ message: "Verification code sent to your email" });
    } catch (err) {
      console.error("Send verification error:", err);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const schema = z.object({ code: z.string().length(6) });
      const input = schema.parse(req.body);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId));

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.json({ message: "Email already verified" });
      }

      if (!user.emailVerificationCode || !user.emailVerificationExpiry) {
        return res.status(400).json({ message: "No verification code sent. Please request a new one." });
      }

      if (new Date() > user.emailVerificationExpiry) {
        return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
      }

      if (user.emailVerificationCode !== input.code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      await db
        .update(users)
        .set({
          emailVerified: true,
          emailVerificationCode: null,
          emailVerificationExpiry: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.session.userId));

      const { password: _, ...safeUser } = { ...user, emailVerified: true, emailVerificationCode: null, emailVerificationExpiry: null };
      res.json(safeUser);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid verification code format" });
      }
      console.error("Verify email error:", err);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
