# MindAgo Marketing Website

A fast, accessible, framework-free landing page for `https://mindago.my/`. The website uses plain HTML, CSS, and minimal vanilla JavaScript. It has no package dependencies and requires no build step.

## File structure

```text
mindago_website/
  index.html             Main landing page (MindAgo Playroom & Founding 50 Early Access)
  styles.css             Responsive layout and brand styling
  script.js              Mobile navigation and logo fallback
  404.html               Cloudflare Pages not-found page
  robots.txt             Search crawler rules
  sitemap.xml            Public site map
  README.md              Setup and deployment notes
  books/                 Migo's Adventures activity books
  teaching-resources/    Minda fonts, printable worksheets, and teaching guides
  assets/
    branding/            Official MindAgo logo
    screenshots/         Approved Playroom marketing preview
    characters/          Approved Migo, Professor Mindy, and Knowledge Egg artwork
    icons/               Future approved site icons
```

## Local preview

No build is needed. Run a basic local web server from this folder so links and assets behave as they will in production.

With Python installed:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080/`.

Opening `index.html` directly also displays the page, but a local server is recommended for reliable 404, path, and asset testing.

## Cloudflare Pages deployment

### Git integration

1. Push the workspace to the repository used for the website.
2. In Cloudflare Pages, choose **Create a project** and connect the repository.
3. Set the project root directory to `website/mindago_website` when deploying from the MindAgo Studio workspace.
4. Select **None** or no framework preset.
5. Leave the build command empty.
6. Set the build output directory to `.`.
7. Deploy and connect the custom domain `mindago.my`.
8. Confirm that Cloudflare redirects HTTP to HTTPS and that `https://mindago.my/sitemap.xml` is reachable.

### Direct upload

The complete `mindago_website` folder can also be uploaded directly to Cloudflare Pages. No generated output folder is required.

## Replacing production assets

### Logo

The official logo is stored at:

```text
assets/branding/mindago_logo.svg
```

Keep that path and filename when replacing the export. Preserve the SVG aspect ratio, transparent background, embedded colours, and clear space. The header and 404 page show a text-based MindAgo fallback if the SVG cannot load.

### Production imagery

The homepage uses these approved assets directly:

```text
assets/screenshots/playroom_25d_revamped.png
assets/characters/migo_default_1024.png
assets/characters/mindy_welcome_warm_1024.png
assets/characters/knowledge_egg_default_1024.png
```

Keep these paths stable when replacing approved exports. The Playroom image must retain its 1810:869 aspect ratio, and character files must retain transparent backgrounds. Update meaningful alt text whenever the visible content changes materially. Do not use modeling sheets, lesson screenshots, or unapproved drafts on the public site.

## Founding 50 Early Access links

All early-access call-to-action buttons on `mindago.my` point to the Founding 50 onboarding portal at `https://join.mindago.my/founding50`, with footer and policy links referencing:

- `https://join.mindago.my/founding50` (Founding 50 registration)
- `https://join.mindago.my/account.html` (Parent account & password recovery)
- `https://join.mindago.my/terms` (Terms & Conditions)
- `https://join.mindago.my/refunds` (Refund & Cancellation Policy)
- `https://join.mindago.my/privacy` (Privacy & Child Data Notice)
- `https://join.mindago.my/seller` (Seller Information / Maklumat Penjual)

## Release checks

- Verify every `href` fragment points to an existing ID.
- Confirm all local files referenced by HTML and CSS exist.
- Test 375px, 390px, 768px, 1024px, and 1440px viewport widths.
- Check keyboard navigation, visible focus, and the mobile menu.
- Validate `index.html`, `404.html`, `robots.txt`, and `sitemap.xml` after any structural change.
