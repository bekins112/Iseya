---
name: Job-Aid benefit model
description: How Job-Aid plan benefits split into numeric quota vs boolean toggle, and the settings-coercion gotcha.
---

Job-Aid plan benefits are stored as `jobaid_{plan}_{benefit}` platform-settings keys and split into two kinds:

- Quota benefits (`recommendations`, `referrals`, `interview_booking`): store a numeric string ("the number of times"). API exposes `limit: number` and derives `included = limit > 0`. Displayed on the applicant plans page as a count next to the label.
- Toggle benefits (`cv_refining`, `verification`, `priority_support`): store "true"/"false". API exposes `included: boolean`, `limit: null`.

**Why / gotcha:** the admin-settings PATCH handler coerces every key in `BOOLEAN_SETTINGS_KEYS` to "true"/"false". If a quota key is left in that set it silently becomes a boolean and the count is lost. So quota keys must be excluded from the boolean set, and their integer/non-negative validation belongs in the numeric branch of the settings PATCH handler (mirroring job_limit_/interview_credits_).

**How to apply:** when adding another numeric-valued plan setting, keep it out of the boolean set and add an integer/range check in the settings PATCH numeric branch; the client `<Input type="number">` alone does not protect against direct API calls.
