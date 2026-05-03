export function generateJobSlug(title: string, id: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
  return `${slug}-${id}`;
}

export function extractIdFromSlug(slugOrId: string): number | null {
  const numericOnly = /^\d+$/;
  if (numericOnly.test(slugOrId)) {
    return parseInt(slugOrId, 10);
  }
  const match = slugOrId.match(/-(\d+)$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

export function jobUrl(job: { id: number; title: string }): string {
  return `/jobs/${generateJobSlug(job.title, job.id)}`;
}
