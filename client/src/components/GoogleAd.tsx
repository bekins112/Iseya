import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { GoogleAdPlacement } from "@shared/schema";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdUnitProps {
  placement: GoogleAdPlacement;
  publisherId: string;
}

function GoogleAdUnit({ placement, publisherId }: GoogleAdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {}
  }, []);

  const style: Record<string, string> = { display: "block" };
  if (!placement.isResponsive && placement.customWidth && placement.customHeight) {
    style.width = `${placement.customWidth}px`;
    style.height = `${placement.customHeight}px`;
  }

  return (
    <div className="google-ad-container my-3" data-testid={`google-ad-${placement.id}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={publisherId}
        data-ad-slot={placement.adSlotId}
        data-ad-format={placement.isResponsive ? "auto" : placement.adFormat}
        data-full-width-responsive={placement.isResponsive ? "true" : "false"}
      />
    </div>
  );
}

export default function GoogleAds({ page, position = "top" }: { page: string; position?: "top" | "middle" | "bottom" | "right" }) {
  const { data } = useQuery<{ publisherId: string | null; placements: GoogleAdPlacement[] }>({
    queryKey: ["/api/google-ads", page],
    queryFn: async () => {
      const res = await fetch(`/api/google-ads?page=${page}`);
      if (!res.ok) return { publisherId: null, placements: [] };
      return res.json();
    },
    staleTime: 60000,
  });

  useEffect(() => {
    if (!data?.publisherId) return;
    const existing = document.querySelector(`script[src*="adsbygoogle"]`);
    if (existing) return;
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${data.publisherId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, [data?.publisherId]);

  if (!data?.publisherId || !data.placements || data.placements.length === 0) return null;

  const filtered = data.placements.filter(p => {
    const positions = Array.isArray(p.position) ? p.position : [p.position || "right"];
    return positions.includes(position);
  });

  if (filtered.length === 0) return null;

  return (
    <>
      {filtered.map(p => (
        <GoogleAdUnit key={p.id} placement={p} publisherId={data.publisherId!} />
      ))}
    </>
  );
}
