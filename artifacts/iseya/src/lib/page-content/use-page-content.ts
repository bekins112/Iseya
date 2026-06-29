import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { mergeContent } from "./merge";

export function usePageContent<T>(key: string, defaults: T): T {
  const { data } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings/public"],
  });

  return useMemo(() => {
    const raw = data?.[key];
    if (!raw) return defaults;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
        return mergeContent(defaults, parsed);
      }
      return defaults;
    } catch {
      return defaults;
    }
  }, [data, key, defaults]);
}
