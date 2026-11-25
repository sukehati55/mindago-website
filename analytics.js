(() => {
  "use strict";

  const MEASUREMENT_ID = "G-5T60FR1W0L";
  const STORAGE_KEY = "mindago_analytics_consent";
  const INTERNAL_KEY = "mindago_analytics_internal";
  const PUBLIC_PATHS = new Set([
    "/", "/books/", "/preschool-learning-app/", "/teaching-resources/",
    "/teaching-resources/az-letter-tracing-adventure/", "/teaching-resources/free-sample/",
    "/teaching-resources/pre-writing-adventure/", "/teaching-resources/minda-dots/",
    "/teaching-resources/minda-teaching-plain/", "/teaching-resources/minda-font-bundle/",
    "/teaching-resources/guides/pre-writing-strokes-preschool/",
    "/teaching-resources/guides/how-to-make-name-tracing-worksheets/"
  ]);
  const ITEM = { item_id: "mindago_founding50", item_name: "MindAgo Playroom — six months", price: 4.99, quantity: 1 };
  let initialized = false;
  let pageTracked = false;
  let pageConsent = null;

  function stored(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function permitted() {
    return location.protocol === "https:" && location.hostname === "mindago.my" &&
      PUBLIC_PATHS.has(location.pathname) && stored(INTERNAL_KEY) !== "true" &&
      navigator.globalPrivacyControl !== true && navigator.doNotTrack !== "1";
  }

  function safeReferrer() {
    try {
      const url = new URL(document.referrer);
      if (!/^https?:$/.test(url.protocol)) return "";
      return url.origin + (url.hostname === "mindago.my" && PUBLIC_PATHS.has(url.pathname) ? url.pathname : "/");
    } catch (_) { return ""; }
  }

  function sendEvent(name, parameters) {
    if (!permitted() || readConsent() !== "granted" || !window.__mindagoAnalyticsEnabled) return;
    window.gtag("event", name, { ...parameters, transport_type: "beacon" });
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  function loadAnalytics() {
    if (!permitted() || readConsent() !== "granted" || window.__mindagoAnalyticsEnabled) return;
    window.__mindagoAnalyticsEnabled = true;
    window["ga-disable-" + MEASUREMENT_ID] = false;

    if (initialized) {
      window.gtag("consent", "update", { analytics_storage: "granted" });
      return;
    }
    initialized = true;

    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: "granted",
      security_storage: "granted"
    });

    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: false,
      cookie_domain: "mindago.my",
      // Never send query strings, fragments, Auth tokens or email-link parameters.
      page_location: location.origin + location.pathname,
      page_referrer: safeReferrer()
    });

    if (!pageTracked) {
      pageTracked = true;
      sendEvent("page_view", { page_location: location.origin + location.pathname, page_referrer: safeReferrer() });
      if (location.pathname === "/" || location.pathname === "/preschool-learning-app/") {
        sendEvent("view_item", { currency: "USD", value: 4.99, items: [ITEM] });
      }
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    script.dataset.mindagoGa4 = "true";
    document.head.appendChild(script);
  }

  function saveConsent(value) {
    pageConsent = value;
    // Share only this adult website preference, never identifiers, with parent Checkout.
    if (location.protocol === "https:" && location.hostname === "mindago.my") {
      document.cookie = `mindago_analytics_consent=${value}; Path=/; Domain=mindago.my; SameSite=Lax; Secure`;
    }
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      // If storage is unavailable, honor the choice for this page only.
    }
  }

  function readConsent() {
    const shared = document.cookie.split(";").map(s => s.trim()).find(s => s.startsWith(STORAGE_KEY + "="))?.split("=")[1];
    // Existing website-only grants do not imply consent to the expanded adult
    // Checkout/purchase scope. Ask again if the shared session preference is absent.
    return (shared === "denied" || shared === "granted") ? shared : pageConsent ||
      (stored(STORAGE_KEY) === "denied" ? "denied" : null);
  }

  function stopAnalytics() {
    window.__mindagoAnalyticsEnabled = false;
    window["ga-disable-" + MEASUREMENT_ID] = true;
    window.gtag("consent", "update", { analytics_storage: "denied" });
    // Remove this site's GA cookies on withdrawal; do not touch authentication cookies.
    document.cookie.split(";").forEach((entry) => {
      const name = entry.trim().split("=")[0];
      if (!/^_ga(?:_|$)/.test(name)) return;
      for (const domain of ["", "; Domain=.mindago.my"]) {
        document.cookie = `${name}=; Max-Age=0; Path=/${domain}; SameSite=Lax; Secure`;
      }
    });
  }

  function injectStyles() {
    if (document.getElementById("mindago-analytics-consent-styles")) return;
    const style = document.createElement("style");
    style.id = "mindago-analytics-consent-styles";
    style.textContent = `
      .mindago-consent {
        position: fixed;
        left: 1rem;
        right: 1rem;
        bottom: 1rem;
        z-index: 10000;
        max-width: 760px;
        margin: 0 auto;
        padding: 1rem 1.1rem;
        border: 1px solid rgba(12, 48, 82, .16);
        border-radius: 18px;
        background: #fffdf7;
        color: #0c3052;
        box-shadow: 0 16px 40px rgba(12, 48, 82, .18);
        font: 500 0.95rem/1.45 var(--font-ui);
      }
      .mindago-consent p { margin: 0; }
      .mindago-consent strong { font-weight: 800; }
      .mindago-consent__actions {
        display: flex;
        flex-wrap: wrap;
        gap: .65rem;
        margin-top: .85rem;
      }
      .mindago-consent button {
        min-height: 44px;
        padding: .65rem 1rem;
        border-radius: 999px;
        border: 1px solid #1876b7;
        cursor: pointer;
        font: inherit;
        font-weight: 800;
      }
      .mindago-consent__allow {
        background: #1876b7;
        color: #fff;
      }
      .mindago-consent__essential {
        background: #fff;
        color: #0c3052;
      }
      .mindago-analytics-settings { display: block; margin: 1rem auto; min-height: 44px; padding: .5rem 1rem; border: 1px solid currentColor; border-radius: 999px; background: #fffdf7; color: #0c3052; font: inherit; cursor: pointer; }
      @media (max-width: 520px) {
        .mindago-consent { left: .65rem; right: .65rem; bottom: .65rem; }
        .mindago-consent__actions { flex-direction: column; }
        .mindago-consent button { width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  function showConsentBanner() {
    if (document.getElementById("mindago-analytics-consent")) return;
    injectStyles();

    const banner = document.createElement("aside");
    banner.id = "mindago-analytics-consent";
    banner.className = "mindago-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Analytics preferences");
    banner.innerHTML = `
      <p><strong>Help us improve MindAgo.</strong> Optional Google Analytics measures our public website and parent Checkout. It stays off unless you allow it; children's Playroom activity is not tracked. <a href="https://join.mindago.my/privacy">Privacy notice</a></p>
      <div class="mindago-consent__actions">
        <button type="button" class="mindago-consent__allow">Allow analytics</button>
        <button type="button" class="mindago-consent__essential">Essential only</button>
        <button type="button" class="mindago-consent__internal">Exclude this browser (team/testing)</button>
      </div>
    `;

    banner.querySelector(".mindago-consent__allow").addEventListener("click", () => {
      try { localStorage.removeItem(INTERNAL_KEY); } catch (_) { /* Stored exclusion remains fail-closed. */ }
      saveConsent("granted");
      banner.remove();
      loadAnalytics();
    });

    banner.querySelector(".mindago-consent__essential").addEventListener("click", () => {
      saveConsent("denied");
      stopAnalytics();
      banner.remove();
    });

    banner.querySelector(".mindago-consent__internal").addEventListener("click", () => {
      try { localStorage.setItem(INTERNAL_KEY, "true"); } catch (_) { /* Consent denial still stops this page. */ }
      saveConsent("denied");
      stopAnalytics();
      banner.remove();
    });

    document.body.appendChild(banner);
  }

  function addEventTracking() {
    document.addEventListener("click", (event) => {
      if (!window.__mindagoAnalyticsEnabled) return;
      const link = event.target.closest?.("a[href]");
      if (!link) return;
      let url;
      try { url = new URL(link.href, location.href); } catch (_) { return; }
      if (url.origin === "https://join.mindago.my" && /^\/founding50\/?$/.test(url.pathname)) {
        const placement = link.closest("header") ? "header" : link.closest("footer") ? "footer" : "content";
        sendEvent("founding50_cta_click", { cta_placement: placement, link_url: "https://join.mindago.my/founding50" });
        // This is a navigation click, NOT a Checkout Session or a purchase.
        return;
      }

      if (link.dataset.action === "buy" && link.dataset.product) {
        sendEvent("payhip_click", {
          product: link.dataset.product,
          link_url: url.origin + url.pathname
        });
        return;
      }

      if (link.dataset.action === "free-sample" && link.dataset.sample) {
        sendEvent("free_sample_download", {
          sample: link.dataset.sample,
          link_url: url.origin + url.pathname
        });
        return;
      }

      if (link.dataset.action === "free-sample-cta") {
        sendEvent("free_sample_cta_click", {
          placement: link.dataset.placement || "unknown",
          link_url: url.origin + url.pathname
        });
        return;
      }

      try {
        const url = new URL(link.href, window.location.href);
        if (/(^|\.)amazon\./i.test(url.hostname)) {
          sendEvent("amazon_click", {
            link_url: url.origin + url.pathname
          });
        }
      } catch (_) {
        // Ignore malformed URLs.
      }
    });
  }

  function init() {
    addEventTracking();
    // Honor a preference changed on the parent Checkout before more collection.
    window.addEventListener?.("focus", () => {
      if (readConsent() === "denied" && window.__mindagoAnalyticsEnabled) stopAnalytics();
    });
    injectStyles();
    const settings = document.createElement("button");
    settings.type = "button";
    settings.className = "mindago-analytics-settings";
    settings.textContent = "Analytics preferences";
    settings.addEventListener("click", showConsentBanner);
    (document.querySelector("footer") || document.body).appendChild(settings);
    const consent = readConsent();
    if (consent === "granted") {
      loadAnalytics();
    } else if (consent !== "denied") {
      showConsentBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
