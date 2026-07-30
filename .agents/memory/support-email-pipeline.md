---
name: Support email → ticket pipeline (iseya)
description: How support@iseya.ng inbound email becomes tickets; current blocker and pending user action.
---

# Support email → ticket pipeline

Chain: mail to support@iseya.ng → Postmark inbound → webhook `POST /api/webhooks/inbound-email?secret=...` (prod) → support ticket. Webhook + Postmark side confirmed working end to end (direct POST created a ticket).

**Blocker (as of 2026-07-30):** DNS. iseya.ng MX records conflict — a dead priority-0 record pointing at iseya.ng itself, plus Postmark and PrivateEmail tied at priority 10, so inbound mail never reliably reaches Postmark (Postmark inbound log: 0 messages). Two SPF TXT records also exist (invalid; hurts outbound deliverability).

**Decision:** user actively reads mail in PrivateEmail, so PrivateEmail keeps the domain MX; Postmark gets mail via mailbox-level forwarding of support@ to the server's hash address `c4af9ba719a7d1109398e2ea46cc2511@inbound.postmarkapp.com`. Postmark server InboundDomain was set to `iseya.ng` (harmless either way).

**Pending user action:** user is waiting for Namecheap's PrivateEmail→webmail migration before touching DNS/forwarding. Afterwards: delete priority-0 MX + Postmark MX, keep webmail MX, set up the forward, merge SPF into one record.

**Why:** two mail providers cannot share the same domain's MX; forwarding is the only clean way to feed Postmark while keeping a human-read inbox.

**Gotchas:** `INBOUND_EMAIL_SECRET` contains `&`/`@` so it breaks in URL query strings — the Postmark hook URL uses a different plain secret in the query param, which matches. `POSTMARK_SERVER_TOKEN` has a stray non-alphanumeric char; sanitize with `tr -cd 'a-zA-Z0-9-'` before use.
