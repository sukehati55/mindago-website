# First 10 families — SEO and analytics repair (25 November 2026)

Review candidate on `codex/first10-seo-analytics`, based on website main
`4c124c369ab686ad59bcd8d85d0c3517e75cf99b`. No production deployment or dashboard
settings change is included. Existing pricing remains US$4.99 once for six
calendar months, 49 paying families plus the administrator.

## Confirmed evidence, distinct from hypotheses

| Check | Before | Candidate / outcome |
| --- | --- | --- |
| HTTPS www root; HTTP www resource path | HTTP 522 | Exact-host 301 rule prepared; **not applied** |
| WWW DNS / Pages origin | Proxied CNAME to apex; only apex registered on Pages | Root cause confirmed from DNS and Pages custom domains |
| TLS | Active wildcard/apex Universal and backup certificates | No certificate failure; do not replace certificates |
| Rules | 0 Single Redirects, 0 Page Rules | Add one narrowly scoped edge redirect after approval |
| All 12 canonical marketing pages | 200, useful static HTML, title/description/canonical, mobile viewport | Still pass; no claim they were broken or soft 404s |
| Deliberately nonexistent page | 404, noindex 404 template | Preserved |
| Sitemap | 12 canonical public URLs | Same 12; no auth, Checkout or Playroom URLs added |
| Preschool app contextual discovery | One incoming page link | Resource/book pages now add relevant app links |
| GA4 | Correct existing ID, optional-consent loader; no Founding 50 funnel | Explicit consented page/item/CTA events and revocable preferences |
| Purchase reporting | Signup app separate; no verified GA integration | Separate review-only companion PR in owning Playroom repository |

Cloudflare account/zone read-only audit: apex points to `mindago-website.pages.dev`,
www to `mindago.my`, join to its existing signup Pages project. Pages has only
the apex custom domain, Active with SSL. Always Use HTTPS is off; do not toggle it
globally because unrelated protected/transactional subdomains share the zone.
Existing website production rollback deployment observed in Pages:
`f3c2027a-0782-4ca6-9a9a-67c17a3d3070`.

Cloudflare documents that a DNS CNAME without the Pages custom-domain association
can return 522. For this site, WWW is only a redirect hostname: intercepting it
at the edge avoids the unregistered Pages-origin route. No DNS migration or new
hosting service is needed. [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/),
[WWW redirects](https://developers.cloudflare.com/pages/how-to/www-redirect/).

Google's “discovered, not indexed” and the owner's supplied Search Console counts
do not prove a render/robots/canonical defect. This audit found no such defect on
the five flagged pages. Content differentiation and stronger internal discovery
are improvements, not promises of indexing, ranking or ten customers.

## Public page audit

All rows: static HTML, 200 in the production baseline, unique title/description,
self-canonical, public indexing allowed, in the sitemap, crawlable incoming links,
substantive existing content, no observed soft-404 signature. All are checked by
`scripts/audit_site.py`; the word-count threshold is a regression heuristic, not
a search-engine quality score.

| Page | Specific change |
| --- | --- |
| `/` | Clear preschool-app H1; existing offer/screenshots preserved |
| `/preschool-learning-app/` | Distinct maths/phonics/tracing title |
| `/books/` | Distinct preschool activity-book title; contextual app link |
| `/teaching-resources/` | Printable-to-app contextual link |
| `/teaching-resources/az-letter-tracing-adventure/` | Letter/tracing follow-up link |
| `/teaching-resources/free-sample/` | Free sample to app link; downloads unchanged |
| `/teaching-resources/pre-writing-adventure/` | Pre-writing follow-up link |
| `/teaching-resources/minda-dots/` | Tracing practice follow-up link |
| `/teaching-resources/minda-teaching-plain/` | Handwriting follow-up link |
| `/teaching-resources/minda-font-bundle/` | Printable learning follow-up link |
| `/teaching-resources/guides/pre-writing-strokes-preschool/` | Guide-to-app follow-up link |
| `/teaching-resources/guides/how-to-make-name-tracing-worksheets/` | Guide-to-app follow-up link |

No new marketing pages, redesign, keyword stuffing, fabricated testimonials or
claims about guaranteed educational outcomes. Existing product, sample, Amazon,
Payhip, authentication and Founding 50 links remain unchanged.

Robots on the public website still allow all marketing routes. New source-only
`/docs/`, `/scripts/`, `/tests/`, `/integrations/` exclusions and noindex headers
keep repository tooling out of indexing. They are not access controls. Join's
transactional page intentionally remains noindex/nofollow. Playroom stays behind
Cloudflare Access. The Cloudflare-managed AI-training crawler rules seen on join
and play do not mean Google Search is blocked from the public marketing site.

## Analytics contract and privacy

Existing property **555400548**, stream **15826423060**, ID **G-5T60FR1W0L**.
Dashboard shows no data in the past 48 hours. Existing consent and sparse real
traffic may explain low counts; this is not evidence to remove consent.

| Event | Trigger |
| --- | --- |
| `page_view` | Once per consented canonical public page, sanitized URL/referrer |
| `view_item` | Home/app sales page; fixed Founding 50 item, USD 4.99 |
| `founding50_cta_click` | Exact join Founding 50 link; header/footer/content placement |
| Existing resource events | Existing Payhip, free sample and Amazon interactions; sanitized URL |
| `begin_checkout` | Companion only, after server-approved Checkout URL |
| `purchase`, `refund` | Companion only, verified provider payment/refund and durable server dedupe |

No browser `purchase`, even if a URL says `paid=true` or `checkout=success`. Do
not count a CTA as Checkout or purchase. Existing events keep their names.
There is no GA collection on localhost, deployment previews, unknown/private
routes, join or play from this website tag. Query strings, fragments and full
external referrers are excluded. No form values or customer/child data are read.
Consent preferences are available in the footer, including Essential-only and
Exclude this browser for team testing. GPC/DNT override stored consent. Internal
exclusion uses local browser storage, not a personal identifier or a required
fixed home IP. Repeat opt-in does not duplicate tags/page views.

The expanded scope requires fresh consent from legacy website-only opt-ins. A shared session consent cookie and parent-domain GA cookie allow apex-to-join
continuity only after optional adult consent. Do not decorate Stripe or private
Playroom URLs. The companion has a separate default-off rollout and bilingual
privacy additions; it introduces no payment or membership dependency on GA.

Future demo contract **only**, no demo implemented: `demo_start` after an adult
explicitly starts a public demo and `demo_complete` after its actual completion,
each once per demo attempt; allowlist a static `demo_id`, never child answers,
names or profile IDs. Neither event is purchase revenue. Add implementation tests
when an actual demo exists instead of emitting fabricated events now.

## Required dashboard changes — separate approval

1. Cloudflare → correct mindago.my zone → Rules → Redirect Rules → Single Redirect.
   Create the reviewed `integrations/cloudflare-canonical-redirect.json` rule.
   Match exact WWW on HTTP/HTTPS and exact apex on HTTP only; 301 to
   `concat("https://mindago.my", http.request.uri.path)` with query preservation.
   Keep existing proxied DNS. Do not edit join/play, Access, certificates or the
   global HTTPS switch. Recheck root and nested paths with multiple/encoded query
   parameters; apex HTTPS must not match. Disable just this rule to roll back.
2. In the existing GA stream, **Enhanced Measurement is currently enabled**.
   Before parent analytics goes live, disable automatic form/outbound/history
   collection in favor of the explicit allowlist. Email redaction is enabled;
   keep it as defense in depth, not a substitute for safe payloads. No advertising
   signals or user-provided data collection. Review/create the private MP secret
   only through the companion's approved rollout. Do not paste secrets in PRs.
3. Review `purchase` as the revenue key event after verified reporting is enabled.
   CTA/Checkout can be inspected as funnel steps, not additional sales. Verify
   reports/Realtime/DebugView after approved deployment; local tests alone do not
   establish production GA ingestion. Search Console sitemap is already read;
   after release, request indexing for the improved public pages if appropriate.

## Verification and rollout

Run `python scripts/audit_site.py`, `node --test tests/*.test.cjs`,
`git diff --check`. Optional `--live --output .qa/live.json` records HTTP evidence
read-only. `.qa/` and screenshots stay out of Git. Browser checks use 390×844 and
1440×900, all 12 pages, with images, readable headings, links and horizontal
overflow checks. Test local/Cloudflare branch preview; analytics must remain off
on both. A mock checkout return is not a real purchase test.

The redirect tests validate the reviewed contract; they **do not prove an
unapplied Cloudflare rule works live**. Validate live 301s only after separate
approval. Retain the prior Pages deployment. Merge/deploy only after review;
roll back the Pages release via the existing retained deployment and disable the
new redirect separately if necessary. Signup, Stripe, Access and paid data are
not modified by this website PR.
