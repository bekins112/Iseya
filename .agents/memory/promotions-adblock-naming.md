---
name: Promotions / ad-blocker-safe naming (iseya)
description: Why the public "ads" surface is named "promotions"/"promos" and the design intent to preserve when touching it.
---

# Ad-blocker-safe naming for the internal-ads feature

The public-facing internal-ads surface uses **neutral "promotion/promo" naming**
so browser ad blockers (which filter URLs, DOM ids, and paths containing `ad`/`ads`)
don't hide it from real visitors.

**Design intent to preserve:**
- Anything a logged-out visitor's browser requests or renders (public endpoints,
  upload/image paths, component test ids, storage keys) must use promotion/promo
  naming, never `ad`/`ads`.
- Renames were made backward-compatible: the old public endpoint and old upload
  path are kept as aliases, and the static uploads mount serves the whole folder,
  so legacy DB rows keep resolving. Do not "clean up" by dropping those aliases.
- Admin-only screens can keep `ad` naming — they sit behind auth, so blockers
  never see them.

**Why:** ad blockers were hiding the banner/popup promos for real visitors.

**Coupling to watch:** the ad-media upload handler is shared by BOTH internal ads
AND hiring-company logos. If its destination folder changes, every image/logo URL
builder that references it must change in lockstep or those assets 404.
