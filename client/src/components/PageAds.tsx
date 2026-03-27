import { useQuery } from "@tanstack/react-query";
import { AdBanner, AdPopup } from "./InternalAd";
import type { InternalAd } from "@shared/schema";

export default function PageAds({ page, position = "top" }: { page: string; position?: "top" | "middle" | "bottom" }) {
  const { data: ads = [] } = useQuery<InternalAd[]>({
    queryKey: ["/api/ads", page],
    queryFn: async () => {
      const res = await fetch(`/api/ads?page=${page}`);
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 60000,
  });

  if (ads.length === 0) return null;

  const positionAds = ads.filter(ad => (ad.position || "top") === position);

  const banners = positionAds.filter(ad => ad.type === "banner");
  const popups = positionAds.filter(ad => ad.type === "popup");

  if (banners.length === 0 && popups.length === 0) return null;

  return (
    <>
      {banners.map(ad => (
        <AdBanner key={ad.id} ad={ad} />
      ))}
      {popups.length > 0 && <AdPopup ad={popups[0]} />}
    </>
  );
}
