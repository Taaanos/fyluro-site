/* Fyluro modular active background: subtle tree trunks and firing mycorrhizal network. */

(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("mycelium-bg");
  if (!svg) return;

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Deterministic PRNG so the root network stays stable across reloads.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function el(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        node.setAttribute(k, String(v));
      }
    }
    return node;
  }

  // Convert a polyline of points into a smooth organic cubic Bezier path.
  function smoothPath(points) {
    if (points.length < 2) return "";
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  let trunks = [];
  let activePulses = [];
  let activeBlooms = [];
  let pulseLayer = null;
  let rafId = null;
  let burstTimer = null;
  let lastFrameTime = 0;
  let trunkCursor = 0;
  let lastWidth = 0;
  let lastHeight = 0;

  function clearTimersAndLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (burstTimer !== null) {
      clearTimeout(burstTimer);
      burstTimer = null;
    }
  }

  function clearPulses() {
    for (const p of activePulses) {
      p.group.remove();
    }
    activePulses = [];
    for (const b of activeBlooms) {
      b.ring.setAttribute("opacity", "0");
      b.ring.setAttribute("r", "5.5");
    }
    activeBlooms = [];
  }

  function buildNetwork() {
    clearTimersAndLoop();
    clearPulses();

    const host = svg.parentElement;
    if (!host) return;

    const W = Math.max(320, Math.round(host.clientWidth));
    const H = Math.max(640, Math.round(host.clientHeight));
    lastWidth = W;
    lastHeight = H;

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.replaceChildren();

    const rand = mulberry32(41731);
    const isCompact = W < 820;

    // Place barely visible trunks in the top ~20% of the initial viewport.
    const viewportH = window.innerHeight || 900;
    const collarY = Math.round(Math.max(135, Math.min(viewportH * 0.21, H * 0.22, 230)));

    // Defs: subtle vertical fade gradient for trunks so they dissolve into the top and roots.
    const defs = el("defs");
    const trunkGrad = el("linearGradient", {
      id: "mycelium-trunk-grad",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
    });
    trunkGrad.appendChild(el("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": "0.35" }));
    trunkGrad.appendChild(el("stop", { offset: "62%", "stop-color": "currentColor", "stop-opacity": "1" }));
    trunkGrad.appendChild(el("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": "0.18" }));
    defs.appendChild(trunkGrad);
    svg.appendChild(defs);

    const trunkLayer = el("g", { class: "mycelium-trunks" });
    const hyphaLayer = el("g", { class: "mycelium-hyphae" });
    const rootLayer = el("g", { class: "mycelium-roots" });
    const nodeLayer = el("g", { class: "mycelium-nodes" });
    pulseLayer = el("g", { class: "mycelium-pulses" });

    svg.appendChild(trunkLayer);
    svg.appendChild(hyphaLayer);
    svg.appendChild(rootLayer);
    svg.appendChild(nodeLayer);
    svg.appendChild(pulseLayer);

    // Each trunk represents a distinct media type (e.g., RAW, JPEG, Video, Film).
    const trunkSpecs = isCompact
      ? [
          { xFrac: 0.12, width: 20, sway: 5 },
          { xFrac: 0.50, width: 17, sway: -4 },
          { xFrac: 0.88, width: 21, sway: -5 },
        ]
      : [
          { xFrac: 0.065, width: 28, sway: 7 },
          { xFrac: 0.28, width: 20, sway: -5 },
          { xFrac: 0.72, width: 22, sway: 6 },
          { xFrac: 0.935, width: 26, sway: -7 },
        ];

    trunks = [];
    const anchorPoints = [];

    trunkSpecs.forEach((spec, idx) => {
      const cx = Math.round(W * spec.xFrac);
      const topHalf = spec.width * 0.44;
      const midHalf = spec.width * 0.48;
      const flareHalf = spec.width * 1.15;
      const midY = collarY * 0.55;
      const sway = spec.sway;

      // Subtle tapered trunk silhouette with gentle root flare at ~20% height.
      const trunkD = [
        `M ${(cx - topHalf).toFixed(1)} 0`,
        `C ${(cx - midHalf + sway * 0.4).toFixed(1)} ${(midY * 0.7).toFixed(1)}, ${(cx - midHalf + sway).toFixed(1)} ${(collarY * 0.78).toFixed(1)}, ${(cx - flareHalf).toFixed(1)} ${collarY.toFixed(1)}`,
        `Q ${cx.toFixed(1)} ${(collarY + 10).toFixed(1)}, ${(cx + flareHalf).toFixed(1)} ${collarY.toFixed(1)}`,
        `C ${(cx + midHalf + sway).toFixed(1)} ${(collarY * 0.78).toFixed(1)}, ${(cx + midHalf + sway * 0.4).toFixed(1)} ${(midY * 0.7).toFixed(1)}, ${(cx + topHalf).toFixed(1)} 0`,
        "Z",
      ].join(" ");

      trunkLayer.appendChild(el("path", { d: trunkD, class: "mycelium-trunk" }));

      // Two delicate vertical bark contour lines inside the trunk.
      [-0.32, 0.28].forEach((offset) => {
        const bxTop = cx + topHalf * offset;
        const bxBot = cx + flareHalf * offset * 0.85;
        const barkD = `M ${bxTop.toFixed(1)} 0 C ${(bxTop + sway * 0.5).toFixed(1)} ${(midY).toFixed(1)}, ${(bxBot + sway * 0.3).toFixed(1)} ${(collarY * 0.85).toFixed(1)}, ${bxBot.toFixed(1)} ${(collarY + 4).toFixed(1)}`;
        trunkLayer.appendChild(el("path", { d: barkD, class: "mycelium-bark" }));
      });

      const trunkRoutes = [];
      const primaryCount = isCompact ? 2 : 3;

      for (let r = 0; r < primaryCount; r++) {
        // Fan roots gently across the horizontal territory beneath the trunk.
        const fan = primaryCount === 2 ? (r === 0 ? -1 : 1) : r - 1;
        const startX = cx + fan * (flareHalf * 0.42);
        const startY = collarY - 4;

        // Vary destination depth across the full page height.
        const depthFracs = primaryCount === 2 ? [0.58, 0.88] : [0.46, 0.74, 0.93];
        const targetY = Math.round(H * (depthFracs[r] + (rand() - 0.5) * 0.08));
        const spreadX = (isCompact ? W * 0.22 : W * 0.16) * (fan + (rand() - 0.5) * 0.7);
        const endX = Math.max(24, Math.min(W - 24, cx + spreadX));

        const steps = 4;
        const pts = [{ x: startX, y: startY }];
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          const jitterX = (rand() - 0.5) * (isCompact ? 46 : 78);
          const x = Math.max(20, Math.min(W - 20, startX + (endX - startX) * t + jitterX));
          const y = startY + (targetY - startY) * t + (rand() - 0.5) * 24;
          pts.push({ x, y });
        }
        pts.push({ x: endX, y: targetY });

        const primaryD = smoothPath(pts);
        const primaryPath = el("path", { d: primaryD, class: "mycelium-root-primary" });
        rootLayer.appendChild(primaryPath);

        const endNode = createFolderNode(nodeLayer, endX, targetY);
        trunkRoutes.push({
          d: primaryD,
          pathEl: primaryPath,
          length: primaryPath.getTotalLength(),
          endNode,
        });

        // Save an intermediate waypoint for subtle cross-trunk hyphae.
        anchorPoints.push({ trunkIdx: idx, x: pts[2].x, y: pts[2].y });

        // Add one secondary fork branching from a mid-point to another folder node.
        const forkIdx = r % 2 === 0 ? 1 : 2;
        const forkOrigin = pts[forkIdx];
        const forkDir = fan === 0 ? (rand() > 0.5 ? 1 : -1) : -fan;
        const forkSpanX = (isCompact ? 48 : 88) * forkDir + (rand() - 0.5) * 44;
        const forkEndX = Math.max(22, Math.min(W - 22, forkOrigin.x + forkSpanX));
        const forkEndY = Math.min(H - 36, forkOrigin.y + 120 + rand() * (H * 0.24));

        const forkMid = {
          x: Math.max(20, Math.min(W - 20, (forkOrigin.x + forkEndX) * 0.5 + (rand() - 0.5) * 34)),
          y: (forkOrigin.y + forkEndY) * 0.5,
        };

        const forkOnlyD = smoothPath([forkOrigin, forkMid, { x: forkEndX, y: forkEndY }]);
        rootLayer.appendChild(el("path", { d: forkOnlyD, class: "mycelium-root-secondary" }));

        // Full continuous route from trunk collar through fork to destination folder.
        const fullForkPts = pts.slice(0, forkIdx + 1).concat([forkMid, { x: forkEndX, y: forkEndY }]);
        const fullForkD = smoothPath(fullForkPts);
        const hiddenRoutePath = el("path", { d: fullForkD, class: "mycelium-route-guide" });
        rootLayer.appendChild(hiddenRoutePath);

        const forkNode = createFolderNode(nodeLayer, forkEndX, forkEndY);
        trunkRoutes.push({
          d: fullForkD,
          pathEl: hiddenRoutePath,
          length: hiddenRoutePath.getTotalLength(),
          endNode: forkNode,
        });
      }

      trunks.push({ id: idx, routes: trunkRoutes });
    });

    // Subtle mycorrhizal cross-filaments linking neighboring root systems.
    for (let i = 0; i < anchorPoints.length; i++) {
      for (let j = i + 1; j < anchorPoints.length; j++) {
        const a = anchorPoints[i];
        const b = anchorPoints[j];
        if (a.trunkIdx === b.trunkIdx) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist < W * 0.34 && Math.abs(dy) < H * 0.26 && rand() < 0.42) {
          const midX = (a.x + b.x) * 0.5;
          const midY = (a.y + b.y) * 0.5 + (rand() - 0.5) * 48;
          const d = `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
          hyphaLayer.appendChild(el("path", { d, class: "mycelium-hypha" }));
        }
      }
    }

    if (!reducedMotionQuery.matches && !document.hidden) {
      scheduleNextBurst(1200);
    }
  }

  function createFolderNode(parent, x, y) {
    const g = el("g", { class: "mycelium-node" });
    const ring = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "5.5",
      class: "mycelium-node-ring",
      opacity: "0",
    });
    const dot = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "2.1",
      class: "mycelium-node-dot",
    });
    g.appendChild(ring);
    g.appendChild(dot);
    parent.appendChild(g);
    return { x, y, ring };
  }

  function spawnPulse(route, delayMs) {
    const trailLen = Math.min(54, route.length * 0.14);
    const group = el("g", { class: "mycelium-pulse", opacity: "0" });

    const streak = el("path", {
      d: route.d,
      class: "mycelium-pulse-streak",
      "stroke-dasharray": `${trailLen.toFixed(1)} ${(route.length + trailLen).toFixed(1)}`,
      "stroke-dashoffset": `${trailLen.toFixed(1)}`,
    });

    const halo = el("circle", {
      r: "6.5",
      class: "mycelium-pulse-halo",
    });

    const head = el("circle", {
      r: "2.1",
      class: "mycelium-pulse-head",
    });

    group.appendChild(streak);
    group.appendChild(halo);
    group.appendChild(head);
    pulseLayer.appendChild(group);

    activePulses.push({
      route,
      group,
      streak,
      halo,
      head,
      trailLen,
      delayRemaining: delayMs,
      distance: 0,
      speed: 68 + Math.random() * 14, // Slow, calm travel speed (px/sec).
    });
  }

  function fireTrunkBurst() {
    burstTimer = null;
    if (reducedMotionQuery.matches || document.hidden || trunks.length === 0) return;

    // One trunk fires at a time, like a card sending a batch of one media type.
    const trunk = trunks[trunkCursor % trunks.length];
    trunkCursor += 1;

    const routes = trunk.routes;
    if (!routes.length) return;

    // Dispatch 2 to 3 slow pulses, routed to 1 or 2 destination folders.
    const pulseCount = Math.random() < 0.5 ? 2 : 3;
    const firstIdx = Math.floor(Math.random() * routes.length);
    let secondIdx = firstIdx;
    if (routes.length > 1 && Math.random() < 0.65) {
      secondIdx = (firstIdx + 1 + Math.floor(Math.random() * (routes.length - 1))) % routes.length;
    }

    for (let i = 0; i < pulseCount; i++) {
      const route = i === 1 ? routes[secondIdx] : routes[firstIdx];
      spawnPulse(route, i * 1050);
    }

    startLoop();
  }

  function scheduleNextBurst(delayMs) {
    if (burstTimer !== null || reducedMotionQuery.matches || document.hidden) return;
    const wait = typeof delayMs === "number" ? delayMs : 3200 + Math.random() * 2000;
    burstTimer = setTimeout(fireTrunkBurst, wait);
  }

  function startLoop() {
    if (rafId !== null) return;
    lastFrameTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function tick(now) {
    rafId = null;
    if (reducedMotionQuery.matches || document.hidden) return;

    // Cap dt so tab switches or hiccups never cause jumps.
    const dtMs = Math.min(64, Math.max(0, now - lastFrameTime));
    const dtSec = dtMs / 1000;
    lastFrameTime = now;

    // Update active pulses.
    for (let i = activePulses.length - 1; i >= 0; i--) {
      const p = activePulses[i];
      if (p.delayRemaining > 0) {
        p.delayRemaining -= dtMs;
        continue;
      }

      p.distance += p.speed * dtSec;
      const total = p.route.length;

      if (p.distance >= total) {
        // Trigger a soft bloom on the destination folder node.
        activeBlooms.push({
          ring: p.route.endNode.ring,
          elapsed: 0,
          duration: 1050,
        });
        p.group.remove();
        activePulses.splice(i, 1);
        continue;
      }

      const pt = p.route.pathEl.getPointAtLength(p.distance);
      p.head.setAttribute("cx", pt.x.toFixed(1));
      p.head.setAttribute("cy", pt.y.toFixed(1));
      p.halo.setAttribute("cx", pt.x.toFixed(1));
      p.halo.setAttribute("cy", pt.y.toFixed(1));

      // Align trailing streak just behind the pulse head.
      const offset = p.trailLen - p.distance;
      p.streak.setAttribute("stroke-dashoffset", offset.toFixed(1));

      // Gentle fade in near trunk collar and fade out near folder node.
      const fadeIn = Math.min(1, p.distance / 48);
      const fadeOut = Math.min(1, (total - p.distance) / 48);
      const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
      p.group.setAttribute("opacity", alpha.toFixed(3));
    }

    // Update terminal folder node blooms.
    for (let i = activeBlooms.length - 1; i >= 0; i--) {
      const b = activeBlooms[i];
      b.elapsed += dtMs;
      const t = b.elapsed / b.duration;
      if (t >= 1) {
        b.ring.setAttribute("opacity", "0");
        b.ring.setAttribute("r", "5.5");
        activeBlooms.splice(i, 1);
        continue;
      }
      const easeOut = 1 - Math.pow(1 - t, 2);
      const radius = 3.5 + easeOut * 7.5;
      const opacity = (1 - t) * 0.42;
      b.ring.setAttribute("r", radius.toFixed(2));
      b.ring.setAttribute("opacity", opacity.toFixed(3));
    }

    // Keep animating only while pulses or blooms are alive; sleep at 0% CPU between bursts.
    if (activePulses.length > 0 || activeBlooms.length > 0) {
      rafId = requestAnimationFrame(tick);
    } else {
      scheduleNextBurst();
    }
  }

  // Pause completely when the tab is hidden to save battery.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimersAndLoop();
    } else if (!reducedMotionQuery.matches) {
      if (activePulses.length > 0 || activeBlooms.length > 0) {
        startLoop();
      } else {
        scheduleNextBurst(1400);
      }
    }
  });

  // React immediately if the user toggles OS reduced-motion preference.
  const onMotionChange = () => {
    if (reducedMotionQuery.matches) {
      clearTimersAndLoop();
      clearPulses();
    } else if (!document.hidden) {
      scheduleNextBurst(1200);
    }
  };
  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", onMotionChange);
  }

  // Rebuild SVG geometry only on meaningful size changes.
  let resizeTimer = null;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const host = svg.parentElement;
      if (!host) return;
      const w = Math.round(host.clientWidth);
      const h = Math.round(host.clientHeight);
      if (Math.abs(w - lastWidth) > 24 || Math.abs(h - lastHeight) > 36) {
        buildNetwork();
      }
    }, 240);
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("load", () => {
    buildNetwork();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildNetwork);
  } else {
    buildNetwork();
  }
})();
