# Founding 50 final release preparation — 25 November 2026 (MYT)

## Authorized production change completed

Cloudflare account `69da4198c2c4ea41c5464f2e4e40c2bd`, mindago.my zone.
Single Redirect `28f6841e1f6145029c45ff226be07216`, enabled, order 1:

```
(http.host eq "www.mindago.my") or (http.host eq "mindago.my" and not ssl)
```

301 dynamic target `concat("https://mindago.my", http.request.uri.path)`;
Preserve query string ON. Exactly one of ten Free rules is used. No new cost.
The initial template's `http.request.scheme` was rejected before creating a rule;
the documented `ssl` Boolean is the supported replacement. Repository JSON and
contract test corrected to match the actual accepted rule.

Anonymous GET probes all passed: HTTP WWW root; HTTPS WWW root with query;
HTTP apex books; HTTPS WWW nested sample route with repeated query keys and
encoded slash; HTTP WWW nested guide with encoded spaces and return path. Each
gave exactly one 301 to the expected HTTPS apex URL, then 200. HTTPS apex was
200 without a redirect. Signup stayed 200; private Playroom still gave 302 to
its existing Cloudflare Access domain. DNS, SSL, Access, global HTTPS settings
and unrelated subdomains were not edited.

Rollback: disable only the named Single Redirect in the correct zone. Keep the
rule for reproducibility. No DNS/certificate/deployment rollback is necessary to
disable it. Existing website production rollback remains Pages deployment
`f3c2027a-0782-4ca6-9a9a-67c17a3d3070`, source main `4c124c3`.

## Website preview acceptance

PR #5 remains draft, targets main. Existing reviewed preview deployment
`a8970529-e707-47dc-8565-8d158e8df709` is source `211ec5c`:
https://a8970529.mindago-website.pages.dev/ . The final correction changes only
the redirect configuration/test and this evidence, not website presentation.

- PASS: all 12 canonical public pages return 200, match production canonicals,
  occur in the sitemap and have valid static metadata/internal links.
- PASS: nonexistent page returns 404; previews have Cloudflare's noindex header.
- PASS: all 12 pages at 390×844 and 1440×900 have no horizontal overflow or broken
  images (existing review evidence retained; presentation unchanged).
- PASS: final mobile menu opens, anchor navigation closes it and reaches the
  intended section. Resource-to-app contextual links remain readable.
- PASS: sample ZIP HEAD returns 200 application/zip.
- PASS: Essential-only, preference reopening and preview opt-in work; no Google
  tag loads on the preview, including after an opt-in.
- PASS: parent/terms/refunds/privacy/recovery destinations return 200. Normal
  Founding 50 CTA reaches the existing parent portal. No form was submitted,
  Checkout Session created, parent password changed or charge made.
- QUALIFIED: this is SEO/layout acceptance, not acceptance of every live payment
  entry path or proof of Google event ingestion. See the discrepancy below.

## Commercial reconciliation — no commercial changes made

Read-only Stripe checks used **MindAgo Direct** `acct_1UYP4ZElAOhWvGZo` only.
Product `prod_VZvakrDcHaaoRM`, default Price `price_1UYljpElAOhWvGZouyGbfjZ9`:
active, live, USD 499, one_time, recurring null. Payment Link line items confirm
one unit of this same price, fixed quantity, total 499. Metadata says six months.
The marketing copy, EN/BM terms, reserved Checkout submit text and deployed
entitlement code agree on US$4.99 paid once, six months from activation, no
automatic renewal, no lifetime access and 49 paid families plus one admin.

Deployed production repair version 22, bundle SHA-256
`4e4640dee71a663f557016f5324cba352f7da532fa4a9739f45bea463a7fe196`, was
inspected read-only. It grants from `now()` to UTC `interval '6 months'`, rather
than a fixed 180 days, and retries do not restart the grant. This matches the
terms' six calendar months from activation. No financial records were queried
or modified.

### Discrepancies requiring an owner decision

1. **Two payment-entry paths already exist.** The public homepage instructions
   and signup modal still link directly to active live Payment Link
   `plink_1UZlrfElAOhWvGZoPYvywb7t`, even though the terms describe authenticated,
   server-created reserved Checkout. That link is card-only, has a separate
   49-completed-session limit (currently 0), and provides parent/consent instructions
   as text; it does not itself invoke the server's verified-parent reservation
   endpoint. Do not infer a single shared prepayment inventory from those two
   limits. Existing database fulfillment protections remain unchanged.
2. **Analytics coverage follows the reserved path only.** PR #44 stores consent
   against a reservation and requires a converted, fulfilled reservation before
   reporting. Direct Payment Link purchases/refunds would not be reported, and
   those direct links do not call its begin_checkout hook. Choose one canonical
   payment journey before claiming end-to-end funnel acceptance. The smallest
   proposed correction is to route existing purchase links through the existing
   verified-parent reserved flow; no implementation/activation of that correction
   was performed in this task.
3. Refund/privacy policy banners still say “instant” activation, while Terms and
   the parent return flow correctly allow verification/recovery delay. Review
   that wording; no new activation SLA or commercial promise was introduced.

Stripe's price tax_behavior is unspecified and the existing link has automatic
tax off. This was not changed or interpreted as tax clearance by this review.
The reviewed link total is 499; no tax, invoicing or market configuration changed.

## GA4 privacy/configuration review — read-only

Existing property **555400548**, web stream **15826423060**, measurement ID
**G-5T60FR1W0L**, correct canonical stream URL https://mindago.my.

Observed settings:

| Setting | Current state |
| --- | --- |
| Enhanced Measurement | ON |
| Browser-history page views | ON |
| Scroll, outbound click, site search, form, video, download auto-events | All ON |
| Email redaction | ON |
| URL query-parameter redaction | OFF |
| Google signals | OFF (Turn on button shown) |
| User-provided data collection | OFF (Turn on button shown) |
| Granular location/device collection | ON |
| Event-data retention | 2 months |
| User-data retention | 14 months, reset on new activity ON |

No GA setting was saved or changed. These are observed settings, not a promise
that all data is deleted after two months: aggregated reporting has different
retention semantics. Do not put a blanket two-month deletion claim in the notice.

Before enabling the parent analytics candidate, approve and save an explicit
collection allowlist: disable automatic form, outbound URL, search-query, video,
download and history-change measurement, preferably the Enhanced Measurement
master switch. Automatic page-load measurement cannot be individually toggled;
the candidate's `send_page_view:false` plus one explicit sanitized page_view
controls it. Keep Google signals/user-provided data OFF, ads personalization
denied, and email redaction ON. Query-key redaction can be defense in depth for
email, access_token, refresh_token, token_hash, code, session_id and redirect_to;
the candidate strips the complete query/hash rather than relying on redaction.
Review turning off granular location/device collection for data minimization.
Do not turn on any email matching, hashed customer data or child tracking.

Candidate consent is optional, separate from parental terms/privacy consent;
GPC/DNT and opt-out are enforced. Only public adult pages are tagged. Apex and
join share consent/GA cookie domain `mindago.my`; there is no need to decorate
Stripe, Supabase, account-recovery or private Playroom links. The bilingual privacy
addition describes pseudonymous identifiers, transaction references, choices,
cross-border processing and withdrawal without inventing a retention period.

## Private Measurement Protocol secret — exact owner steps

1. Open Google Analytics → **MindAgo Website**, property **555400548** → Admin →
   Data collection and modification → Data streams → **MindAgo Website**, stream
   **15826423060**. Confirm Measurement ID **G-5T60FR1W0L** before continuing.
2. Open **Measurement Protocol API secrets** → **Create**. If Google requires a
   policy acknowledgement, review/accept it yourself as account owner. Suggested
   nickname: **MindAgo Founding 50 server analytics**. Create and copy the value
   privately. Do not send it in chat, a screenshot, logs, a URL or GitHub.
3. In Supabase, select **mindago-founding50-prod** (`khrcwdjizhlhlftmczlw`) →
   Edge Functions → Secrets:
   https://supabase.com/dashboard/project/khrcwdjizhlhlftmczlw/functions/secrets
   Add **FOUNDING50_GA4_API_SECRET** with that value and Save. These are project
   server-side Edge Function secrets; only repair consumes this new secret in
   the candidate. Never add it to public config.js, Flutter defines or Git.
4. Keep **FOUNDING50_ANALYTICS_ENABLED=false** and public **analyticsEnabled:false**
   (or absent) throughout configuration. Do not overwrite Stripe, DB, Access or
   other existing secrets. Secret changes can be read immediately by functions;
   saving a secret is not authorization to enable reporting or deploy code.
5. Report only **saved**. Verify secret presence/digest privately, not its value.
   After separate deployment/privacy approval, validate synthetic allowlisted
   payloads using Google's `/debug/mp/collect` validation endpoint, which does not
   collect them. Do not send simulated revenue to production `/mp/collect`.
   Verify optional browser consent and actual reporting before any activation
   approval; no charge or refund is authorized by these instructions.

Secret rollback: keep the analytics flag false, revoke only the newly created MP
secret if necessary, and remove that one Supabase analytics entry. Do not rotate
working Stripe keys or alter customer access. Do not blindly resend uncertain
analytics ledger rows; PR #44 documents the at-most-once dispatch tradeoff.

## Controls and release gates

PR #44 remains draft against **feat-instant-pay-and-play-activation**, not main,
at `cd527ad60a4394d3106b3bdddcbb6cb2e5145c56`; CI run 45628360988 is green.
Website prior candidate `211ec5c` CI run 45627471524 is green; the supported-field
correction needs its own final green CI before website merge approval.
The production repair bundle has **no** GA API-secret reference or analytics
flag consumer; PR #44 has not been deployed. Public signup config contains no
analyticsEnabled entry. Server purchase/refund analytics is therefore not active.

No website/application merge, production asset/function deployment, GA setting
mutation, secret creation, live charge/refund, entitlement change or new service.
All prior deployment rollback artifacts retained; unfinished Spatial work untouched.

Sources: [Cloudflare ssl field](https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/ssl/),
[redirect settings](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/),
[GA enhanced measurement](https://support.google.com/analytics/answer/9216061),
[Measurement Protocol secret](https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events),
[Supabase server secrets](https://supabase.com/docs/guides/functions/secrets).
