---
name: Payment verify security (iseya)
description: Ownership + amount checks and gateway unit differences for Paystack/Flutterwave verify endpoints in api-server routes.
---

# Payment verify endpoints must enforce ownership + amount

Every gateway `verify` handler (`/api/*/verify` in `artifacts/api-server/src/routes/routes.ts`)
must, before calling `storage.updateUser`/granting entitlement:

1. Confirm the transaction belongs to the session user:
   `if (String(metadata.userId) !== String(req.session.userId)) return 403`.
2. Validate amount + currency against the expected plan price, then reject mismatches.

**Why:** any authenticated user with a valid payment reference could otherwise trigger
an entitlement update / transaction row for the metadata user (broken access control),
or pay a smaller amount than the plan. The Flutterwave path had these checks; the
Paystack path was missing them and had to be patched to match.

**How to apply:** when adding a new paid feature or a second gateway, copy the
ownership + amount guard from the sibling gateway. Don't ship a verify handler
that trusts gateway metadata blindly.

## Gateway amount units differ
- **Paystack** `data.data.amount` is in **kobo**. Compare directly to the stored plan
  amount (also kobo, e.g. ₦2999 → `299900`).
- **Flutterwave** `data.data.amount` is in **naira**. Compare to `plan.amount / 100`.
Getting this backwards makes every real payment fail the amount check (or lets wrong
amounts through).
