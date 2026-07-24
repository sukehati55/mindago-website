document.documentElement.classList.add("has-js");

const navToggle = document.querySelector("[data-nav-toggle]");
const navigation = document.querySelector("[data-navigation]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (navToggle && navigation) {
  const setNavigationOpen = (isOpen) => {
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.querySelector(".nav-toggle-label").textContent = isOpen
      ? "Close menu"
      : "Menu";
    navigation.classList.toggle("is-open", isOpen);
  };

  navToggle.addEventListener("click", () => {
    setNavigationOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setNavigationOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
      setNavigationOpen(false);
      navToggle.focus();
    }
  });
}

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.button !== 0) {
    return;
  }
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const target = document.querySelector(link.getAttribute("href"));
  if (!target) {
    return;
  }

  event.preventDefault();
  target.scrollIntoView({
    behavior: reducedMotion.matches ? "auto" : "smooth",
    block: "start",
  });
  window.history.pushState(null, "", link.getAttribute("href"));
});

if (navigation && "IntersectionObserver" in window) {
  const navLinks = Array.from(navigation.querySelectorAll('a[href^="#"]'));
  const trackedSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const visibleSections = new Set();

  const setActiveNavigation = (sectionId) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target);
        } else {
          visibleSections.delete(entry.target);
        }
      });

      const activeSection = trackedSections.find((section) => visibleSections.has(section));
      setActiveNavigation(activeSection?.id);
    },
    { rootMargin: "-22% 0px -62% 0px", threshold: 0 },
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll("[data-brand-logo]").forEach((logo) => {
  const fallback = logo.parentElement.querySelector("[data-brand-fallback]");
  const showFallback = () => {
    logo.hidden = true;
    if (fallback) {
      fallback.hidden = false;
    }
  };

  logo.addEventListener("error", showFallback, { once: true });
  if (logo.complete && logo.naturalWidth === 0) {
    showFallback();
  }
});

const revealElements = document.querySelectorAll("[data-reveal]");

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const alphaForm = document.querySelector("[data-alpha-form]");

if (alphaForm) {
  alphaForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}
