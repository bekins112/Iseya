---
name: Promotions / ad-blocker-safe naming (iseya)
description: Why the public "ads" surface is named "promotions"/"promos" and the shared-multer coupling to watch when touching it.
---

# Ad-blocker-safe naming for the internal-ads feature

The internal-ads feature is exposed to the public under **neutral names** so browser
ad blockers (which filter URLs/DOM containing `ad`, `ads`, `advert`) don't hide it.

- Public data endpoint: **`/api/promotions`** is primary; `/api/ads` is kept only as a
  backward-compat alias (`app.get(["/api/promotions","/api/ads"], ...)`). Do NOT
  "clean up" by removing the alias, and do NOT add new public `/api/ads*` paths — new
  public surfaces should use `promotions`/`promos`.
- Public image path: new uploads go to **`/uploads/promos/`** (not `/uploads/ads/`).
  Legacy DB rows still point at `/uploads/ads/*`; those keep working because the
  static mount serves the whole `uploads/` folder, so never delete `uploads/ads`.
- Public component test IDs/session keys use `promo-*` / `iseya_promo_dismissed_*`
  (not `ad-*`). Admin-only pages (AdminAds.tsx) keep `ad-*` — they're behind auth,
  ad blockers never see them.

**Why:** ad blockers were hiding the banner/popup promos for real visitors.

**How to apply:** when adding/renaming anything in the internal-ads path that a
logged-out visitor's browser will request or render, use promotion/promo naming.

## Shared-multer coupling gotcha
The ad-media multer instance in `routes.ts` (dest `uploads/promos`) is **shared by
BOTH internal ads AND hiring-company logos**. If you change its destination folder,
you must update ALL image/logo URL builders that reference it (ad `imageUrl` create +
patch, company `logoUrl` create + patch) in lockstep, or logos/ads will 404.
