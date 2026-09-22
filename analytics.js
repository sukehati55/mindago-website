(() => {
  "use strict";

  const MEASUREMENT_ID = "G-5T60FR1W0L";
  const STORAGE_KEY = "mindago_analytics_consent";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  function loadAnalytics() {
    if (window.__mindagoAnalyticsEnabled) return;
    window.__mindagoAnalyticsEnabled = true;

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
      allow_ad_personalization_signals: false
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    script.dataset.mindagoGa4 = "true";
    document.head.appendChild(script);
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      // If storage is unavailable, honor the choice for this page only.
    }
  }

  function readConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
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
        font: 500 0.95rem/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
      <p><strong>Help us improve MindAgo.</strong> We use optional Google Analytics to understand which pages are useful. Analytics stays off unless you allow it.</p>
      <div class="mindago-consent__actions">
        <button type="button" class="mindago-consent__allow">Allow analytics</button>
        <button type="button" class="mindago-consent__essential">Essential only</button>
      </div>
    `;

    banner.querySelector(".mindago-consent__allow").addEventListener("click", () => {
      saveConsent("granted");
      banner.remove();
      loadAnalytics();
    });

    banner.querySelector(".mindago-consent__essential").addEventListener("click", () => {
      saveConsent("denied");
      banner.remove();
    });

    document.body.appendChild(banner);
  }

  function addEventTracking() {
    document.addEventListener("click", (event) => {
      if (!window.__mindagoAnalyticsEnabled) return;
      const link = event.target.closest("a[href]");
      if (!link) return;

      if (link.dataset.action === "buy" && link.dataset.product) {
        window.gtag("event", "payhip_click", {
          product: link.dataset.product,
          link_url: link.href
        });
        return;
      }

      try {
        const url = new URL(link.href, window.location.href);
        if (/(^|\.)amazon\./i.test(url.hostname)) {
          window.gtag("event", "amazon_click", {
            link_url: url.href
          });
        }
      } catch (_) {
        // Ignore malformed URLs.
      }
    });
  }

  function init() {
    addEventTracking();
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