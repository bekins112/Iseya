import { useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";
import { PageHeader } from "@/components/ui-extension";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { allPages } from "@/lib/page-content";
import PageContentEditor from "@/components/PageContentEditor";

export default function AdminPageSettings() {
  usePageTitle("Page Settings");
  const [activeKey, setActiveKey] = useState(allPages[0]?.key);

  const active = allPages.find((p) => p.key === activeKey) ?? allPages[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Page Settings"
        description="Edit the content of every public page. Leave fields as-is to keep the built-in defaults. Changes go live immediately."
      />

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="lg:sticky lg:top-4 h-fit">
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {allPages.map((p) => (
              <Button
                key={p.key}
                variant={p.key === active?.key ? "secondary" : "ghost"}
                className={cn("justify-start whitespace-nowrap lg:w-full", p.key === active?.key && "font-semibold")}
                onClick={() => setActiveKey(p.key)}
                data-testid={`tab-page-${p.key}`}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          {active && (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-bold">{active.label}</h2>
                {active.description && <p className="text-sm text-muted-foreground">{active.description}</p>}
              </div>
              <PageContentEditor key={active.key} page={active} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
