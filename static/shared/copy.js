/* Shared clipboard copy handler for command blocks. */

(() => {
  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-copy-text]").forEach((button) => {
      const defaultLabel = button.textContent.trim();
      let resetTimer = null;

      button.addEventListener("click", async () => {
        const text = button.getAttribute("data-copy-text");
        if (!text) return;

        try {
          await copyText(text);
          button.textContent = "Copied";
          button.setAttribute("data-copied", "true");

          clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            button.textContent = defaultLabel;
            button.removeAttribute("data-copied");
          }, 2000);
        } catch {
          button.textContent = "Copy failed";
          clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            button.textContent = defaultLabel;
          }, 2000);
        }
      });
    });
  });
})();
