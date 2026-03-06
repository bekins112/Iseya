import { useQuery } from "@tanstack/react-query";
import { AdBanner, AdPopup } from "./InternalAd";
import type { InternalAd } from "@shared/schema";

export default function PageAds({ page }: { page: string }) {
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

  const banners = ads.filter(ad => ad.type === "banner");
  const popups = ads.filter(ad => ad.type === "popup");

  return (
    <>
      {banners.map(ad => (
        <AdBanner key={ad.id} ad={ad} />
      ))}
      {popups.length > 0 && <AdPopup ad={popups[0]} />}
    </>
  );
}
