# Teaching Resources SEO sprint — 23 September 2026

## Scope and files

Created three product pages, one practical guide and shared `teaching-resources/detail.css`. Updated `teaching-resources/index.html` and `sitemap.xml`. This report records the final metadata and validation.

Homepage, Books, Amazon links, existing CSS, font binaries, character assets and `robots.txt` are unchanged. No JavaScript, tracking service or dependency was added. Purchase anchors include `data-product` and `data-action="buy"` attributes only.

## Page metadata

### teaching-resources/index.html

- URL / canonical: https://mindago.my/teaching-resources/
- Title: Handwriting & Tracing Fonts for Preschool Teachers | MindAgo
- Description: Discover Minda Teaching Plain and Minda Dots, child-friendly handwriting and tracing fonts for preschool worksheets, homeschool activities and teaching resources.
- H1: Handwriting & Tracing Fonts for Bright Little Learners

### teaching-resources/minda-dots/index.html

- URL / canonical: https://mindago.my/teaching-resources/minda-dots/
- Title: Minda Dots – Tracing Font for Preschool & Kindergarten | MindAgo
- Description: Minda Dots is a dotted tracing font for preschool and kindergarten handwriting worksheets, letter practice, name tracing and teaching resources.
- H1: Minda Dots: A Dotted Tracing Font for Early Handwriting Practice

### teaching-resources/minda-font-bundle/index.html

- URL / canonical: https://mindago.my/teaching-resources/minda-font-bundle/
- Title: Minda Handwriting & Tracing Font Bundle for Teachers | MindAgo
- Description: Get Minda Teaching Plain and Minda Dots together for handwriting modelling, tracing worksheets and early-learning teaching resources.
- H1: Minda Handwriting & Tracing Font Bundle

### teaching-resources/minda-teaching-plain/index.html

- URL / canonical: https://mindago.my/teaching-resources/minda-teaching-plain/
- Title: Minda Teaching Plain – Handwriting Font for Kids & Teachers | MindAgo
- Description: Minda Teaching Plain is a child-friendly handwriting font for preschool and kindergarten worksheets, letter modelling and classroom teaching resources.
- H1: Minda Teaching Plain: A Child-Friendly Handwriting Font for Teaching

### teaching-resources/guides/how-to-make-name-tracing-worksheets/index.html

- URL / canonical: https://mindago.my/teaching-resources/guides/how-to-make-name-tracing-worksheets/
- Title: How to Make Name Tracing Worksheets for Preschool | MindAgo
- Description: Learn how to create simple name tracing worksheets for preschool using a clean handwriting model and dotted tracing letters.
- H1: How to Make Name Tracing Worksheets for Preschool

## Discovery and structured data

| Page | Product | BreadcrumbList | Open Graph / Twitter | Incoming internal link | Sitemap |
| --- | --- | --- | --- | --- | --- |
| Teaching Resources | Not applicable | Not added | Yes | Existing homepage / Books | Yes |
| Minda Dots | Yes | Yes | Yes | Category, Plain, Bundle, guide | Yes |
| Minda Teaching Plain | Yes | Yes | Yes | Category, Dots, Bundle, guide | Yes |
| Minda Font Bundle | Yes | Yes | Yes | Category, Dots, Plain, guide | Yes |
| Name Tracing Guide | Not applicable | Yes | Yes | Category and all three products | Yes |

All five pages use one self-referencing trailing-slash canonical and `index, follow`. New pages include visible breadcrumbs. Product offers specify USD, the approved current prices, InStock and NewCondition. No reviews or ratings were added. All content and links are static HTML.

No suitable genuine font promotional images were found in the repository. Product `image` and social image fields are intentionally omitted. Existing real webfonts power all specimens; no images were scraped or invented.

## Purchase destinations

- Minda Dots: https://payhip.com/b/9gBRV — website $4.99.
- Minda Teaching Plain: https://payhip.com/b/frC05 — website $2.99.
- Minda Font Bundle: https://payhip.com/b/kgj7A — website $6.99; $0.99 savings.

All three destinations opened the correct live product in the browser. No purchase was made.

**Pricing correction:** Payhip is officially priced in USD. The website and Product schema now use Dots $4.99, Plain $2.99 and Bundle $6.99. The separate-price total is $7.98, giving savings of $0.99. This supersedes the original SEO sprint pricing.

**Coverage review remains separate:** the previously observed Payhip descriptions claim punctuation, symbols and accented characters beyond the verified website set. No such claims were added to the website. Payhip was not edited.

## Validation

- Seven site HTML pages checked for balanced tags, duplicate IDs and local paths; 156 local path/fragment/font references passed.
- Referenced local stylesheets and image paths responded successfully through the preview server.
- Eight JSON-LD blocks parsed across the site, including seven new blocks (three Products and four BreadcrumbLists). Product names, prices, currency, URLs and breadcrumb positions checked.
- Sitemap parses with seven distinct URLs, preserving the three existing entries. Robots continues allowing indexing and points to the sitemap.
- Guide article: 1,033 words, excluding the header, hero, navigation and footer.
- Category and all four new pages checked at 360, 390, 768, 1280 and 1440 logical pixels: no horizontal overflow; specimens fit; visible buttons at least 44 px tall; compact logo/header maintained. Mobile/desktop screenshots inspected for readable headings and real font rendering.
- HTML checks use Python HTMLParser and lxml, not a W3C conformance certification. JSON checks validate syntax and intended fields, not a guarantee of Google rich-result eligibility or indexing.
- Git diff reviewed; `git diff --check` passed before commit. Temporary generators, check scripts and preview artifacts remain outside the repository.

Deployment is verified separately after pushing the reviewed commit to `main`.
