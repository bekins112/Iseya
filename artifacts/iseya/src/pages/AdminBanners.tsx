import { usePageTitle } from "@/hooks/use-page-title";
import { PageHeader } from "@/components/ui-extension";
import BannerEditor from "@/components/BannerEditor";

export default function AdminBanners() {
  usePageTitle("Landing Banners");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landing Page Banners"
        description="Manage the sliding banner images shown at the top of the landing page. Add up to 5 banners and reorder how they slide."
      />
      <BannerEditor />
    </div>
  );
}
