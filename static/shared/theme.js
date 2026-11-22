/* Shared theme controller: follows OS preference by default, with manual override. */

(() => {
  const STORAGE_KEY = "site-theme";
  const VALID = new Set(["system", "light", "dark"]);
  const root = document.documentElement;

  function applyTheme(mode) {
    const next = VALID.has(mode) ? mode : "system";
    if (next === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", next);
    }

    document.querySelectorAll("[data-theme-set]").forEach((btn) => {
      const isSelected = btn.getAttribute("data-theme-set") === next;
      btn.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function currentTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return VALID.has(saved) ? saved : "system";
    } catch {
      return "system";
    }
  }

  function setTheme(mode) {
    try {
      if (mode === "system") {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch {
      // Ignore storage errors in private browsing modes.
    }
    applyTheme(mode);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(currentTheme());

    document.querySelectorAll("[data-theme-set]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setTheme(btn.getAttribute("data-theme-set"));
      });
    });
  });
})();
