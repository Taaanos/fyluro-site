/* Fyluro modular active background (v2): botanical media trunks and living mycorrhizal network. */

(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("mycelium-bg");
  if (!svg) return;

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Deterministic PRNG so the botanical structure stays stable across reloads.
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

  // Convert a sequence of points into a smooth Catmull-Rom cubic Bezier path.
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

  // Generate an organic, curving root path via guided angular random walk.
  function growOrganicPoints(startX, startY, initialAngle, stepLen, stepCount, spread, bounds, rand) {
    const pts = [{ x: startX, y: startY }];
    let x = startX;
    let y = startY;
    let angle = initialAngle;
    let drift = (rand() - 0.5) * 0.18;

    for (let i = 0; i < stepCount; i++) {
      // Gentle multi-step angular meander with soft downward gravity.
      drift = drift * 0.72 + (rand() - 0.5) * spread;
      angle += drift;

      // Soft downward gravity (PI / 2 is straight down).
      const gravity = (Math.PI * 0.5 - angle) * 0.08;
      angle += gravity;

      // Keep branches flowing generally downward (between 18 deg and 162 deg).
      angle = clamp(angle, 0.32, Math.PI - 0.32);

      let nx = x + Math.cos(angle) * stepLen;
      let ny = y + Math.sin(angle) * stepLen;

      // Soft edge repulsion so roots curve gracefully inward near viewport edges.
      if (nx < bounds.minX) {
        nx = bounds.minX + (bounds.minX - nx) * 0.4;
        angle = Math.min(angle, Math.PI * 0.42);
      } else if (nx > bounds.maxX) {
        nx = bounds.maxX - (nx - bounds.maxX) * 0.4;
        angle = Math.max(angle, Math.PI * 0.58);
      }

      if (ny > bounds.maxY) {
        ny = bounds.maxY - rand() * 14;
        pts.push({ x: nx, y: ny });
        break;
      }

      pts.push({ x: nx, y: ny });
      x = nx;
      y = ny;
    }

    return pts;
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
      b.outerRing.setAttribute("r", "5");
      b.innerRing.setAttribute("opacity", "0");
      b.innerRing.setAttribute("r", "3");
    }
    activeBlooms = [];

    for (const s of activeSparks) {
      s.el.setAttribute("opacity", "0");
      s.el.setAttribute("r", "2.2");
    }
    activeSparks = [];

    for (const g of activeTrunkGlows) {
      g.el.setAttribute("opacity", "0");
    }
    activeTrunkGlows = [];
  }

  function createJunctionSpark(layer, x, y) {
    const dot = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "1.4",
      class: "mycelium-junction-dot",
    });
    const spark = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "2.2",
      class: "mycelium-junction-spark",
      opacity: "0",
    });
    layer.appendChild(dot);
    layer.appendChild(spark);
    return spark;
  }

  function createFolderCluster(layer, x, y, rand) {
    const g = el("g", { class: "mycelium-folder-cluster" });

    // Soft double-ring bloom elements (hidden until a pulse arrives).
    const outerRing = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "5",
      class: "mycelium-cluster-ring-outer",
      opacity: "0",
    });
    const innerRing = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "3",
      class: "mycelium-cluster-ring-inner",
      opacity: "0",
    });
    g.appendChild(outerRing);
    g.appendChild(innerRing);

    // Tiny botanical root-tip micro-tendrils & satellite spores around the folder node.
    const satelliteCount = 2 + Math.floor(rand() * 3);
    for (let i = 0; i < satelliteCount; i++) {
      const a = (Math.PI * 2 * i) / satelliteCount + rand() * 0.9;
      const dist = 4.5 + rand() * 5.5;
      const sx = x + Math.cos(a) * dist;
      const sy = y + Math.sin(a) * dist;

      g.appendChild(
        el("line", {
          x1: x.toFixed(1),
          y1: y.toFixed(1),
          x2: sx.toFixed(1),
          y2: sy.toFixed(1),
          class: "mycelium-cluster-stem",
        })
      );
      g.appendChild(
        el("circle", {
          cx: sx.toFixed(1),
          cy: sy.toFixed(1),
          r: (0.9 + rand() * 0.5).toFixed(2),
          class: "mycelium-cluster-spore",
        })
      );
    }

    const core = el("circle", {
      cx: x.toFixed(1),
      cy: y.toFixed(1),
      r: "2.1",
      class: "mycelium-cluster-core",
    });
    g.appendChild(core);
    layer.appendChild(g);

    return { x, y, outerRing, innerRing };
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

    const rand = mulberry32(84219);
    const isCompact = W < 820;

    // Barely visible trunks occupy the top ~20% of the initial viewport.
    const viewportH = window.innerHeight || 900;
    const collarY = Math.round(clamp(Math.min(viewportH * 0.21, H * 0.2), 140, 230));

    // SVG gradients: vertical trunk fade + GPU-friendly radial glow for pulses.
    const defs = el("defs");

    const trunkGrad = el("linearGradient", {
      id: "mycelium-trunk-grad",
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1",
    });
    trunkGrad.appendChild(el("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": "0.18" }));
    trunkGrad.appendChild(el("stop", { offset: "58%", "stop-color": "currentColor", "stop-opacity": "1" }));
    trunkGrad.appendChild(el("stop", { offset: "90%", "stop-color": "currentColor", "stop-opacity": "0.45" }));
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
    sapGrad.appendChild(el("stop", { offset: "55%", "stop-color": "var(--accent)", "stop-opacity": "0.85" }));
    sapGrad.appendChild(el("stop", { offset: "100%", "stop-color": "var(--accent)", "stop-opacity": "0.2" }));
    defs.appendChild(sapGrad);

    const pulseGlow = el("radialGradient", {
      id: "mycelium-pulse-glow",
      cx: "50%",
      cy: "50%",
      r: "50%",
    });
    pulseGlow.appendChild(el("stop", { offset: "0%", "stop-color": "var(--accent)", "stop-opacity": "0.65" }));
    pulseGlow.appendChild(el("stop", { offset: "45%", "stop-color": "var(--accent)", "stop-opacity": "0.22" }));
    pulseGlow.appendChild(el("stop", { offset: "100%", "stop-color": "var(--accent)", "stop-opacity": "0" }));
    defs.appendChild(pulseGlow);

    svg.appendChild(defs);

    const horizonLayer = el("g", { class: "mycelium-horizon" });
    const trunkLayer = el("g", { class: "mycelium-trunks" });
    const hyphaLayer = el("g", { class: "mycelium-hyphae" });
    const rootOrder3Layer = el("g", { class: "mycelium-roots-o3" });
    const rootOrder2Layer = el("g", { class: "mycelium-roots-o2" });
    const rootOrder1Layer = el("g", { class: "mycelium-roots-o1" });
    const nodeLayer = el("g", { class: "mycelium-nodes" });
    pulseLayer = el("g", { class: "mycelium-pulses" });

    svg.appendChild(horizonLayer);
    svg.appendChild(trunkLayer);
    svg.appendChild(hyphaLayer);
    svg.appendChild(rootOrder3Layer);
    svg.appendChild(rootOrder2Layer);
    svg.appendChild(rootOrder1Layer);
    svg.appendChild(nodeLayer);
    svg.appendChild(pulseLayer);

    // Subtle organic forest-floor soil horizon around collarY.
    const horizonPts = [];
    const hSegs = 12;
    for (let i = 0; i <= hSegs; i++) {
      horizonPts.push({
        x: (W * i) / hSegs,
        y: collarY + Math.sin(i * 0.9) * 5 + (rand() - 0.5) * 4,
      });
    }
    horizonLayer.appendChild(el("path", { d: smoothPath(horizonPts), class: "mycelium-soil-line" }));

    // Distinct media-type trunks: each has its own width, buttress flare, and sway.
    const trunkSpecs = isCompact
      ? [
          { xFrac: 0.11, width: 24, flare: 2.3, sway: 6, barkLines: 4 },
          { xFrac: 0.50, width: 18, flare: 2.0, sway: -5, barkLines: 3 },
          { xFrac: 0.89, width: 26, flare: 2.4, sway: -7, barkLines: 4 },
        ]
      : [
          { xFrac: 0.06, width: 36, flare: 2.6, sway: 9, barkLines: 6 },
          { xFrac: 0.27, width: 22, flare: 2.1, sway: -6, barkLines: 4 },
          { xFrac: 0.73, width: 25, flare: 2.3, sway: 7, barkLines: 5 },
          { xFrac: 0.94, width: 34, flare: 2.5, sway: -8, barkLines: 6 },
        ];

    trunks = [];
    const hyphaAnchors = [];
    const bounds = { minX: 18, maxX: W - 18, maxY: H - 28 };

    // Graph node counter for tree-based branching signal routing.
    let nodeIdSeq = 0;
    const createGraphNode = (x, y, sparkEl = null, cluster = null) => ({
      id: nodeIdSeq++,
      x,
      y,
      edges: [],
      sparkEl,
      cluster,
    });

    const addEdge = (fromNode, toNode, pts, order, targetLayer) => {
      const d = smoothPath(pts);
      const pathEl = el("path", { d, class: `mycelium-root-o${order}` });
      targetLayer.appendChild(pathEl);
      const length = pathEl.getTotalLength();
      const edge = { from: fromNode, to: toNode, d, pathEl, length, order };
      fromNode.edges.push(edge);
      return edge;
    };

    trunkSpecs.forEach((spec, tIdx) => {
      const cx = Math.round(W * spec.xFrac);
      const topHalf = spec.width * 0.42;
      const waistHalf = spec.width * 0.46;
      const flareHalf = spec.width * spec.flare * 0.5;
      const sway = spec.sway;

      // Multi-curve botanical trunk silhouette with organic buttress root flare.
      const trunkD = [
        `M ${(cx - topHalf).toFixed(1)} 0`,
        `C ${(cx - waistHalf + sway * 0.35).toFixed(1)} ${(collarY * 0.36).toFixed(1)}, ${(cx - waistHalf + sway * 0.85).toFixed(1)} ${(collarY * 0.72).toFixed(1)}, ${(cx - flareHalf).toFixed(1)} ${(collarY + 6).toFixed(1)}`,
        `C ${(cx - flareHalf * 0.45).toFixed(1)} ${(collarY + 14).toFixed(1)}, ${(cx + flareHalf * 0.45).toFixed(1)} ${(collarY + 14).toFixed(1)}, ${(cx + flareHalf).toFixed(1)} ${(collarY + 6).toFixed(1)}`,
        `C ${(cx + waistHalf + sway * 0.85).toFixed(1)} ${(collarY * 0.72).toFixed(1)}, ${(cx + waistHalf + sway * 0.35).toFixed(1)} ${(collarY * 0.36).toFixed(1)}, ${(cx + topHalf).toFixed(1)} 0`,
        "Z",
      ].join(" ");
      trunkLayer.appendChild(el("path", { d: trunkD, class: "mycelium-trunk" }));

      // Layered bark fissures flowing down into the buttress flare.
      for (let b = 0; b < spec.barkLines; b++) {
        const frac = (b + 1) / (spec.barkLines + 1) - 0.5; // -0.4 to +0.4
        const xTop = cx + frac * topHalf * 1.75;
        const xMid = cx + frac * waistHalf * 1.9 + sway * 0.55 + (rand() - 0.5) * 4;
        const xBot = cx + frac * flareHalf * 1.55 + (rand() - 0.5) * 6;
        const yEnd = collarY + 4 + (1 - Math.abs(frac)) * 10;
        const barkD = smoothPath([
          { x: xTop, y: 0 },
          { x: xMid, y: collarY * 0.52 },
          { x: xBot, y: yEnd },
        ]);
        trunkLayer.appendChild(el("path", { d: barkD, class: "mycelium-bark" }));
      }

      // Internal sap-vein that softly illuminates when this media trunk fires.
      const sapD = smoothPath([
        { x: cx, y: 0 },
        { x: cx + sway * 0.5, y: collarY * 0.52 },
        { x: cx + sway * 0.25, y: collarY + 2 },
      ]);
      const sapVeinEl = el("path", { d: sapD, class: "mycelium-sap-vein", opacity: "0" });
      trunkLayer.appendChild(sapVeinEl);

      const collarNode = createGraphNode(cx + sway * 0.25, collarY + 2);
      const primaryCount = isCompact ? 2 : 3;

      for (let p = 0; p < primaryCount; p++) {
        const fan = primaryCount === 2 ? (p === 0 ? -1 : 1) : p - 1;
        const entryX = cx + fan * flareHalf * 0.48;
        const entryY = collarY + 2;

        // Primary root initial angle spreads outward before curving downward.
        const baseAngle = Math.PI * 0.5 + fan * (isCompact ? 0.42 : 0.54) + (rand() - 0.5) * 0.16;
        const stepLen = isCompact ? 54 : 64;
        const maxSteps = Math.max(8, Math.round((H - collarY) / (stepLen * 0.88)));
        const depthScale = p === 1 ? 0.96 : 0.68 + rand() * 0.24;
        const stepCount = Math.max(6, Math.round(maxSteps * depthScale));

        const primaryPts = growOrganicPoints(entryX, entryY, baseAngle, stepLen, stepCount, 0.34, bounds, rand);

        // Walk along the primary root, placing fork junctions every 2-3 steps.
        let prevNode = collarNode;
        let segStartIdx = 0;
        const forkIndices = [];
        for (let idx = 2; idx < primaryPts.length - 2; idx += 2 + Math.floor(rand() * 2)) {
          forkIndices.push(idx);
        }

        for (const fIdx of forkIndices) {
          const segPts = primaryPts.slice(segStartIdx, fIdx + 1);
          const fPt = primaryPts[fIdx];
          const spark = createJunctionSpark(nodeLayer, fPt.x, fPt.y);
          const forkNode = createGraphNode(fPt.x, fPt.y, spark);
          addEdge(prevNode, forkNode, segPts, 1, rootOrder1Layer);
          hyphaAnchors.push({ trunkIdx: tIdx, x: fPt.x, y: fPt.y });

          // Spawn Order 2 lateral root branching off this junction.
          const prevPt = primaryPts[fIdx - 1];
          const tangent = Math.atan2(fPt.y - prevPt.y, fPt.x - prevPt.x);
          const side = rand() > 0.5 ? 1 : -1;
          const o2Angle = clamp(tangent + side * (0.42 + rand() * 0.38), 0.28, Math.PI - 0.28);
          const o2Steps = 4 + Math.floor(rand() * 4);
          const o2Pts = growOrganicPoints(fPt.x, fPt.y, o2Angle, isCompact ? 38 : 48, o2Steps, 0.42, bounds, rand);

          if (o2Pts.length >= 3) {
            const subForkIdx = Math.min(o2Pts.length - 2, 1 + Math.floor(rand() * 2));
            const subPt = o2Pts[subForkIdx];
            const subSpark = createJunctionSpark(nodeLayer, subPt.x, subPt.y);
            const subForkNode = createGraphNode(subPt.x, subPt.y, subSpark);
            addEdge(forkNode, subForkNode, o2Pts.slice(0, subForkIdx + 1), 2, rootOrder2Layer);
            hyphaAnchors.push({ trunkIdx: tIdx, x: subPt.x, y: subPt.y });

            // Continue Order 2 to its terminal folder cluster.
            const o2EndPt = o2Pts[o2Pts.length - 1];
            const o2Cluster = createFolderCluster(nodeLayer, o2EndPt.x, o2EndPt.y, rand);
            const o2EndNode = createGraphNode(o2EndPt.x, o2EndPt.y, null, o2Cluster);
            addEdge(subForkNode, o2EndNode, o2Pts.slice(subForkIdx), 2, rootOrder2Layer);
            hyphaAnchors.push({ trunkIdx: tIdx, x: o2EndPt.x, y: o2EndPt.y });

            // Spawn Order 3 fine feeder root from subForkNode to another folder cluster.
            const o3Side = -side;
            const o3Angle = clamp(o2Angle + o3Side * (0.48 + rand() * 0.42), 0.24, Math.PI - 0.24);
            const o3Steps = 3 + Math.floor(rand() * 3);
            const o3Pts = growOrganicPoints(subPt.x, subPt.y, o3Angle, isCompact ? 28 : 34, o3Steps, 0.5, bounds, rand);
            const o3EndPt = o3Pts[o3Pts.length - 1];
            const o3Cluster = createFolderCluster(nodeLayer, o3EndPt.x, o3EndPt.y, rand);
            const o3EndNode = createGraphNode(o3EndPt.x, o3EndPt.y, null, o3Cluster);
            addEdge(subForkNode, o3EndNode, o3Pts, 3, rootOrder3Layer);
            hyphaAnchors.push({ trunkIdx: tIdx, x: o3EndPt.x, y: o3EndPt.y });

            // Add 1-2 delicate passive Order 3 rootlets for botanical richness.
            if (o3Pts.length >= 2) {
              const tipStart = o3Pts[1];
              const tendrilAngle = clamp(o3Angle + (rand() - 0.5) * 1.1, 0.2, Math.PI - 0.2);
              const tendrilPts = growOrganicPoints(tipStart.x, tipStart.y, tendrilAngle, 20, 3, 0.55, bounds, rand);
              rootOrder3Layer.appendChild(el("path", { d: smoothPath(tendrilPts), class: "mycelium-root-o3" }));
            }
          }

          prevNode = forkNode;
          segStartIdx = fIdx;
        }

        // Complete the final segment of the primary root to a terminal folder cluster.
        const finalSeg = primaryPts.slice(segStartIdx);
        const endPt = primaryPts[primaryPts.length - 1];
        const endCluster = createFolderCluster(nodeLayer, endPt.x, endPt.y, rand);
        const endNode = createGraphNode(endPt.x, endPt.y, null, endCluster);
        addEdge(prevNode, endNode, finalSeg, 1, rootOrder1Layer);
        hyphaAnchors.push({ trunkIdx: tIdx, x: endPt.x, y: endPt.y });
      }

      trunks.push({ id: tIdx, rootNode: collarNode, sapVeinEl });
    });

    // Order 4: Intricate mycorrhizal hyphae web bridging roots and neighboring trees.
    const maxHyphaDist = isCompact ? W * 0.36 : W * 0.24;
    let hyphaCount = 0;
    const maxHyphae = isCompact ? 34 : 68;

    for (let i = 0; i < hyphaAnchors.length && hyphaCount < maxHyphae; i++) {
      for (let j = i + 1; j < hyphaAnchors.length && hyphaCount < maxHyphae; j++) {
        const a = hyphaAnchors[i];
        const b = hyphaAnchors[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);

        const crossTree = a.trunkIdx !== b.trunkIdx;
        const maxD = crossTree ? maxHyphaDist * 1.25 : maxHyphaDist * 0.72;
        const chance = crossTree ? 0.34 : 0.16;

        if (dist > 42 && dist < maxD && Math.abs(dy) < H * 0.2 && rand() < chance) {
          // Organic doubly-curved fungal filament between anchors.
          const p1 = {
            x: a.x + dx * 0.33 + (rand() - 0.5) * 34,
            y: a.y + dy * 0.33 + (rand() - 0.5) * 28,
          };
          const p2 = {
            x: a.x + dx * 0.67 + (rand() - 0.5) * 34,
            y: a.y + dy * 0.67 + (rand() - 0.5) * 28,
          };
          const cls = rand() < 0.45 ? "mycelium-hypha-dotted" : "mycelium-hypha";
          hyphaLayer.appendChild(el("path", { d: smoothPath([a, p1, p2, b]), class: cls }));
          hyphaCount++;
        }
      }
    }

    // Build a varied trunk firing order so each media type takes turns naturally.
    trunkOrder = trunks.map((_, idx) => idx);
    for (let i = trunkOrder.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [trunkOrder[i], trunkOrder[j]] = [trunkOrder[j], trunkOrder[i]];
    }

    if (!reducedMotionQuery.matches && !document.hidden) {
      scheduleNextBurst(1100);
    }
  }

  function spawnEdgePulse(edge, delayMs, speed, splitsRemaining) {
    const trailLen = Math.min(58, Math.max(24, edge.length * 0.35));
    const group = el("g", { class: "mycelium-pulse", opacity: "0" });

    // Soft outer glowing filament + crisp inner core filament hugging the exact curve.
    const glowStreak = el("path", {
      d: edge.d,
      class: "mycelium-pulse-streak-glow",
      "stroke-dasharray": `${trailLen.toFixed(1)} ${(edge.length + trailLen).toFixed(1)}`,
      "stroke-dashoffset": `${trailLen.toFixed(1)}`,
    });

    const coreStreak = el("path", {
      d: edge.d,
      class: "mycelium-pulse-streak-core",
      "stroke-dasharray": `${(trailLen * 0.72).toFixed(1)} ${(edge.length + trailLen).toFixed(1)}`,
      "stroke-dashoffset": `${(trailLen * 0.72).toFixed(1)}`,
    });

    const aura = el("circle", {
      r: edge.order === 1 ? "9" : edge.order === 2 ? "7.5" : "6",
      class: "mycelium-pulse-aura",
    });

    const head = el("circle", {
      r: edge.order === 1 ? "2.3" : edge.order === 2 ? "1.9" : "1.5",
      class: "mycelium-pulse-head",
    });

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
      coreTrailLen: trailLen * 0.72,
      delayRemaining: delayMs,
      distance: 0,
      speed,
      splitsRemaining,
    });
  }

  function fireTrunkBurst() {
    burstTimer = null;
    if (reducedMotionQuery.matches || document.hidden || trunks.length === 0) return;

    // One media trunk activates at a time, like a camera card starting an ingest batch.
    const trunkIdx = trunkOrder[trunkCursor % trunkOrder.length];
    trunkCursor += 1;
    const trunk = trunks[trunkIdx];
    const startEdges = trunk.rootNode.edges;
    if (!startEdges.length) return;

    // Gently awaken the trunk's internal sap vein.
    activeTrunkGlows.push({
      el: trunk.sapVeinEl,
      elapsed: 0,
      duration: 2800,
    });

    // Emit 2 to 3 slow pulses staggered from this trunk.
    const pulseCount = Math.random() < 0.5 ? 2 : 3;
    const primaryEdgeIdx = Math.floor(Math.random() * startEdges.length);

    for (let i = 0; i < pulseCount; i++) {
      // Optionally route the second pulse down a sibling primary root of the same tree.
      const edgeIdx =
        i === 1 && startEdges.length > 1 && Math.random() < 0.6
          ? (primaryEdgeIdx + 1) % startEdges.length
          : primaryEdgeIdx;

      const speed = 64 + Math.random() * 14; // Calm, unhurried pace (px/sec).
      const allowSplits = i === 0 ? 1 : 0; // Let the lead pulse fork once to reach multiple folders.
      spawnEdgePulse(startEdges[edgeIdx], 260 + i * 1150, speed, allowSplits);
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

    // 1. Update trunk sap-vein awakening glow.
    for (let i = activeTrunkGlows.length - 1; i >= 0; i--) {
      const g = activeTrunkGlows[i];
      g.elapsed += dtMs;
      const t = g.elapsed / g.duration;
      if (t >= 1) {
        g.el.setAttribute("opacity", "0");
        activeTrunkGlows.splice(i, 1);
        continue;
      }
      // Smooth sine bell curve: rises gently, fades back to zero.
      const opacity = Math.sin(t * Math.PI) * 0.52;
      g.el.setAttribute("opacity", opacity.toFixed(3));
    }

    // 2. Update active edge-walking pulses.
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

        // Flash junction synapse if passing through a fork.
        if (dest.sparkEl) {
          activeSparks.push({ el: dest.sparkEl, elapsed: 0, duration: 680 });
        }

        // Bloom terminal folder cluster if reaching a root tip.
        if (dest.cluster) {
          activeBlooms.push({
            outerRing: dest.cluster.outerRing,
            innerRing: dest.cluster.innerRing,
            elapsed: 0,
            duration: 1250,
          });
        }

        // Route onward into child edges (with optional fork into two folders).
        if (dest.edges.length > 0) {
          if (p.splitsRemaining > 0 && dest.edges.length > 1 && activePulses.length < 6) {
            // Split across two child branches (e.g., routing bytes into two folders).
            const first = dest.edges[0];
            const second = dest.edges[1];
            spawnEdgePulse(first, 0, p.speed * 0.96, p.splitsRemaining - 1);
            spawnEdgePulse(second, 90, p.speed * 0.92, 0);
          } else {
            const nextEdge = dest.edges[Math.floor(Math.random() * dest.edges.length)];
            spawnEdgePulse(nextEdge, 0, p.speed * 0.97, p.splitsRemaining);
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
      p.coreStreak.setAttribute("stroke-dashoffset", (p.coreTrailLen - p.distance).toFixed(1));

      const fadeIn = Math.min(1, p.distance / 26);
      const fadeOut = p.edge.to.edges.length === 0 ? Math.min(1, (total - p.distance) / 28) : 1;
      p.group.setAttribute("opacity", Math.max(0, Math.min(fadeIn, fadeOut)).toFixed(3));
    }

    // 3. Update junction sparks.
    for (let i = activeSparks.length - 1; i >= 0; i--) {
      const s = activeSparks[i];
      s.elapsed += dtMs;
      const t = s.elapsed / s.duration;
      if (t >= 1) {
        s.el.setAttribute("opacity", "0");
        s.el.setAttribute("r", "2.2");
        activeSparks.splice(i, 1);
        continue;
      }
      const ease = 1 - Math.pow(1 - t, 2);
      s.el.setAttribute("r", (2.2 + ease * 4.2).toFixed(2));
      s.el.setAttribute("opacity", ((1 - t) * 0.5).toFixed(3));
    }

    // 4. Update terminal folder cluster blooms.
    for (let i = activeBlooms.length - 1; i >= 0; i--) {
      const b = activeBlooms[i];
      b.elapsed += dtMs;
      const t = b.elapsed / b.duration;
      if (t >= 1) {
        b.outerRing.setAttribute("opacity", "0");
        b.outerRing.setAttribute("r", "5");
        b.innerRing.setAttribute("opacity", "0");
        b.innerRing.setAttribute("r", "3");
        activeBlooms.splice(i, 1);
        continue;
      }
      const easeOut = 1 - Math.pow(1 - t, 2.2);
      b.outerRing.setAttribute("r", (4.5 + easeOut * 11.5).toFixed(2));
      b.outerRing.setAttribute("opacity", ((1 - t) * 0.36).toFixed(3));
      b.innerRing.setAttribute("r", (2.8 + easeOut * 6.0).toFixed(2));
      b.innerRing.setAttribute("opacity", ((1 - t) * 0.55).toFixed(3));
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
        scheduleNextBurst(1400);
      }
    }
  });

  const onMotionChange = () => {
    if (reducedMotionQuery.matches) {
      clearTimersAndLoop();
      clearAnimations();
    } else if (!document.hidden) {
      scheduleNextBurst(1200);
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
