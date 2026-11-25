# Founding 50 purchase journey companion

Review-only branch stacked on the accepted SEO/analytics candidate `83215ee`.
The accepted SEO PR remains unchanged. Application companion is Playroom PR #44;
its target remains `feat-instant-pay-and-play-activation`.

All public Founding 50 purchase links now lead to
`https://join.mindago.my/founding50`. Parents create/verify their adult account or
sign in, select an approved billing country, accept terms and parental privacy
consent, then request reserved Stripe Checkout. Availability is checked before
payment; the server sets the verified parent email. No email is put in links.

Commercial terms are unchanged: US$4.99 once, six calendar months from activation,
49 paying families plus the separate administrator, no automatic renewal or
lifetime access, three-calendar-day voluntary full refund subject to statutory
rights. Activation follows payment and eligibility verification; delays are
possible. Check membership or contact support without paying again.

The old Stripe Payment Link has NOT been changed or deactivated. Backend legacy
fulfillment and refund/recovery remain available. It cannot enforce parent
verification, consent or shared reserved inventory before payment. Do not start
acquisition until the replacement is hosted-verified and the owner approves
retiring public use of the old link. This branch does not deploy production.

Analytics remains optional and follows the existing consent gate. CTA clicks are
navigation, not payment. `begin_checkout` is emitted only by the parent portal
after a validated server Checkout URL. Purchase/refund events require verified
server proof, pre-payment optional consent and durable transaction-ID dedupe;
they remain disabled pending configuration and validation. Never forward email,
child data, Auth fragments or arbitrary queries. Operational sales monitoring
must cover legacy and reserved sessions separately from consented GA reporting;
see `docs/FOUNDING_50_PURCHASE_JOURNEY.md` in Playroom PR #44.

Release: review both companions, deploy the tested application before changing
website production CTAs, verify the hosted journey without unauthorized charges,
then obtain final cutover approval. Keep prior website/parent portal/function
artifacts; rollback does not delete orders, holds or entitlements. No Stripe
Payment Link state, Access policy, credentials or payment flags change here.
