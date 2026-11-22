/* Ephemeral Fyluro accent switcher (remove once final accent is settled). */

(() => {
  const STORAGE_KEY = "fyluro-accent-preview";
  const VALID = new Set(["forest", "amber", "terracotta", "slate"]);
  const root = document.documentElement;
  const fallback = root.getAttribute("data-accent") || "forest";

  function applyAccent(name) {
    const next = VALID.has(name) ? name : fallback;
    root.setAttribute("data-accent", next);

    document.querySelectorAll("[data-accent-set]").forEach((btn) => {
      const isSelected = btn.getAttribute("data-accent-set") === next;
      btn.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function currentAccent() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return VALID.has(saved) ? saved : fallback;
    } catch {
      return fallback;
    }
  }

  function setAccent(name) {
    try {
      localStorage.setItem(STORAGE_KEY, name);
    } catch {
      // Ignore storage errors in private browsing modes.
    }
    applyAccent(name);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyAccent(currentAccent());

    document.querySelectorAll("[data-accent-set]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setAccent(btn.getAttribute("data-accent-set"));
      });
    });
  });
})();
