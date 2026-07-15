document.documentElement.classList.add("has-js");

const navToggle = document.querySelector("[data-nav-toggle]");
const navigation = document.querySelector("[data-navigation]");

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
    if (event.key === "Escape") {
      setNavigationOpen(false);
      navToggle.focus();
    }
  });
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

    if (!alphaForm.checkValidity()) {
      alphaForm.reportValidity();
      return;
    }

    const message = alphaForm.querySelector("[data-form-message]");
    alphaForm.reset();
    message.hidden = false;
    message.focus();
  });
}
