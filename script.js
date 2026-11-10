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

const alphaForm = document.querySelector("[data-alpha-form]");

if (alphaForm) {
  alphaForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}


// ==========================================================================
// Gameplay Gallery Lightbox Dialog & Mobile Carousel
// ==========================================================================

const gameplayDialog = document.getElementById("gameplay-dialog");
if (gameplayDialog) {
  const dialogImg = gameplayDialog.querySelector("[data-dialog-img]");
  const dialogTitle = gameplayDialog.querySelector("[data-dialog-title]");
  const dialogBenefit = gameplayDialog.querySelector("[data-dialog-benefit]");
  const dialogClose = gameplayDialog.querySelector("[data-dialog-close]");

  const openLightbox = (btn) => {
    if (!dialogImg || !dialogTitle || !dialogBenefit) return;
    dialogImg.src = btn.dataset.zoomSrc;
    dialogImg.alt = btn.querySelector("img")?.alt || btn.dataset.zoomTitle;
    dialogTitle.textContent = btn.dataset.zoomTitle;
    dialogBenefit.textContent = btn.dataset.zoomBenefit;
    if (typeof gameplayDialog.showModal === "function") {
      gameplayDialog.showModal();
    } else {
      gameplayDialog.setAttribute("open", "");
    }
  };

  const closeLightbox = () => {
    if (typeof gameplayDialog.close === "function") {
      gameplayDialog.close();
    } else {
      gameplayDialog.removeAttribute("open");
    }
  };

  document.querySelectorAll("[data-zoom-src]").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(btn));
  });

  if (dialogClose) {
    dialogClose.addEventListener("click", closeLightbox);
  }

  gameplayDialog.addEventListener("click", (e) => {
    const rect = gameplayDialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && gameplayDialog.open) {
      closeLightbox();
    }
  });
}

const carouselTrack = document.querySelector("[data-carousel-track]");
const carouselPrev = document.querySelector("[data-carousel-prev]");
const carouselNext = document.querySelector("[data-carousel-next]");
const carouselDots = document.querySelectorAll("[data-carousel-dots] [data-slide-index]");

if (carouselTrack) {
  const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const getScrollBehavior = () => (prefersReducedMotion() ? "auto" : "smooth");

  const getCardWidth = () => {
    const card = carouselTrack.querySelector(".gameplay-card");
    return card ? card.offsetWidth + 20 : 320;
  };

  if (carouselPrev) {
    carouselPrev.addEventListener("click", () => {
      carouselTrack.scrollBy({ left: -getCardWidth(), behavior: getScrollBehavior() });
    });
  }

  if (carouselNext) {
    carouselNext.addEventListener("click", () => {
      carouselTrack.scrollBy({ left: getCardWidth(), behavior: getScrollBehavior() });
    });
  }

  carouselDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.dataset.slideIndex, 10);
      const cards = carouselTrack.querySelectorAll(".gameplay-card");
      if (cards[index]) {
        cards[index].scrollIntoView({ behavior: getScrollBehavior(), inline: "center", block: "nearest" });
      }
    });
  });

  let scrollTimeout;
  carouselTrack.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollCenter = carouselTrack.scrollLeft + carouselTrack.offsetWidth / 2;
      const cards = Array.from(carouselTrack.querySelectorAll(".gameplay-card"));
      let closestIdx = 0;
      let minDiff = Infinity;
      cards.forEach((card, idx) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const diff = Math.abs(scrollCenter - cardCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      carouselDots.forEach((dot, idx) => {
        const isActive = idx === closestIdx;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", String(isActive));
      });
    }, 60);
  }, { passive: true });
}
