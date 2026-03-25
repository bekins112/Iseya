import fs from "fs";
import path from "path";
import { db } from "./db";
import { fileUploads } from "@shared/schema";
import { eq } from "drizzle-orm";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

export async function storeFileInDb(filePath: string, diskPath: string): Promise<void> {
  try {
    const absolutePath = path.isAbsolute(diskPath)
      ? diskPath
      : path.resolve(process.cwd(), diskPath);

    if (!fs.existsSync(absolutePath)) return;

    const fileData = fs.readFileSync(absolutePath);
    const base64Data = fileData.toString("base64");
    const mimeType = getMimeType(diskPath);

    await db
      .insert(fileUploads)
      .values({ filePath, data: base64Data, mimeType })
      .onConflictDoUpdate({
        target: fileUploads.filePath,
        set: { data: base64Data, mimeType },
      });
  } catch (err) {
    console.error(`[file-storage] Failed to store file in DB: ${filePath}`, err);
  }
}

export async function getFileFromDb(filePath: string): Promise<{ data: Buffer; mimeType: string } | null> {
  try {
    const [record] = await db
      .select()
      .from(fileUploads)
      .where(eq(fileUploads.filePath, filePath))
      .limit(1);

    if (!record) return null;

    return {
      data: Buffer.from(record.data, "base64"),
      mimeType: record.mimeType,
    };
  } catch (err) {
    console.error(`[file-storage] Failed to get file from DB: ${filePath}`, err);
    return null;
  }
}

export async function migrateExistingUploads(): Promise<void> {
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) return;

  const subdirs = ["profile", "logo", "ads", "verification", "tickets", "cv"];
  let count = 0;

  for (const subdir of subdirs) {
    const dirPath = path.join(uploadsDir, subdir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = `/uploads/${subdir}/${file}`;
      const diskPath = path.join(dirPath, file);

      const [existing] = await db
        .select({ id: fileUploads.id })
        .from(fileUploads)
        .where(eq(fileUploads.filePath, filePath))
        .limit(1);

      if (!existing) {
        await storeFileInDb(filePath, diskPath);
        count++;
      }
    }
  }

  if (count > 0) {
    console.log(`[file-storage] Migrated ${count} existing files to database`);
  }
}
