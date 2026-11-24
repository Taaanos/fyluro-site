/* Shared screenshot carousel and native <dialog> lightbox controller. */

(() => {
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function scrollBehavior() {
    return reducedMotionQuery.matches ? "auto" : "smooth";
  }

  function initCarousel(root) {
    const track = root.querySelector("[data-carousel-track]");
    const slideNodes = Array.from(root.querySelectorAll("[data-carousel-slide]"));
    if (!track || slideNodes.length === 0) return;

    const slides = slideNodes.map((node) => ({
      src: node.getAttribute("data-slide-src") || "",
      alt: node.getAttribute("data-slide-alt") || "",
      caption: node.getAttribute("data-slide-caption") || "",
    }));

    const total = slides.length;
    const prevBtn = root.querySelector("[data-carousel-prev]");
    const nextBtn = root.querySelector("[data-carousel-next]");
    const zoomCurrentBtn = root.querySelector("[data-carousel-zoom-current]");
    const slideTriggers = Array.from(root.querySelectorAll("[data-carousel-open]"));
    const dotBtns = Array.from(root.querySelectorAll("[data-carousel-dot]"));
    const counterEl = root.querySelector("[data-carousel-counter]");
    const captionTextEl = root.querySelector("[data-carousel-caption-text]");

    const lightbox = root.querySelector("[data-carousel-lightbox]");
    const lightboxFrame = root.querySelector("[data-carousel-lightbox-frame]");
    const lightboxImage = root.querySelector("[data-lightbox-image]");
    const lightboxCounter = root.querySelector("[data-lightbox-counter]");
    const lightboxCaption = root.querySelector("[data-lightbox-caption]");
    const lightboxClose = root.querySelector("[data-lightbox-close]");
    const lightboxPrev = root.querySelector("[data-lightbox-prev]");
    const lightboxNext = root.querySelector("[data-lightbox-next]");
    const lightboxDots = Array.from(root.querySelectorAll("[data-lightbox-dot]"));

    let currentIndex = 0;
    let isProgrammaticScroll = false;
    let scrollUnlockTimer = null;
    let rafId = null;
    let openedFromZoomButton = false;

    function wrapIndex(index) {
      return ((index % total) + total) % total;
    }

    function updateIndicators(index) {
      const slide = slides[index];
      if (!slide) return;

      if (counterEl) {
        counterEl.textContent = `${index + 1} / ${total}`;
      }
      if (captionTextEl) {
        captionTextEl.textContent = slide.caption;
      }

      slideTriggers.forEach((trigger, i) => {
        trigger.setAttribute("tabindex", i === index ? "0" : "-1");
      });

      dotBtns.forEach((dot, i) => {
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });

      if (lightbox && lightbox.open) {
        updateLightbox(index);
      }
    }

    function updateLightbox(index) {
      const slide = slides[index];
      if (!slide) return;

      if (lightboxImage) {
        lightboxImage.src = slide.src;
        lightboxImage.alt = slide.alt;
      }
      if (lightboxCounter) {
        lightboxCounter.textContent = `${index + 1} / ${total}`;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = slide.caption;
      }
      lightboxDots.forEach((dot, i) => {
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    function setTrackInstant(index) {
      const width = track.clientWidth;
      if (width <= 0) return;
      isProgrammaticScroll = true;
      clearTimeout(scrollUnlockTimer);
      track.scrollLeft = index * width;
      scrollUnlockTimer = setTimeout(() => {
        isProgrammaticScroll = false;
      }, 60);
    }

    function goToSlide(targetIndex, options = {}) {
      const next = wrapIndex(targetIndex);
      const instant = Boolean(options.instant) || reducedMotionQuery.matches;
      currentIndex = next;
      updateIndicators(next);

      const width = track.clientWidth;
      if (width <= 0) return;

      if (instant) {
        setTrackInstant(next);
        return;
      }

      isProgrammaticScroll = true;
      clearTimeout(scrollUnlockTimer);

      track.scrollTo({
        left: next * width,
        behavior: scrollBehavior(),
      });

      scrollUnlockTimer = setTimeout(() => {
        isProgrammaticScroll = false;
      }, 450);
    }

    function openLightbox(index, fromZoomButton = false) {
      if (!lightbox || typeof lightbox.showModal !== "function") return;
      openedFromZoomButton = fromZoomButton;
      const target = wrapIndex(index);
      if (target !== currentIndex) {
        goToSlide(target, { instant: true });
      }
      updateLightbox(target);
      lightbox.showModal();
    }

    function handleArrowKeys(event, isLightboxContext) {
      if (total <= 1) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToSlide(currentIndex - 1, { instant: isLightboxContext });
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToSlide(currentIndex + 1, { instant: isLightboxContext });
      } else if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0, { instant: isLightboxContext });
      } else if (event.key === "End") {
        event.preventDefault();
        goToSlide(total - 1, { instant: isLightboxContext });
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));
    }

    dotBtns.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = Number(dot.getAttribute("data-carousel-dot"));
        if (!Number.isNaN(index)) {
          goToSlide(index);
        }
      });
    });

    slideTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const index = Number(trigger.getAttribute("data-carousel-open"));
        openLightbox(Number.isNaN(index) ? currentIndex : index, false);
      });
    });

    if (zoomCurrentBtn) {
      zoomCurrentBtn.addEventListener("click", () => openLightbox(currentIndex, true));
    }

    // Keep slide indicators in sync with native touch and trackpad swipes.
    track.addEventListener(
      "scroll",
      () => {
        if (isProgrammaticScroll || (lightbox && lightbox.open)) return;
        if (rafId !== null) return;

        rafId = window.requestAnimationFrame(() => {
          rafId = null;
          const width = track.clientWidth;
          if (width <= 0) return;

          const nearest = Math.max(
            0,
            Math.min(total - 1, Math.round(track.scrollLeft / width))
          );
          if (nearest !== currentIndex) {
            currentIndex = nearest;
            updateIndicators(currentIndex);
          }
        });
      },
      { passive: true }
    );

    if ("onscrollend" in window) {
      track.addEventListener("scrollend", () => {
        isProgrammaticScroll = false;
        clearTimeout(scrollUnlockTimer);
      });
    }

    root.addEventListener("keydown", (event) => {
      if (lightbox && lightbox.open) return;
      handleArrowKeys(event, false);
    });

    if (lightbox) {
      if (lightboxClose) {
        lightboxClose.addEventListener("click", () => lightbox.close());
      }

      if (lightboxPrev) {
        lightboxPrev.addEventListener("click", () => {
          goToSlide(currentIndex - 1, { instant: true });
        });
      }

      if (lightboxNext) {
        lightboxNext.addEventListener("click", () => {
          goToSlide(currentIndex + 1, { instant: true });
        });
      }

      lightboxDots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const index = Number(dot.getAttribute("data-lightbox-dot"));
          if (!Number.isNaN(index)) {
            goToSlide(index, { instant: true });
          }
        });
      });

      lightbox.addEventListener("keydown", (event) => {
        handleArrowKeys(event, true);
      });

      // Close when clicking the dimmed backdrop outside the lightbox frame.
      lightbox.addEventListener("click", (event) => {
        if (event.target !== lightbox || event.detail === 0) return;
        if (lightboxFrame) {
          const rect = lightboxFrame.getBoundingClientRect();
          const inside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;
          if (inside) return;
        }
        lightbox.close();
      });

      // Return focus to the visible active slide or zoom button after the browser finishes dialog teardown.
      lightbox.addEventListener("close", () => {
        const target = openedFromZoomButton
          ? zoomCurrentBtn
          : slideTriggers[currentIndex];
        window.requestAnimationFrame(() => {
          setTrackInstant(currentIndex);
          if (target && typeof target.focus === "function") {
            target.focus({ preventScroll: true });
          }
        });
      });
    }

    // Re-align the active slide when the container resizes.
    if (typeof ResizeObserver === "function") {
      const resizeObserver = new ResizeObserver(() => {
        setTrackInstant(currentIndex);
      });
      resizeObserver.observe(track);
    }

    updateIndicators(0);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-carousel]").forEach(initCarousel);
  });
})();
