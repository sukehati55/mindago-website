# Founding 50 — Direct Stripe checkout website handoff

**Status: DRAFT. Not deployed; no live Stripe link attached.**

## Why direct Stripe?

The earlier Payhip checkout via Stripe showed a UK-platform → Malaysia-connected-account **application-fee** limitation. The direct first-party Stripe checkout on a **standalone merchant account** should avoid Payhip's Connect application fees. It does **not** avoid Stripe's own normal processing fees, tax rules or merchant identity verification.

**Important account caution:** The owner's current Stripe account switcher is labelled `mindago.my` with `Payhip` underneath. It *may* be platform-controlled, although the Dashboard shows “Create payment link”. Stripe recommends creating a new direct Stripe account for an independently developed integration when the existing account was created while onboarding to a platform: https://support.stripe.com/questions/platform-controls-for-connected-accounts . The owner can add a second account under the same Stripe login: https://support.stripe.com/questions/create-and-manage-multiple-stripe-accounts . Confirm account capabilities, Malaysia merchant verification, live charges, payouts and API keys before proceeding. Do not disconnect or delete Payhip's account as part of this work.

## Marketing site

- Branch: `feature/founding-50-stripe-direct` in `sukehati55/mindago-website`.
- New route: `/founding-50/`, HTML + CSS, uses approved existing logo, Migo/Mindy and production Playroom preview assets.
- Homepage navigation and hero link to the Founding 50 page on this review branch.
- The buy button is **disabled**; the page explicitly says no sales and uses `noindex` until launch.
- Owner-approved offer: **USD $4.99 once**, **49 buyer families + 1 administrator Access seat**, Playroom updates while the service operates (not all other MindAgo products).
- Once live: replace disabled buttons with approved direct Stripe checkout URL or a trusted session-creation endpoint. Do **not** modify site to grant membership based on redirect/payment success URL.
- Publish final privacy, support, refund and paid-alpha terms before opening payments. Remove `noindex` only on final launch approval.
- Validate screenshots at 360, 390, 768, 1024 and 1440 px, keyboard access, no overflow, character image assets and link targets. Page is standalone and should work without JS.

## Payment backend

Detailed work issue in the Playroom repo:
`https://github.com/sukehati55/mindago-playroom/issues/4`.

- Prefer direct Stripe one-time Payment Link **only if** it can be configured to cap **49 completed sessions** on this account and if seller accepts that the cap limits transactions, not distinct-family identities. A fully strict “49 distinct paid families before charge” guarantee requires transactional seat reservation and server-created Checkout Sessions (or refunds and duplicates handled after static link charges).
- Stripe dashboard allows payment links; **do not publish** any link until signed backend webhook, entitlement and Cloudflare buyer-policy provisioning are deployed/tested.
- Signed Stripe webhook → verified paid Checkout Session/PaymentIntent → private ledger → Supabase family entitlement + Cloudflare production-only buyer allow policy → owner alerts/retries/refunds. Preserve admin and keep preview Access separate.
- Existing Playroom PR #3 has generic 49-seat & Cloudflare logic, but Payhip webhook isn't reusable as a Stripe payment proof. Keep Payhip integration draft unmerged while the plan changes.
- Public parent account onboarding must use the same checkout email and be available outside protected Playroom.
- Stripe test-mode payment and refund plus 1 controlled real purchase (separate, authorized buyer) must prove 24/7 self-service before activating live CTA.

## Operator actions still needed

1. In Stripe account switcher, confirm whether `mindago.my — Payhip` is platform-controlled. If yes, create a separate **direct** MindAgo account under the same login and complete Malaysia merchant activation. Otherwise verify the current account's independent keys and live charge permissions.
2. In direct account's **test mode**, create the exact USD4.99 one-time product/price; only after test integration use a 49-completed-sessions Payment Link if appropriate. Never paste API keys into public website source.
3. Connect Stripe plugin to the desired account if available for read-only review and permitted checkout setup; use production secrets only in a secure backend service.
4. Review the GitHub draft PR before any website merge/deploy; create backend staging and controlled Stripe tests separately.

**Current facts:** the user has installed the Stripe plugin; its action methods have not yet appeared in this response's tool inventory, so this draft did not create a Stripe product, price or Payment Link. No user payment data accessed.
