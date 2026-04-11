import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

function injectCodeBlock(html: string, target: "head" | "body", id: string) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const container = document.createElement("div");
  container.innerHTML = html;
  const targetEl = target === "head" ? document.head : document.body;
  const scripts = container.querySelectorAll("script");
  scripts.forEach((oldScript) => {
    const newScript = document.createElement("script");
    Array.from(oldScript.attributes).forEach((attr) => {
      newScript.setAttribute(attr.name, attr.value);
    });
    if (oldScript.textContent) {
      newScript.textContent = oldScript.textContent;
    }
    targetEl.appendChild(newScript);
  });
  const nonScripts = container.querySelectorAll(":not(script)");
  nonScripts.forEach((el) => {
    targetEl.appendChild(el.cloneNode(true));
  });
}

export default function GoogleAdCodes() {
  const { data } = useQuery<{ headerCode: string; bodyCode: string; gaTrackingId: string; gaCode: string }>({
    queryKey: ["/api/google-ads/codes"],
    queryFn: async () => {
      const res = await fetch("/api/google-ads/codes");
      if (!res.ok) return { headerCode: "", bodyCode: "", gaTrackingId: "", gaCode: "" };
      return res.json();
    },
    staleTime: 300000,
  });

  useEffect(() => {
    if (!data) return;

    if (data.headerCode) {
      injectCodeBlock(data.headerCode, "head", "google-ads-header-code");
    }

    if (data.bodyCode) {
      injectCodeBlock(data.bodyCode, "body", "google-ads-body-code");
    }

    if (data.gaTrackingId) {
      const existingGtag = document.getElementById("google-analytics-script");
      if (!existingGtag) {
        const gtagScript = document.createElement("script");
        gtagScript.id = "google-analytics-script";
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${data.gaTrackingId}`;
        document.head.appendChild(gtagScript);

        const gtagInit = document.createElement("script");
        gtagInit.id = "google-analytics-init";
        gtagInit.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${data.gaTrackingId}');`;
        document.head.appendChild(gtagInit);
      }
    }

    if (data.gaCode) {
      injectCodeBlock(data.gaCode, "head", "google-analytics-custom-code");
    }
  }, [data]);

  return null;
}
