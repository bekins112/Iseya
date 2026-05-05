import { db } from "./db";
import { adminPermissions, adminRoles } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

export async function getAdminRoleColors(
  userIds: (string | null | undefined)[],
): Promise<Map<string, string | null>> {
  const ids = Array.from(
    new Set(userIds.filter((id): id is string => !!id)),
  );
  const map = new Map<string, string | null>();
  if (ids.length === 0) return map;
  const rows = await db
    .select({ userId: adminPermissions.userId, color: adminRoles.color })
    .from(adminPermissions)
    .leftJoin(adminRoles, eq(adminPermissions.roleId, adminRoles.id))
    .where(inArray(adminPermissions.userId, ids));
  for (const r of rows) map.set(r.userId, r.color ?? null);
  return map;
}

export async function getAdminRoleColor(
  userId: string | null | undefined,
): Promise<string | null> {
  if (!userId) return null;
  const map = await getAdminRoleColors([userId]);
  return map.get(userId) ?? null;
}
