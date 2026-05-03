import { storage } from "./storage";
import type { Request } from "express";

type LogCategory = "auth" | "jobs" | "applications" | "users" | "subscriptions" | "admin" | "settings" | "tickets" | "verifications" | "notifications" | "ads" | "payments";

interface LogParams {
  req?: any;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  category: LogCategory;
  description: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

export async function logActivity(params: LogParams) {
  try {
    const user = params.req?.user || params.req?.adminUser;
    const userId = params.userId || user?.id;
    const userEmail = params.userEmail || user?.email || user?.username;
    const userRole = params.userRole || user?.role;
    const ipAddress = params.req?.ip || params.req?.headers?.["x-forwarded-for"] || params.req?.connection?.remoteAddress;

    await storage.createActivityLog({
      userId: userId || null,
      userEmail: userEmail || null,
      userRole: userRole || null,
      action: params.action,
      category: params.category,
      description: params.description,
      targetType: params.targetType || null,
      targetId: params.targetId || null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      ipAddress: typeof ipAddress === "string" ? ipAddress.substring(0, 100) : null,
    });
  } catch (err) {
    console.error("[activity-log] Failed to write log:", err);
  }
}
