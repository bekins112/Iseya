---
name: Page content framework (iseya)
description: How admin-editable public page content works in artifacts/iseya
---

Public marketing/legal/FAQ pages in `artifacts/iseya` get admin-editable body
content through a per-page JSON settings key (`page_landing`, `page_about`, …,
`page_disclaimer` — 12 total).

Key rules:
- Each `page_*` key lives in api-server DEFAULT_SETTINGS as `"{}"` and is
  deliberately kept OUT of TEXT_SETTINGS_KEYS so it auto-exposes via
  `/api/settings/public`. Writes go through `POST /api/admin/page-content`
  (gated by `canManageSettings`, key allowlisted via `PAGE_CONTENT_KEYS`,
  payload must be a plain JSON object — not array/primitive).
- Frontend framework: `src/lib/page-content/` — `types.ts` (PageDef/SectionDef/
  FieldDef), `merge.ts` (deep-merge; arrays replaced wholesale, objects merged by
  default shape), `use-page-content.ts` (`usePageContent(key, defaults)` reads
  `["/api/settings/public"]`), one `<page>.ts` def per page, `index.ts` aggregates
  `allPages`.
- **Empty/invalid setting => built-in defaults**, so defaults in each `<page>.ts`
  MUST equal the page's current visible text exactly. Adding a new page = add def
  file + register in `index.ts` + wire `usePageContent` in the component.

**Why:** decouples copy edits from code deploys; defaults-fallback guarantees
nothing breaks when a key is unset.

**How to apply:** icon-bearing list items (feature/step cards) keep their icon JSX
hardcoded in the component — only headings/subtitles/text become editable. Legal
pages + FAQs make the full section/Q&A lists editable via `list` FieldType with
`itemFields`. Admin UI: `PageContentEditor` renders from PageDef; Landing embeds
the reusable `BannerEditor`. Page at `/admin/page-settings` (and `/admin/banners`
also renders it).
