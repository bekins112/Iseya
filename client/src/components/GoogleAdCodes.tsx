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
  const { data } = useQuery<{
    adsenseHeaderScript: string;
    gadsTrackingId: string;
    gadsHeaderScript: string;
    gaMeasurementId: string;
    gaScript: string;
  }>({
    queryKey: ["/api/google-ads/codes"],
    queryFn: async () => {
      const res = await fetch("/api/google-ads/codes");
      if (!res.ok) return { adsenseHeaderScript: "", gadsTrackingId: "", gadsHeaderScript: "", gaMeasurementId: "", gaScript: "" };
      return res.json();
    },
    staleTime: 300000,
  });

  useEffect(() => {
    if (!data) return;

    if (data.adsenseHeaderScript) {
      injectCodeBlock(data.adsenseHeaderScript, "head", "google-adsense-header-script");
    }

    if (data.gadsTrackingId) {
      const existingGads = document.getElementById("google-ads-script");
      if (!existingGads) {
        const gadsScript = document.createElement("script");
        gadsScript.id = "google-ads-script";
        gadsScript.async = true;
        gadsScript.src = `https://www.googletagmanager.com/gtag/js?id=${data.gadsTrackingId}`;
        document.head.appendChild(gadsScript);

        const gadsInit = document.createElement("script");
        gadsInit.id = "google-ads-init";
        gadsInit.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${data.gadsTrackingId}');`;
        document.head.appendChild(gadsInit);
      }
    }

    if (data.gadsHeaderScript) {
      injectCodeBlock(data.gadsHeaderScript, "head", "google-ads-header-script");
    }

    if (data.gaMeasurementId) {
      const existingGa = document.getElementById("google-analytics-script");
      if (!existingGa) {
        const gaScript = document.createElement("script");
        gaScript.id = "google-analytics-script";
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${data.gaMeasurementId}`;
        document.head.appendChild(gaScript);

        const gaInit = document.createElement("script");
        gaInit.id = "google-analytics-init";
        gaInit.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${data.gaMeasurementId}');`;
        document.head.appendChild(gaInit);
      }
    }

    if (data.gaScript) {
      injectCodeBlock(data.gaScript, "head", "google-analytics-custom-code");
    }
  }, [data]);

  return null;
}
