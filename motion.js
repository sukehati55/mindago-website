/* MindAgo Motion System v1. No navigation, pricing or content mutations. */
(() => {
  const main = document.querySelector("main");
  if (!main) return;
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const primary = ["/", "/index.html", "/books/", "/books/index.html", "/teaching-resources/", "/teaching-resources/index.html"].includes(location.pathname);
  const hero = main.querySelector(".hero, .books-intro, .free-sample-hero, .guide-hero");
  const starPresets = [
    [28, "#F7DFA0", .62, 6.1, -1.3, 7],
    [14, "#C9E8F7", .43, 8.2, -4.1, 4],
    [22, "#D8EEDB", .58, 5.4, -2.7, 8],
    [18, "#F4D6E2", .54, 7.4, -5.2, 6],
    [34, "#E6DCF5", .65, 6.8, -3.6, 9],
    [12, "#FFE9B5", .39, 8.2, -6.3, 4],
    [24, "#D9F1FC", .68, 4.8, -2.2, 7],
    [16, "#F7DFA0", .48, 7.4, -4.8, 5],
    [20, "#F4D6E2", .57, 6.8, -1.9, 8],
    [14, "#D8EEDB", .42, 8.2, -7.1, 4],
  ];
  const starAnchors = [[.03,.09], [.96,.22], [.08,.78], [.92,.64], [.55,.04], [.27,.94], [.76,.92], [.02,.46], [.98,.86], [.80,.07]];
  let starfieldIndex = 0;
  const decorate = (region, quiet = false) => {
    const fieldIndex = starfieldIndex++;
    region.classList.add("motion-region");
    const layer = document.createElement("div");
    layer.className = `motion-stars${quiet ? " motion-stars--quiet" : ""}`;
    layer.setAttribute("aria-hidden", "true");
    for (let i = 0; i < (quiet ? 3 : 10); i++) {
      const [size, colour, opacity, duration, delay, drift] = starPresets[i];
      const fivePoint = [1, 3, 6, 9].includes(i);
      const star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      star.setAttribute("viewBox", "0 0 32 32");
      star.setAttribute("class", "motion-star");
      star.setAttribute("focusable", "false");
      star.setAttribute("aria-hidden", "true");
      star.style.cssText = `--star-size:${size}px;--star-colour:${colour};--star-opacity:${quiet ? opacity * .8 : opacity};--star-peak:${!quiet && i % 3 === 0 ? Math.min(.72, opacity + .1) : quiet ? opacity * .8 : opacity};--star-duration:${duration}s;--star-delay:${delay - fieldIndex * .83}s;--star-drift:${drift}px;--star-mobile-drift:${Math.max(2, drift / 2)}px;--star-rotation:${fivePoint ? 4 : 2.5}deg`;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", fivePoint
        ? "M16 1 L20.5 11 L31.5 12.1 L23.2 19.5 L25.6 30.3 L16 24.7 L6.4 30.3 L8.8 19.5 L.5 12.1 L11.5 11 Z"
        : "M16 0 L20 12 L32 16 L20 20 L16 32 L12 20 L0 16 L12 12 Z");
      path.setAttribute("fill", "currentColor");
      star.append(path);
      layer.append(star);
    }
    region.prepend(layer);
    // Place only in real empty space. Reserve the entire float/rotation envelope
    // and reveal travel, so stars cannot drift across copy, controls or artwork.
    const place = () => {
      const bounds = region.getBoundingClientRect();
      const mobile = window.innerWidth < 768;
      const count = quiet ? (mobile ? 2 : 3) : mobile ? 5 : window.innerWidth <= 1024 ? 8 : 10;
      const obstacles = [];
      const protect = rect => {
        if (rect.width && rect.height) obstacles.push({
          left:rect.left - bounds.left - 12, right:rect.right - bounds.left + 12,
          top:rect.top - bounds.top - 26, bottom:rect.bottom - bounds.top + 26,
        });
      };
      region.querySelectorAll("a, button, input, select, img, video, .card, .book-card, .guide-card, .hero-panel").forEach(element => protect(element.getBoundingClientRect()));
      const walker = document.createTreeWalker(region, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim() || node.parentElement.closest(".motion-stars, script, style")) continue;
        range.selectNodeContents(node);
        Array.from(range.getClientRects()).forEach(protect);
      }
      const occupied = [];
      Array.from(layer.children).forEach((star, index) => {
        star.style.visibility = "hidden";
        if (index >= count) return;
        const originalSize = starPresets[index][0] * (mobile ? .8 : quiet ? .75 : 1);
        const [ax, ay] = starAnchors[index];
        const candidates = [];
        for (let row = 0; row <= 24; row++) {
          for (let col = 0; col <= 20; col++) candidates.push([col / 20, row / 24]);
        }
        candidates.sort((a, b) => Math.hypot(a[0]-ax, a[1]-ay) - Math.hypot(b[0]-ax, b[1]-ay));
        for (const size of [originalSize, Math.min(originalSize, mobile ? 10 : 14)]) {
          const travel = mobile ? 5 : 10;
          const space = size * 1.12;
          const found = candidates.find(([cx, cy]) => {
            const x = 6 + cx * (bounds.width - space - 12);
            const y = 6 + cy * (bounds.height - space - travel - 12);
            return !obstacles.some(r => x < r.right && x + space > r.left && y < r.bottom && y + space + travel > r.top)
              && !occupied.some(p => Math.hypot(x-p[0], y-p[1]) < (mobile ? 58 : 90));
          });
          if (!found) continue;
          const x = 6 + found[0] * (bounds.width - space - 12);
          const y = 6 + found[1] * (bounds.height - space - travel - 12);
          star.style.width = `${size}px`;
          star.style.height = `${size}px`;
          star.style.left = `${x + size * .06}px`;
          star.style.top = `${y + size * .06}px`;
          star.style.visibility = "visible";
          occupied.push([x, y]);
          break;
        }
      });
    };
    let scheduled = false;
    const schedulePlacement = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; place(); });
    };
    if ("ResizeObserver" in window) new ResizeObserver(schedulePlacement).observe(region);
    window.addEventListener("resize", schedulePlacement, { passive:true });
    region.addEventListener("load", schedulePlacement, true);
    document.fonts?.ready.then(schedulePlacement);
    schedulePlacement();
  };
  if (hero) decorate(hero, !primary);
  if (primary) main.querySelectorAll("#printables, #guides, .books-section, .guides-section").forEach((region, index) => {
    if (index < 2) decorate(region, true);
  });
  main.querySelectorAll(".hero-migo, .hero-art > .migo, .books-intro-inner > img").forEach(element => element.classList.add("motion-float"));

  const cards = Array.from(main.querySelectorAll(".products > .card, .book-grid > .book-card, .books-more-grid > *, .book-benefit-grid > *, .faq-grid > details, .aids-grid > *, .guide-card[data-reveal], .why-item[data-reveal]"));
  cards.forEach(card => {
    // Reveal the group members, never both a card and its ancestor.
    let parent = card.parentElement;
    while (parent && parent !== main) { parent.removeAttribute("data-reveal"); parent = parent.parentElement; }
    card.setAttribute("data-reveal", "");
    const index = Array.from(card.parentElement.children).indexOf(card);
    card.style.setProperty("--reveal-delay", `${Math.min(index, 4) * 90}ms`);
  });
  main.querySelectorAll(".section-head, .section-heading, .cta, .detail-content > h2, .guide-article > h2, .books-intro-inner > div, .error-card").forEach(element => {
    if (!element.parentElement.closest("[data-reveal]")) element.setAttribute("data-reveal", "");
  });
  const reveals = Array.from(main.querySelectorAll("[data-reveal]"));
  let revealObserver;
  let ambientObserver;
  const reveal = element => { element.classList.add("is-visible"); revealObserver?.unobserve(element); };
  const showAll = () => {
    reveals.forEach(reveal);
    revealObserver?.disconnect();
  };
  if (!preference.matches && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, { threshold:0, rootMargin:"0px 0px -24px 0px" });
    document.documentElement.classList.add("motion-ready");
    reveals.forEach(element => revealObserver.observe(element));
    ambientObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle("motion-active", entry.isIntersecting));
    });
    main.querySelectorAll(".motion-stars, .motion-float").forEach(element => ambientObserver.observe(element));
  } else showAll();
  main.addEventListener("focusin", event => {
    let element = event.target.closest("[data-reveal]");
    while (element) { reveal(element); element = element.parentElement.closest("[data-reveal]"); }
  });
  preference.addEventListener("change", event => {
    if (event.matches) {
      showAll();
      ambientObserver?.disconnect();
      main.querySelectorAll(".motion-active").forEach(element => element.classList.remove("motion-active"));
    }
  });
})();
