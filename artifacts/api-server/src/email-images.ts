import * as fs from "fs";
import * as path from "path";

export interface InlineAttachment {
  filename: string;
  content: Buffer;
  content_type?: string;
  content_id: string;
  content_disposition?: "inline" | "attachment";
}

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function publicDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../iseya/public"),
    path.resolve(process.cwd(), "artifacts/iseya/public"),
    path.resolve(__dirname, "../../iseya/public"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

export function inlineLocalImages(html: string): { html: string; attachments: InlineAttachment[] } {
  const dir = publicDir();
  const attachments: InlineAttachment[] = [];
  const cidByFile = new Map<string, string>();

  const rewritten = html.replace(/src=(["'])(.*?)\1/g, (match, quote: string, url: string) => {
    const cleaned = url.split("?")[0].split("#")[0];
    const filename = cleaned.split("/").pop() || "";
    if (!filename) return match;
    const ext = path.extname(filename).toLowerCase();
    if (!MIME_BY_EXT[ext]) return match;

    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) return match;

    let cid = cidByFile.get(filename);
    if (!cid) {
      cid = `inline-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      cidByFile.set(filename, cid);
      try {
        const content = fs.readFileSync(filePath);
        attachments.push({
          filename,
          content,
          content_type: MIME_BY_EXT[ext],
          content_id: cid,
          content_disposition: "inline",
        });
      } catch {
        return match;
      }
    }
    return `src=${quote}cid:${cid}${quote}`;
  });

  return { html: rewritten, attachments };
}

export function toResendAttachments(
  inline: InlineAttachment[],
  extra: Array<{ filename: string; content: Buffer; content_type?: string; content_id?: string }> = [],
) {
  const all = [
    ...inline.map((a) => ({
      filename: a.filename,
      content: a.content,
      content_type: a.content_type,
      content_id: a.content_id,
      content_disposition: a.content_disposition,
    })),
    ...extra.map((a) => ({
      filename: a.filename,
      content: a.content,
      content_type: a.content_type,
      ...(a.content_id ? { content_id: a.content_id, content_disposition: "inline" } : {}),
    })),
  ];
  return all;
}
