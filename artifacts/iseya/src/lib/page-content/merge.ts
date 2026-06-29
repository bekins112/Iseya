function isPlainObject(v: unknown): v is Record<string, any> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function mergeContent<T>(defaults: T, saved: any): T {
  if (saved === undefined || saved === null) return defaults;
  if (Array.isArray(defaults)) {
    return (Array.isArray(saved) ? saved : defaults) as T;
  }
  if (isPlainObject(defaults)) {
    const out: Record<string, any> = { ...defaults };
    for (const k of Object.keys(defaults)) {
      if (isPlainObject(saved) && k in saved) {
        out[k] = mergeContent((defaults as any)[k], saved[k]);
      }
    }
    return out as T;
  }
  return saved as T;
}
