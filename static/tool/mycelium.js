/*
 * Fyluro modular active background (v3):
 * DOM-aware Space Colonization root system, Pipe-Model botanical tapering,
 * anastomosing mycorrhizal hyphae, and trunk-to-folder packet burst routing.
 */

(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("mycelium-bg");
  if (!svg) return;

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Deterministic PRNG (Mulberry32) so the forest stays reproducible.
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

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
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

  // Smooth multi-octave 2D curl/flow perturbation so roots bend around unseen soil strata.
  function soilCurl(x, y) {
    const nx = x * 0.0085;
    const ny = y * 0.0085;
    const a =
      Math.sin(nx * 1.7 + Math.cos(ny * 1.4)) * 0.55 +
      Math.cos(nx * 3.1 - ny * 2.3) * 0.3 +
      Math.sin((nx + ny) * 4.2) * 0.15;
    return {
      dx: Math.sin(a * 2.2),
      dy: Math.cos(a * 1.6) * 0.45,
    };
  }

  // Convert a polyline into a smooth Catmull-Rom cubic Bezier SVG path string.
  function smoothPath(points, tension = 6) {
    if (!points || points.length < 2) return "";
    if (points.length === 2) {
      return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
    }
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / tension;
      const cp1y = p1.y + (p2.y - p0.y) / tension;
      const cp2x = p2.x - (p3.x - p1.x) / tension;
      const cp2y = p2.y - (p3.y - p1.y) / tension;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  // Measure foreground cards and hero copy blocks so attractors favor visible open corridors.
  function collectObstacles(host) {
    const hostRect = host.getBoundingClientRect();
    const selectors = [".hero-copy", ".app-screenshot", ".card", ".section-header h2"];
    const boxes = [];

    document.querySelectorAll(selectors.join(",")).forEach((node) => {
      const r = node.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      const isText = node.matches(".hero-copy, .section-header h2");
      const pad = isText ? 18 : 10;
      boxes.push({
        left: r.left - hostRect.left - pad,
        top: r.top - hostRect.top - pad,
        right: r.right - hostRect.left + pad,
        bottom: r.bottom - hostRect.top + pad,
        isText,
        isCard: node.matches(".card, .app-screenshot"),
      });
    });

    return boxes;
  }

  function classifyPoint(x, y, boxes) {
    let insideText = false;
    let insideCard = false;
    let pushX = 0;
    let pushY = 0;

    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) {
        if (b.isText) insideText = true;
        if (b.isCard) insideCard = true;

        // Compute gentle deflection vector toward the nearest corridor edge (like a root around a stone).
        const cx = (b.left + b.right) * 0.5;
        const cy = (b.top + b.bottom) * 0.5;
        const halfW = Math.max(1, (b.right - b.left) * 0.5);
        const halfH = Math.max(1, (b.bottom - b.top) * 0.5);
        const nx = (x - cx) / halfW;
        const ny = (y - cy) / halfH;
        pushX += nx * 0.65;
        pushY += (ny >= 0 ? 0.35 : -0.15);
      }
    }
    return { insideText, insideCard, pushX, pushY };
  }

  let trunks = [];
  let activePulses = [];
  let activeBlooms = [];
  let activeSparks = [];
  let activeTrunkGlows = [];
  let pulseLayer = null;
  let rafId = null;
  let burstTimer = null;
  let lastFrameTime = 0;
  let trunkOrder = [];
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

  function clearAnimations() {
    for (const p of activePulses) p.group.remove();
    activePulses = [];

    for (const b of activeBlooms) {
      b.outerRing.setAttribute("opacity", "0");
      b.outerRing.setAttribute("r", "4.5");
      b.innerRing.setAttribute("opacity", "0");
      b.innerRing.setAttribute("r", "2.6");
      b.group.classList.remove("is-blooming");
    }
    activeBlooms = [];

    for (const s of activeSparks) {
      s.el.setAttribute("opacity", "0");
      s.el.setAttribute("r", "2.0");
    }
    activeSparks = [];

    for (const g of activeTrunkGlows) {
      for (const vein of g.veins) {
        vein.setAttribute("opacity", "0");
      }
    }
    activeTrunkGlows = [];
  }

  function createJunctionNode(layer, x, y, radius) {
    const dot = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: radius.toFixed(2),
      class: "mycelium-junction-dot",
    });
    const spark = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "2.0",
      class: "mycelium-junction-spark",
      opacity: "0",
    });
    layer.appendChild(dot);
    layer.appendChild(spark);
    return spark;
  }

  // Create a rich botanical mycorrhizal mantle / destination folder cluster at a visible root tip.
  function createFolderCluster(layer, x, y, incomingAngle, rand) {
    const g = el("g", { class: "mycelium-folder-cluster" });

    const outerRing = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "4.5",
      class: "mycelium-cluster-ring-outer",
      opacity: "0",
    });
    const innerRing = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "2.6",
      class: "mycelium-cluster-ring-inner",
      opacity: "0",
    });
    g.appendChild(outerRing);
    g.appendChild(innerRing);

    // Subtle resting halo ring around the folder node.
    g.appendChild(
      el("circle", {
        cx: x.toFixed(1),
        cy: y.toFixed(1),
        r: "3.8",
        class: "mycelium-cluster-halo",
      })
    );

    // Delicate fan of 3-5 curved root-tip dichotomy tendrils & spore bodies.
    const tendrilCount = 3 + Math.floor(rand() * 3);
    const fanSpread = 1.65;
    for (let i = 0; i < tendrilCount; i++) {
      const frac = tendrilCount === 1 ? 0 : i / (tendrilCount - 1) - 0.5;
      const a = incomingAngle + frac * fanSpread + (rand() - 0.5) * 0.25;
      const len = 6.5 + rand() * 7.5;
      const midLen = len * 0.55;
      const bend = (rand() - 0.5) * 0.45;

      const mx = x + Math.cos(a + bend) * midLen;
      const my = y + Math.sin(a + bend) * midLen;
      const sx = x + Math.cos(a) * len;
      const sy = y + Math.sin(a) * len;

      g.appendChild(
        el("path", {
          d: `M ${x.toFixed(1)} ${y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)}, ${sx.toFixed(1)} ${sy.toFixed(1)}`,
          class: "mycelium-cluster-stem",
        })
      );
      g.appendChild(
        el("circle", {
          cx: sx.toFixed(1),
          cy: sy.toFixed(1),
          r: (0.85 + rand() * 0.55).toFixed(2),
          class: "mycelium-cluster-spore",
        })
      );
    }

    const core = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "1.9",
      class: "mycelium-cluster-core",
    });
    g.appendChild(core);
    layer.appendChild(g);

    return { x, y, group: g, outerRing, innerRing };
  }

  function buildNetwork() {
    clearTimersAndLoop();
    clearAnimations();

    const host = svg.parentElement;
    if (!host) return;

    const W = Math.max(320, Math.round(host.clientWidth));
    const H = Math.max(640, Math.round(host.clientHeight));
    lastWidth = W;
    lastHeight = H;

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.replaceChildren();

    const rand = mulberry32(93177);
    const isCompact = W < 820;
    const obstacles = collectObstacles(host);

    // Top ~20% of the initial screen holds the barely visible media trunks and root crowns.
    const viewportH = window.innerHeight || 900;
    const collarY = Math.round(clamp(Math.min(viewportH * 0.2, H * 0.19), 135, 215));

    // SVG Defs: trunk vertical fade, sap illumination gradient, and GPU radial pulse aura.
    const defs = el("defs");

    const trunkGrad = el("linearGradient", {
      id: "mycelium-trunk-grad",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
    });
    trunkGrad.appendChild(el("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": "0.14" }));
    trunkGrad.appendChild(el("stop", { offset: "52%", "stop-color": "currentColor", "stop-opacity": "1" }));
    trunkGrad.appendChild(el("stop", { offset: "86%", "stop-color": "currentColor", "stop-opacity": "0.55" }));
    trunkGrad.appendChild(el("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": "0" }));
    defs.appendChild(trunkGrad);

    const sapGrad = el("linearGradient", {
      id: "mycelium-sap-grad",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
    });
    sapGrad.appendChild(el("stop", { offset: "0%", "stop-color": "var(--accent)", "stop-opacity": "0" }));
    sapGrad.appendChild(el("stop", { offset: "45%", "stop-color": "var(--accent)", "stop-opacity": "0.75" }));
    sapGrad.appendChild(el("stop", { offset: "100%", "stop-color": "var(--accent)", "stop-opacity": "0.35" }));
    defs.appendChild(sapGrad);

    const pulseGlow = el("radialGradient", {
      id: "mycelium-pulse-glow",
      cx: "50%",
      cy: "50%",
      r: "50%",
    });
    pulseGlow.appendChild(el("stop", { offset: "0%", "stop-color": "var(--accent)", "stop-opacity": "0.7" }));
    pulseGlow.appendChild(el("stop", { offset: "40%", "stop-color": "var(--accent)", "stop-opacity": "0.24" }));
    pulseGlow.appendChild(el("stop", { offset: "100%", "stop-color": "var(--accent)", "stop-opacity": "0" }));
    defs.appendChild(pulseGlow);

    svg.appendChild(defs);

    const horizonLayer = el("g", { class: "mycelium-horizon" });
    const trunkLayer = el("g", { class: "mycelium-trunks" });
    const hyphaLayer = el("g", { class: "mycelium-hyphae" });
    const fineRootLayer = el("g", { class: "mycelium-roots-fine" });
    const midRootLayer = el("g", { class: "mycelium-roots-mid" });
    const mainRootLayer = el("g", { class: "mycelium-roots-main" });
    const nodeLayer = el("g", { class: "mycelium-nodes" });
    pulseLayer = el("g", { class: "mycelium-pulses" });

    svg.appendChild(horizonLayer);
    svg.appendChild(trunkLayer);
    svg.appendChild(hyphaLayer);
    svg.appendChild(fineRootLayer);
    svg.appendChild(midRootLayer);
    svg.appendChild(mainRootLayer);
    svg.appendChild(nodeLayer);
    svg.appendChild(pulseLayer);

    // 1. Multi-strata forest floor humus / soil horizon around collarY.
    for (let s = 0; s < 2; s++) {
      const hPts = [];
      const hSegs = 16;
      const yBase = collarY + s * 9 - 3;
      for (let i = 0; i <= hSegs; i++) {
        hPts.push({
          x: (W * i) / hSegs,
          y: yBase + Math.sin(i * 0.85 + s * 1.7) * 5.5 + (rand() - 0.5) * 3.5,
        });
      }
      horizonLayer.appendChild(
        el("path", {
          d: smoothPath(hPts),
          class: s === 0 ? "mycelium-soil-line" : "mycelium-soil-subline",
        })
      );
    }

    // 2. Botanical Media Trunks with Multi-Lobe Buttress Root Crowns.
    // Positioned in the margins and natural gaps so hero copy stays crystal clear.
    const trunkSpecs = isCompact
      ? [
          { xFrac: 0.09, width: 26, flare: 2.7, sway: 6, lobes: [-0.85, -0.25, 0.35, 0.95] },
          { xFrac: 0.52, width: 19, flare: 2.2, sway: -4, lobes: [-0.75, 0.0, 0.78] },
          { xFrac: 0.91, width: 28, flare: 2.7, sway: -7, lobes: [-0.95, -0.32, 0.28, 0.88] },
        ]
      : [
          { xFrac: 0.055, width: 42, flare: 2.9, sway: 10, lobes: [-0.92, -0.38, 0.14, 0.65, 1.05] },
          { xFrac: 0.495, width: 24, flare: 2.35, sway: -5, lobes: [-0.85, -0.22, 0.32, 0.88] },
          { xFrac: 0.725, width: 27, flare: 2.45, sway: 6, lobes: [-0.88, -0.26, 0.3, 0.9] },
          { xFrac: 0.945, width: 38, flare: 2.8, sway: -9, lobes: [-1.02, -0.52, 0.05, 0.48, 0.92] },
        ];

    // Space-Colonization nodes array across all trees.
    const scNodes = [];
    const addScNode = (x, y, parent, trunkIdx, depth, isButtress = false) => {
      const node = {
        id: scNodes.length,
        x,
        y,
        parent,
        trunkIdx,
        depth,
        isButtress,
        children: [],
        tipCount: 0,
        dirX: parent ? (x - parent.x) / (Math.hypot(x - parent.x, y - parent.y) || 1) : 0,
        dirY: parent ? (y - parent.y) / (Math.hypot(x - parent.x, y - parent.y) || 1) : 1,
      };
      if (parent) parent.children.push(node);
      scNodes.push(node);
      return node;
    };

    trunks = [];

    trunkSpecs.forEach((spec, tIdx) => {
      const cx = Math.round(W * spec.xFrac);
      const topHalf = spec.width * 0.42;
      const midHalf = spec.width * 0.47;
      const flareHalf = spec.width * spec.flare * 0.5;
      const sway = spec.sway;

      // Sculptural outer trunk + buttress silhouette.
      const leftButtressX = cx - flareHalf;
      const rightButtressX = cx + flareHalf;
      const collarLocalY = collarY + 8;

      // Build an undulating multi-toed root crown base instead of a flat line.
      let basePath = "";
      const lobeCount = spec.lobes.length;
      for (let l = 0; l < lobeCount; l++) {
        const lx = cx + spec.lobes[l] * flareHalf * 0.92;
        const ly = collarLocalY + 10 + (l % 2 === 0 ? 7 : 2);
        if (l === 0) {
          basePath += ` Q ${((leftButtressX + lx) * 0.5).toFixed(1)} ${(collarLocalY + 12).toFixed(1)}, ${lx.toFixed(1)} ${ly.toFixed(1)}`;
        } else {
          const prevLx = cx + spec.lobes[l - 1] * flareHalf * 0.92;
          const archX = (prevLx + lx) * 0.5;
          const archY = collarLocalY - 3;
          basePath += ` Q ${archX.toFixed(1)} ${archY.toFixed(1)}, ${lx.toFixed(1)} ${ly.toFixed(1)}`;
        }
      }
      basePath += ` Q ${((cx + spec.lobes[lobeCount - 1] * flareHalf * 0.92 + rightButtressX) * 0.5).toFixed(1)} ${(collarLocalY + 12).toFixed(1)}, ${rightButtressX.toFixed(1)} ${collarLocalY.toFixed(1)}`;

      const trunkD = [
        `M ${(cx - topHalf).toFixed(1)} 0`,
        `C ${(cx - midHalf + sway * 0.35).toFixed(1)} ${(collarY * 0.35).toFixed(1)}, ${(cx - midHalf + sway * 0.85).toFixed(1)} ${(collarY * 0.72).toFixed(1)}, ${leftButtressX.toFixed(1)} ${collarLocalY.toFixed(1)}`,
        basePath,
        `C ${(cx + midHalf + sway * 0.85).toFixed(1)} ${(collarY * 0.72).toFixed(1)}, ${(cx + midHalf + sway * 0.35).toFixed(1)} ${(collarY * 0.35).toFixed(1)}, ${(cx + topHalf).toFixed(1)} 0`,
        "Z",
      ].join(" ");
      trunkLayer.appendChild(el("path", { d: trunkD, class: "mycelium-trunk" }));

      // Vascular bark grain lines & internal sap veins flowing into each buttress lobe.
      const crownCenterNode = addScNode(cx + sway * 0.35, collarY * 0.72, null, tIdx, 0, true);
      const sapVeins = [];

      spec.lobes.forEach((lobeFrac, lIdx) => {
        const topX = cx + lobeFrac * topHalf * 0.78;
        const midX = cx + lobeFrac * midHalf * 0.92 + sway * 0.48 + (rand() - 0.5) * 3.5;
        const toeX = clamp(cx + lobeFrac * flareHalf * 0.92, 16, W - 16);
        const toeY = collarLocalY + 8 + (lIdx % 2 === 0 ? 6 : 2);

        const barkPts = [
          { x: topX, y: 0 },
          { x: midX, y: collarY * 0.52 },
          { x: toeX, y: toeY },
        ];
        const barkD = smoothPath(barkPts);
        trunkLayer.appendChild(el("path", { d: barkD, class: "mycelium-bark" }));

        // Internal vascular sap vein for this buttress channel.
        const sapEl = el("path", { d: barkD, class: "mycelium-sap-vein", opacity: "0" });
        trunkLayer.appendChild(sapEl);
        sapVeins.push(sapEl);

        // Seed 2 initial underground root tips growing out of each buttress toe.
        const toeNode = addScNode(toeX, toeY, crownCenterNode, tIdx, 1, true);
        const baseAngle = Math.PI * 0.5 + lobeFrac * (isCompact ? 0.52 : 0.68) + (rand() - 0.5) * 0.14;
        const tipX = clamp(toeX + Math.cos(baseAngle) * 28, 16, W - 16);
        const tipY = toeY + Math.sin(baseAngle) * 28;
        addScNode(tipX, tipY, toeNode, tIdx, 2);
      });

      // Extra fine bark ridges for organic wood grain texture.
      for (let k = 0; k < 4; k++) {
        const f = (k / 3 - 0.5) * 1.35;
        const rPts = [
          { x: cx + f * topHalf * 0.7, y: 8 + rand() * 18 },
          { x: cx + f * midHalf * 0.85 + sway * 0.45, y: collarY * (0.42 + rand() * 0.16) },
          { x: cx + f * flareHalf * 0.75, y: collarLocalY - 4 + rand() * 10 },
        ];
        trunkLayer.appendChild(el("path", { d: smoothPath(rPts), class: "mycelium-bark-fine" }));
      }

      trunks.push({
        id: tIdx,
        cx,
        crownNode: crownCenterNode,
        sapVeins,
        junctionNets: [],
      });
    });

    // 3. Scatter Layout-Aware Soil Nutrient Attractors for Space Colonization.
    // Stratified across the entire document height so every section corridor is colonized evenly.
    const targetAttractors = isCompact ? 320 : 580;
    const attractors = [];
    const strataCount = 12;
    const perStratum = Math.ceil(targetAttractors / strataCount);
    const usableH = Math.max(200, H - collarY - 44);

    for (let s = 0; s < strataCount; s++) {
      const yMin = collarY + 20 + (s / strataCount) * usableH;
      const yMax = collarY + 20 + ((s + 1) / strataCount) * usableH;
      let added = 0;
      let tries = 0;

      while (added < perStratum && tries < perStratum * 7) {
        tries++;
        const ax = 16 + rand() * (W - 32);
        const ay = yMin + rand() * (yMax - yMin);

        const { insideText, insideCard } = classifyPoint(ax, ay, obstacles);
        if (insideText && rand() < 0.94) continue;
        if (insideCard && rand() < 0.82) continue;

        attractors.push({ x: ax, y: ay, active: true });
        added++;
      }
    }

    // 4. Run Biological Space-Colonization Root Growth (Runions et al.).
    const stepSize = isCompact ? 22 : 25;
    const influenceRadius = isCompact ? 165 : 210;
    const influenceSq = influenceRadius * influenceRadius;
    const killRadius = isCompact ? 27 : 31;
    const killSq = killRadius * killRadius;
    // Scale iterations to full page height so roots reach the bottom guarantees section & footer.
    const maxIterations = Math.min(95, Math.ceil((H - collarY) / (stepSize * 0.66)) + 10);

    for (let iter = 0; iter < maxIterations; iter++) {
      const influences = new Map();
      let activeCount = 0;

      for (let aIdx = 0; aIdx < attractors.length; aIdx++) {
        const attr = attractors[aIdx];
        if (!attr.active) continue;
        activeCount++;

        let closestNode = null;
        let minDistSq = influenceSq;

        // Find the closest root node that can sense this nutrient packet.
        for (let nIdx = 0; nIdx < scNodes.length; nIdx++) {
          const n = scNodes[nIdx];
          if (n.isButtress && n.depth === 0) continue;
          const dy = attr.y - n.y;
          // Roots grow predominantly downward and laterally (disallow sharp upward backtracking).
          if (dy < -16) continue;
          const dx = attr.x - n.x;
          const dSq = dx * dx + dy * dy;
          if (dSq < minDistSq) {
            minDistSq = dSq;
            closestNode = n;
          }
        }

        if (closestNode) {
          if (minDistSq < killSq) {
            attr.active = false;
            continue;
          }
          const dist = Math.sqrt(minDistSq) || 1;
          let acc = influences.get(closestNode);
          if (!acc) {
            acc = { vx: 0, vy: 0, count: 0 };
            influences.set(closestNode, acc);
          }
          acc.vx += (attr.x - closestNode.x) / dist;
          acc.vy += (attr.y - closestNode.y) / dist;
          acc.count += 1;
        }
      }

      if (activeCount === 0 || influences.size === 0) break;

      // Grow new root segments toward combined nutrient vectors + 2D soil curl field.
      for (const [node, acc] of influences.entries()) {
        // Limit branching factor at any single node to 2 (natural dichotomy).
        if (node.children.length >= 2) continue;

        let dx = acc.vx / acc.count;
        let dy = acc.vy / acc.count;

        // Blend with parent momentum, 2D curl noise, and stone-like deflection around cards.
        const curl = soilCurl(node.x, node.y);
        const obs = classifyPoint(node.x + dx * stepSize, node.y + dy * stepSize, obstacles);
        dx = dx * 0.58 + node.dirX * 0.22 + curl.dx * 0.22 + obs.pushX * 0.32;
        dy = dy * 0.58 + node.dirY * 0.22 + curl.dy * 0.14 + obs.pushY * 0.18 + 0.15;

        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        // Prevent sharp kinks relative to parent segment.
        if (node.parent) {
          const dot = dx * node.dirX + dy * node.dirY;
          if (dot < 0.25) {
            dx = (dx + node.dirX) * 0.5;
            dy = (dy + node.dirY) * 0.5;
            const l2 = Math.hypot(dx, dy) || 1;
            dx /= l2;
            dy /= l2;
          }
        }

        const nx = clamp(node.x + dx * stepSize, 14, W - 14);
        const ny = clamp(node.y + dy * stepSize, collarY + 6, H - 20);

        if (Math.hypot(nx - node.x, ny - node.y) > 8) {
          addScNode(nx, ny, node, node.trunkIdx, node.depth + 1);
        }
      }
    }

    // 5. Leonardo da Vinci's Pipe Model: compute downstream root-tip counts bottom-up.
    for (let i = scNodes.length - 1; i >= 0; i--) {
      const n = scNodes[i];
      if (n.children.length === 0) {
        n.tipCount = 1;
      } else {
        let sum = 0;
        for (let c = 0; c < n.children.length; c++) {
          sum += n.children[c].tipCount;
        }
        n.tipCount = sum;
      }
    }

    // 6. Decompose the Space-Colonization tree into smooth junction-to-junction chains.
    // A chain starts at a crown/buttress or fork (children.length > 1) and runs to the next fork or leaf tip.
    let graphNodeSeq = 0;
    const graphNodeMap = new Map();

    const getOrCreateGraphNode = (scNode) => {
      let gn = graphNodeMap.get(scNode.id);
      if (!gn) {
        gn = {
          id: graphNodeSeq++,
          scNode,
          x: scNode.x,
          y: scNode.y,
          trunkIdx: scNode.trunkIdx,
          tipCount: scNode.tipCount,
          edges: [],
          sparkEl: null,
          cluster: null,
        };
        graphNodeMap.set(scNode.id, gn);
      }
      return gn;
    };

    const leafGraphNodes = [];
    const forkGraphNodes = [];

    function traceChains(startScNode) {
      const fromGN = getOrCreateGraphNode(startScNode);

      for (const firstChild of startScNode.children) {
        const pts = [{ x: startScNode.x, y: startScNode.y }];
        let curr = firstChild;

        // Walk through degree-1 continuation nodes to form one smooth multi-point spline.
        while (curr.children.length === 1 && !curr.isButtress) {
          pts.push({ x: curr.x, y: curr.y });
          curr = curr.children[0];
        }
        pts.push({ x: curr.x, y: curr.y });

        const toGN = getOrCreateGraphNode(curr);
        const avgTips = (startScNode.tipCount + curr.tipCount) * 0.5;

        // Pipe-Model stroke width: proportional to avgTips^0.38.
        const strokeW = clamp(0.45 + Math.pow(avgTips, 0.38) * 0.34, 0.48, 2.35);
        const order = strokeW > 1.35 ? 1 : strokeW > 0.85 ? 2 : 3;
        const targetLayer = order === 1 ? mainRootLayer : order === 2 ? midRootLayer : fineRootLayer;

        const d = smoothPath(pts, 5.5);
        const pathEl = el("path", {
          d,
          class: `mycelium-root-o${order}`,
          "stroke-width": strokeW.toFixed(2),
        });
        targetLayer.appendChild(pathEl);

        const length = pathEl.getTotalLength();
        const edge = {
          from: fromGN,
          to: toGN,
          d,
          pathEl,
          length,
          strokeW,
          order,
          pts,
        };
        fromGN.edges.push(edge);

        if (curr.children.length > 1) {
          if (!toGN.sparkEl && !curr.isButtress) {
            const jRadius = clamp(0.9 + Math.pow(curr.tipCount, 0.3) * 0.25, 1.1, 2.1);
            toGN.sparkEl = createJunctionNode(nodeLayer, curr.x, curr.y, jRadius);
            forkGraphNodes.push(toGN);
          }
          traceChains(curr);
        } else if (curr.children.length === 0) {
          // Terminal root tip: place a botanical folder cluster if in a visible open corridor!
          const prevPt = pts[Math.max(0, pts.length - 2)];
          const incAngle = Math.atan2(curr.y - prevPt.y, curr.x - prevPt.x);
          const { insideCard, insideText } = classifyPoint(curr.x, curr.y, obstacles);

          if (!insideCard && !insideText && pts.length >= 2) {
            toGN.cluster = createFolderCluster(nodeLayer, curr.x, curr.y, incAngle, rand);
          } else {
            // Subtle simple root-hair termination if under a card.
            nodeLayer.appendChild(
              el("circle", {
                cx: curr.x.toFixed(1),
                cy: curr.y.toFixed(1),
                r: "1.3",
                class: "mycelium-junction-dot",
              })
            );
          }
          leafGraphNodes.push(toGN);
        } else {
          traceChains(curr);
        }
      }
    }

    trunks.forEach((t) => {
      traceChains(t.crownNode);
      t.rootGraphNode = getOrCreateGraphNode(t.crownNode);
    });

    // 7. Anastomosing Mycorrhizal Hyphae & Inter-Tree Fungal Cords (Wood Wide Web).
    // Connect nearby fork junctions and root tips across neighboring trees with braided fungal strands.
    const hyphaCandidates = forkGraphNodes.concat(leafGraphNodes);
    const maxBridgeDist = isCompact ? W * 0.34 : W * 0.23;
    let bridgeCount = 0;
    const maxBridges = isCompact ? 42 : 88;

    for (let i = 0; i < hyphaCandidates.length && bridgeCount < maxBridges; i++) {
      for (let j = i + 1; j < hyphaCandidates.length && bridgeCount < maxBridges; j++) {
        const a = hyphaCandidates[i];
        const b = hyphaCandidates[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);

        const crossTree = a.trunkIdx !== b.trunkIdx;
        const limit = crossTree ? maxBridgeDist * 1.25 : maxBridgeDist * 0.65;
        const prob = crossTree ? 0.28 : 0.11;

        if (dist > 36 && dist < limit && Math.abs(dy) < H * 0.16 && rand() < prob) {
          const curl = soilCurl((a.x + b.x) * 0.5, (a.y + b.y) * 0.5);
          const nx = -dy / dist;
          const ny = dx / dist;
          const arch = (rand() - 0.5) * 28 + curl.dx * 14;

          const p1 = {
            x: a.x + dx * 0.33 + nx * arch,
            y: a.y + dy * 0.33 + ny * arch,
          };
          const p2 = {
            x: a.x + dx * 0.67 - nx * arch * 0.65,
            y: a.y + dy * 0.67 - ny * arch * 0.65,
          };

          const d = smoothPath([a, p1, p2, b]);
          const isCord = crossTree && rand() < 0.45;
          hyphaLayer.appendChild(
            el("path", {
              d,
              class: isCord ? "mycelium-hypha-cord" : rand() < 0.45 ? "mycelium-hypha-dotted" : "mycelium-hypha",
            })
          );

          // For cross-tree rhizomorph cords, add a delicate braided companion strand
          // AND link them in the routing graph so occasional signals can cross between trees!
          if (isCord) {
            const p1b = { x: p1.x + nx * 4.5, y: p1.y + ny * 4.5 };
            const p2b = { x: p2.x - nx * 4.5, y: p2.y - ny * 4.5 };
            const companionEl = el("path", {
              d: smoothPath([a, p1b, p2b, b]),
              class: "mycelium-hypha",
            });
            hyphaLayer.appendChild(companionEl);

            // Allow downward/lateral signal transfer across inter-tree fungal bridges.
            const fromNode = a.y <= b.y ? a : b;
            const toNode = a.y <= b.y ? b : a;
            if (fromNode.edges.length < 3 && toNode.edges.length > 0) {
              const bridgePts = a.y <= b.y ? [a, p1, p2, b] : [b, p2, p1, a];
              const bridgeD = smoothPath(bridgePts);
              const bridgePathEl = el("path", { d: bridgeD, class: "mycelium-route-hidden" });
              hyphaLayer.appendChild(bridgePathEl);
              fromNode.edges.push({
                from: fromNode,
                to: toNode,
                d: bridgeD,
                pathEl: bridgePathEl,
                length: bridgePathEl.getTotalLength(),
                strokeW: 0.65,
                order: 3,
                isBridge: true,
              });
            }
          }

          bridgeCount++;
        }
      }
    }

    // 8. Prune dead-end branches that do not reach a visible folder cluster,
    // so every signal burst is guaranteed to arrive at a visible destination folder cluster!
    const reachesCluster = new Set();
    function markClusterReachability(gn, visited = new Set()) {
      if (visited.has(gn.id)) return reachesCluster.has(gn.id);
      visited.add(gn.id);
      let ok = Boolean(gn.cluster);
      for (const e of gn.edges) {
        if (markClusterReachability(e.to, visited)) {
          ok = true;
        }
      }
      if (ok) reachesCluster.add(gn.id);
      return ok;
    }
    trunks.forEach((t) => {
      if (t.rootGraphNode) markClusterReachability(t.rootGraphNode);
    });

    // Shuffle trunk firing order.
    trunkOrder = trunks.map((_, idx) => idx);
    for (let i = trunkOrder.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [trunkOrder[i], trunkOrder[j]] = [trunkOrder[j], trunkOrder[i]];
    }

    // Store reachability filter on each trunk for signal routing.
    trunks.forEach((t) => {
      t.reachesCluster = reachesCluster;
    });

    if (!reducedMotionQuery.matches && !document.hidden) {
      scheduleNextBurst(1000);
    }
  }

  function spawnEdgePulse(edge, delayMs, speed, splitsRemaining, reachesCluster) {
    const trailLen = Math.min(62, Math.max(22, edge.length * 0.42));
    const coreLen = trailLen * 0.68;
    const group = el("g", { class: "mycelium-pulse", opacity: "0" });

    const glowStreak = el("path", {
      d: edge.d,
      class: "mycelium-pulse-streak-glow",
      "stroke-width": Math.max(3.2, edge.strokeW * 2.8).toFixed(2),
      "stroke-dasharray": `${trailLen.toFixed(1)} ${(edge.length + trailLen).toFixed(1)}`,
      "stroke-dashoffset": `${trailLen.toFixed(1)}`,
    });

    const coreStreak = el("path", {
      d: edge.d,
      class: "mycelium-pulse-streak-core",
      "stroke-width": Math.max(1.15, edge.strokeW * 1.05).toFixed(2),
      "stroke-dasharray": `${coreLen.toFixed(1)} ${(edge.length + trailLen).toFixed(1)}`,
      "stroke-dashoffset": `${coreLen.toFixed(1)}`,
    });

    const auraRadius = edge.order === 1 ? "9.5" : edge.order === 2 ? "7.8" : "6.2";
    const headRadius = edge.order === 1 ? "2.2" : edge.order === 2 ? "1.8" : "1.45";

    const aura = el("circle", { r: auraRadius, class: "mycelium-pulse-aura" });
    const head = el("circle", { r: headRadius, class: "mycelium-pulse-head" });

    group.appendChild(glowStreak);
    group.appendChild(coreStreak);
    group.appendChild(aura);
    group.appendChild(head);
    pulseLayer.appendChild(group);

    activePulses.push({
      edge,
      group,
      glowStreak,
      coreStreak,
      aura,
      head,
      trailLen,
      coreLen,
      delayRemaining: delayMs,
      distance: 0,
      speed,
      splitsRemaining,
      reachesCluster,
    });
  }

  function fireTrunkBurst() {
    burstTimer = null;
    if (reducedMotionQuery.matches || document.hidden || trunks.length === 0) return;

    const trunkIdx = trunkOrder[trunkCursor % trunkOrder.length];
    trunkCursor += 1;
    const trunk = trunks[trunkIdx];
    if (!trunk.rootGraphNode) return;

    const validButtressEdges = trunk.rootGraphNode.edges.filter((e) =>
      trunk.reachesCluster.has(e.to.id)
    );
    const startEdges = validButtressEdges.length ? validButtressEdges : trunk.rootGraphNode.edges;
    if (!startEdges.length) return;

    // 1. Awaken 2 internal vascular sap veins in this trunk before bytes enter the roots.
    const chosenVeins = trunk.sapVeins.slice(0, 3);
    activeTrunkGlows.push({
      veins: chosenVeins,
      elapsed: 0,
      duration: 3100,
    });

    // 2. Dispatch 2 to 3 slow, calm pulses from this trunk into the root network.
    const pulseCount = Math.random() < 0.45 ? 2 : 3;
    const baseEdgeIdx = Math.floor(Math.random() * startEdges.length);

    for (let i = 0; i < pulseCount; i++) {
      const eIdx =
        i === 1 && startEdges.length > 1 && Math.random() < 0.65
          ? (baseEdgeIdx + 1) % startEdges.length
          : baseEdgeIdx;

      const speed = 64 + Math.random() * 14;
      const allowSplits = i === 0 ? 1 : 0;
      spawnEdgePulse(startEdges[eIdx], 280 + i * 1100, speed, allowSplits, trunk.reachesCluster);
    }

    startLoop();
  }

  function scheduleNextBurst(delayMs) {
    if (burstTimer !== null || reducedMotionQuery.matches || document.hidden) return;
    const wait = typeof delayMs === "number" ? delayMs : 3600 + Math.random() * 2200;
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

    const dtMs = Math.min(64, Math.max(0, now - lastFrameTime));
    const dtSec = dtMs / 1000;
    lastFrameTime = now;

    // 1. Trunk vascular sap awakening glow.
    for (let i = activeTrunkGlows.length - 1; i >= 0; i--) {
      const g = activeTrunkGlows[i];
      g.elapsed += dtMs;
      const t = g.elapsed / g.duration;
      if (t >= 1) {
        for (const v of g.veins) v.setAttribute("opacity", "0");
        activeTrunkGlows.splice(i, 1);
        continue;
      }
      const alpha = Math.sin(t * Math.PI) * 0.56;
      for (const v of g.veins) v.setAttribute("opacity", alpha.toFixed(3));
    }

    // 2. Edge-walking pulses with biological fork division.
    for (let i = activePulses.length - 1; i >= 0; i--) {
      const p = activePulses[i];
      if (p.delayRemaining > 0) {
        p.delayRemaining -= dtMs;
        continue;
      }

      p.distance += p.speed * dtSec;
      const total = p.edge.length;

      if (p.distance >= total) {
        const dest = p.edge.to;

        if (dest.sparkEl) {
          activeSparks.push({ el: dest.sparkEl, elapsed: 0, duration: 720 });
        }

        if (dest.cluster) {
          dest.cluster.group.classList.add("is-blooming");
          activeBlooms.push({
            group: dest.cluster.group,
            outerRing: dest.cluster.outerRing,
            innerRing: dest.cluster.innerRing,
            elapsed: 0,
            duration: 1450,
          });
        }

        // Prefer child edges that lead to visible folder clusters in open corridors.
        if (dest.edges.length > 0 && !dest.cluster) {
          const viable = p.reachesCluster
            ? dest.edges.filter((e) => p.reachesCluster.has(e.to.id))
            : dest.edges;
          const candidates = viable.length > 0 ? viable : dest.edges;

          if (p.splitsRemaining > 0 && candidates.length > 1 && activePulses.length < 6) {
            spawnEdgePulse(candidates[0], 0, p.speed * 0.96, p.splitsRemaining - 1, p.reachesCluster);
            spawnEdgePulse(candidates[1], 75, p.speed * 0.92, 0, p.reachesCluster);
          } else {
            const nextEdge = candidates[Math.floor(Math.random() * candidates.length)];
            spawnEdgePulse(nextEdge, 0, p.speed * 0.98, p.splitsRemaining, p.reachesCluster);
          }
        }

        p.group.remove();
        activePulses.splice(i, 1);
        continue;
      }

      const pt = p.edge.pathEl.getPointAtLength(p.distance);
      p.head.setAttribute("cx", pt.x.toFixed(1));
      p.head.setAttribute("cy", pt.y.toFixed(1));
      p.aura.setAttribute("cx", pt.x.toFixed(1));
      p.aura.setAttribute("cy", pt.y.toFixed(1));

      p.glowStreak.setAttribute("stroke-dashoffset", (p.trailLen - p.distance).toFixed(1));
      p.coreStreak.setAttribute("stroke-dashoffset", (p.coreLen - p.distance).toFixed(1));

      const isRootEntry = p.edge.from.scNode && p.edge.from.scNode.depth === 0;
      const isTerminal = p.edge.to.edges.length === 0 || Boolean(p.edge.to.cluster);
      const fadeIn = isRootEntry ? Math.min(1, p.distance / 24) : 1;
      const fadeOut = isTerminal ? Math.min(1, (total - p.distance) / 22) : 1;
      p.group.setAttribute("opacity", Math.max(0, Math.min(fadeIn, fadeOut)).toFixed(3));
    }

    // 3. Synaptic junction sparks.
    for (let i = activeSparks.length - 1; i >= 0; i--) {
      const s = activeSparks[i];
      s.elapsed += dtMs;
      const t = s.elapsed / s.duration;
      if (t >= 1) {
        s.el.setAttribute("opacity", "0");
        s.el.setAttribute("r", "2.0");
        activeSparks.splice(i, 1);
        continue;
      }
      const ease = 1 - Math.pow(1 - t, 2);
      s.el.setAttribute("r", (2.0 + ease * 4.5).toFixed(2));
      s.el.setAttribute("opacity", ((1 - t) * 0.55).toFixed(3));
    }

    // 4. Destination folder cluster blooms.
    for (let i = activeBlooms.length - 1; i >= 0; i--) {
      const b = activeBlooms[i];
      b.elapsed += dtMs;
      const t = b.elapsed / b.duration;
      if (t >= 1) {
        b.outerRing.setAttribute("opacity", "0");
        b.outerRing.setAttribute("r", "4.5");
        b.innerRing.setAttribute("opacity", "0");
        b.innerRing.setAttribute("r", "2.6");
        b.group.classList.remove("is-blooming");
        activeBlooms.splice(i, 1);
        continue;
      }
      const easeOut = 1 - Math.pow(1 - t, 2.3);
      b.outerRing.setAttribute("r", (4.2 + easeOut * 12.5).toFixed(2));
      b.outerRing.setAttribute("opacity", ((1 - t) * 0.42).toFixed(3));
      b.innerRing.setAttribute("r", (2.5 + easeOut * 6.4).toFixed(2));
      b.innerRing.setAttribute("opacity", ((1 - t) * 0.62).toFixed(3));
    }

    // Sleep at 0% CPU between bursts.
    if (
      activePulses.length > 0 ||
      activeBlooms.length > 0 ||
      activeSparks.length > 0 ||
      activeTrunkGlows.length > 0
    ) {
      rafId = requestAnimationFrame(tick);
    } else {
      scheduleNextBurst();
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimersAndLoop();
    } else if (!reducedMotionQuery.matches) {
      if (
        activePulses.length > 0 ||
        activeBlooms.length > 0 ||
        activeSparks.length > 0 ||
        activeTrunkGlows.length > 0
      ) {
        startLoop();
      } else {
        scheduleNextBurst(1200);
      }
    }
  });

  const onMotionChange = () => {
    if (reducedMotionQuery.matches) {
      clearTimersAndLoop();
      clearAnimations();
    } else if (!document.hidden) {
      scheduleNextBurst(1100);
    }
  };
  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", onMotionChange);
  }

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
