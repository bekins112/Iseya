import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function GoogleAdCodes() {
  const { data } = useQuery<{ headerCode: string; bodyCode: string }>({
    queryKey: ["/api/google-ads/codes"],
    queryFn: async () => {
      const res = await fetch("/api/google-ads/codes");
      if (!res.ok) return { headerCode: "", bodyCode: "" };
      return res.json();
    },
    staleTime: 300000,
  });

  useEffect(() => {
    if (!data) return;

    if (data.headerCode) {
      const existing = document.getElementById("google-ads-header-code");
      if (existing) existing.remove();
      const container = document.createElement("div");
      container.id = "google-ads-header-code";
      container.innerHTML = data.headerCode;
      const scripts = container.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        document.head.appendChild(newScript);
      });
      const nonScripts = container.querySelectorAll(":not(script)");
      nonScripts.forEach((el) => {
        document.head.appendChild(el.cloneNode(true));
      });
    }

    if (data.bodyCode) {
      const existing = document.getElementById("google-ads-body-code");
      if (existing) existing.remove();
      const container = document.createElement("div");
      container.id = "google-ads-body-code";
      container.innerHTML = data.bodyCode;
      const scripts = container.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
      });
      const nonScripts = container.querySelectorAll(":not(script)");
      nonScripts.forEach((el) => {
        document.body.appendChild(el.cloneNode(true));
      });
    }
  }, [data]);

  return null;
}
