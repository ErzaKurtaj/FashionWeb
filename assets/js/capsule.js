/* ─────────────────────────────────────────────────────────────────────────
   PASSIONIS — capsule.js
   Capsule 01: a 3D walk-through showcase for a small curated collection.
   Requires THREE (loaded before this file). Adapted from the EMOTIF concept.
───────────────────────────────────────────────────────────────────────── */
(function () {
  var root = document.getElementById("capsule");
  if (!root) return;

  var PIECES = [
    { name: "Long Coat", price: 340, desc: "Wool blend, below the knee, one button. Worn over slim black trousers.",
      spec: { skin: "#d9a98a", hair: { c: "#2a1a12", s: "bun" }, top: { c: "#7a2230", end: 690, collar: false }, bottom: { t: "slim", c: "#1d1d1f" }, shoe: "#151515" } },
    { name: "Utility Set", price: 260, desc: "Cotton twill jacket with a wide, high-waisted trouser in the same olive.",
      spec: { skin: "#b9805f", hair: { c: "#16100c", s: "short" }, top: { c: "#6b6a3a", end: 470 }, bottom: { t: "wide", c: "#6b6a3a" }, shoe: "#3b2a1c" } },
    { name: "Knit and Trouser", price: 220, desc: "Heavy cream knit, relaxed fit, with a charcoal tailored trouser.",
      spec: { skin: "#e8bf9f", hair: { c: "#a8521f", s: "long" }, top: { c: "#e9e0cc", end: 440 }, bottom: { t: "slim", c: "#3a3d44" }, shoe: "#232323" } },
    { name: "Midi Dress", price: 190, desc: "Fluid slate-blue dress that ends mid-calf. Cut to move when you walk.",
      spec: { skin: "#c68e6d", hair: { c: "#1b1411", s: "long" }, top: { c: "#46607c", end: 700, dress: true }, bottom: { t: "none" }, shoe: "#e8e1d2" } },
    { name: "Trench", price: 310, desc: "Camel gabardine, water resistant, belted. A long line from shoulder to ankle.",
      spec: { skin: "#f0cdb0", hair: { c: "#3a2a1c", s: "short" }, top: { c: "#b88a54", end: 760, collar: true }, bottom: { t: "slim", c: "#2a2a2c" }, shoe: "#1a1a1a" } },
    { name: "Turtleneck and Skirt", price: 170, desc: "Fine black turtleneck with an ivory pleated skirt that stops below the knee.",
      spec: { skin: "#a8704f", hair: { c: "#120d0a", s: "bun" }, top: { c: "#161618", end: 430, collar: true }, bottom: { t: "skirt", c: "#eae3d2" }, shoe: "#161618" } }
  ];

  var bg = 0xf2efe9, GAP = 5, bag = 0, idx = 0, visible = true;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- figure drawing ---------- */
  function poly(g, pts, col) {
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath(); g.fillStyle = col; g.fill();
    g.strokeStyle = "rgba(0,0,0,0.14)"; g.lineWidth = 2; g.stroke();
  }
  function ell(g, x, y, rx, ry, col) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = col; g.fill(); }

  function drawFigure(s) {
    var c = document.createElement("canvas"); c.width = 400; c.height = 900;
    var g = c.getContext("2d"), cx = 200, hipY = 410, ankleY = 820, sd;
    if (s.hair.s === "long") poly(g, [[cx - 40, 80], [cx + 40, 80], [cx + 48, 260], [cx - 48, 260]], s.hair.c);
    var b = s.bottom;
    if (b.t === "slim" || b.t === "wide") {
      var aw = b.t === "wide" ? 26 : 12;
      for (sd = -1; sd <= 1; sd += 2) poly(g, [[cx + sd * 3, hipY - 10], [cx + sd * 56, hipY - 10], [cx + sd * (24 + aw), ankleY], [cx + sd * Math.max(4, 24 - aw), ankleY]], b.c);
    } else {
      for (sd = -1; sd <= 1; sd += 2) poly(g, [[cx + sd * 6, 620], [cx + sd * 40, 620], [cx + sd * 34, ankleY], [cx + sd * 12, ankleY]], s.skin);
      if (b.t === "skirt") poly(g, [[cx - 54, 400], [cx + 54, 400], [cx + 98, 650], [cx - 98, 650]], b.c);
    }
    if (!s.top.dress) {
      for (sd = -1; sd <= 1; sd += 2) ell(g, cx + sd * 36, ankleY + 14, 28, 11, s.shoe);
    } else {
      for (sd = -1; sd <= 1; sd += 2) {
        poly(g, [[cx + sd * 12, 700], [cx + sd * 38, 700], [cx + sd * 32, ankleY], [cx + sd * 14, ankleY]], s.skin);
        ell(g, cx + sd * 36, ankleY + 14, 28, 11, s.shoe);
      }
    }
    poly(g, [[cx - 12, 120], [cx + 12, 120], [cx + 13, 180], [cx - 13, 180]], s.skin);
    var t = s.top, hw = t.end > 410 ? 56 + (t.end - 410) * 0.15 : 54;
    poly(g, [[cx - 62, 172], [cx + 62, 172], [cx + 46, 300], [cx + hw, t.end], [cx - hw, t.end], [cx - 46, 300]], t.c);
    if (t.end > 600) {
      g.strokeStyle = "rgba(0,0,0,0.16)"; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, 190); g.lineTo(cx, t.end); g.stroke();
      if (!t.dress) { g.beginPath(); g.moveTo(cx - 44, 300); g.lineTo(cx + 44, 300); g.stroke(); }
    }
    for (sd = -1; sd <= 1; sd += 2) {
      poly(g, [[cx + sd * 56, 172], [cx + sd * 74, 178], [cx + sd * (t.dress ? 78 : 92), t.dress ? 330 : 500], [cx + sd * (t.dress ? 62 : 66), t.dress ? 330 : 498]], t.c);
      ell(g, cx + sd * (t.dress ? 70 : 80), t.dress ? 350 : 520, 11, 15, s.skin);
    }
    if (t.dress) for (sd = -1; sd <= 1; sd += 2) poly(g, [[cx + sd * 66, 330], [cx + sd * 78, 336], [cx + sd * 80, 480], [cx + sd * 70, 482]], s.skin);
    if (t.collar) poly(g, [[cx - 18, 150], [cx + 18, 150], [cx + 22, 184], [cx - 22, 184]], t.c);
    ell(g, cx, 98, 30, 38, s.skin);
    if (s.hair.s === "bun") { ell(g, cx, 52, 18, 16, s.hair.c); poly(g, [[cx - 31, 98], [cx - 26, 62], [cx, 52], [cx + 26, 62], [cx + 31, 98], [cx + 20, 72], [cx - 20, 72]], s.hair.c); }
    else if (s.hair.s === "long") poly(g, [[cx - 34, 108], [cx - 28, 60], [cx, 52], [cx + 28, 60], [cx + 34, 108], [cx + 22, 74], [cx - 22, 74]], s.hair.c);
    else poly(g, [[cx - 32, 96], [cx - 28, 62], [cx, 54], [cx + 28, 62], [cx + 32, 96], [cx + 18, 70], [cx - 18, 70]], s.hair.c);
    return c;
  }
  function shadowTex() {
    var c = document.createElement("canvas"); c.width = 128; c.height = 128; var g = c.getContext("2d");
    var gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    gr.addColorStop(0, "rgba(60,55,45,0.35)"); gr.addColorStop(1, "rgba(60,55,45,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
  }
  var figs = PIECES.map(function (p) { return drawFigure(p.spec); });

  /* ---------- UI ---------- */
  var dots = $("vcDots"), fbHost = null, target = 0, pos = 0, snapTimer = null;
  function go(i) { target = Math.max(0, Math.min(PIECES.length - 1, i)); }
  PIECES.forEach(function (p, i) {
    var b = document.createElement("button"); b.type = "button";
    b.setAttribute("aria-label", "Go to " + p.name); b.innerHTML = "<i></i>";
    b.addEventListener("click", function () { go(i); });
    dots.appendChild(b);
  });
  function showInfo() {
    var p = PIECES[idx];
    $("vcCount").textContent = String(idx + 1).padStart(2, "0") + " / " + String(PIECES.length).padStart(2, "0");
    $("vcName").textContent = p.name;
    $("vcPrice").textContent = "€" + p.price;
    $("vcDesc").textContent = p.desc;
    $("vcMsg").textContent = "";
    for (var i = 0; i < dots.children.length; i++) dots.children[i].setAttribute("aria-current", i === idx ? "true" : "false");
    if (fbHost) { fbHost.innerHTML = ""; fbHost.appendChild(figs[idx]); }
  }
  $("vcAdd").addEventListener("click", function () {
    var size = root.querySelector('input[name="vcSize"]:checked').value;
    bag++; $("vcBagN").textContent = bag;
    $("vcMsg").textContent = PIECES[idx].name + " (" + size + ") added — preview only, not yet in checkout.";
  });
  $("vcPrev").addEventListener("click", function () { go(Math.round(target) - 1); });
  $("vcNext").addEventListener("click", function () { go(Math.round(target) + 1); });

  /* ---------- 3D scene ---------- */
  var stage = $("vcStage"), renderer, scene, camera;
  function srgb(t) { if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding; return t; }
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(bg, 1);
    stage.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(bg, 5.5, 17);
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    var H = 2.7, Wd = H * 400 / 900, shTex = srgb(new THREE.CanvasTexture(shadowTex()));
    figs.forEach(function (cv, i) {
      var tex = srgb(new THREE.CanvasTexture(cv)); tex.anisotropy = 4;
      var m = new THREE.Mesh(new THREE.PlaneGeometry(Wd, H), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02, fog: true }));
      var x = i % 2 ? 0.45 : -0.45, z = -i * GAP;
      m.position.set(x, -0.05, z); scene.add(m);
      var sh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, fog: true }));
      sh.rotation.x = -Math.PI / 2; sh.position.set(x, -1.4, z); scene.add(sh);
    });
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 80), new THREE.MeshBasicMaterial({ color: 0xe9e4d8, fog: true }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, -1.41, -20); scene.add(floor);
  } catch (e) {
    renderer = null;
    fbHost = $("vcFallback"); fbHost.style.display = "grid"; stage.style.display = "none";
  }

  function resize() {
    if (!renderer) return;
    var w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize); resize();

  var mx = 0, my = 0;
  root.addEventListener("pointermove", function (e) {
    var r = root.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5;
  });

  function clampT(v) { return Math.max(0, Math.min(PIECES.length - 1, v)); }
  function schedSnap() { clearTimeout(snapTimer); snapTimer = setTimeout(function () { go(Math.round(target)); }, 140); }

  // Wheel moves through the capsule, but lets the page scroll once you reach either end.
  stage.addEventListener("wheel", function (e) {
    var d = e.deltaY + e.deltaX;
    if ((d < 0 && target <= 0) || (d > 0 && target >= PIECES.length - 1)) return;
    e.preventDefault(); target = clampT(target + d * 0.0022); schedSnap();
  }, { passive: false });

  var drag = null;
  stage.addEventListener("pointerdown", function (e) { drag = { x: e.clientX }; try { stage.setPointerCapture(e.pointerId); } catch (x) {} });
  stage.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var d = drag.x - e.clientX; drag.x = e.clientX;
    target = clampT(target + d * 0.006); schedSnap();
  });
  stage.addEventListener("pointerup", function () { drag = null; schedSnap(); });
  stage.addEventListener("pointercancel", function () { drag = null; });

  // Arrow keys only act while focus is inside the section.
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { go(Math.round(target) + 1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { go(Math.round(target) - 1); e.preventDefault(); }
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(root);
  }

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    pos += (target - pos) * (reduce ? 1 : 0.075);
    if (Math.abs(target - pos) < 0.0005) pos = target;
    var near = Math.round(pos); if (near !== idx) { idx = near; showInfo(); }
    if (renderer) {
      var wide = stage.clientWidth > 760;
      camera.position.set((wide ? -0.7 : 0) + (reduce ? 0 : mx * 0.25), 0.05 - (reduce ? 0 : my * 0.1), -pos * GAP + 4.7);
      camera.lookAt(camera.position.x * 0.6, -0.05, camera.position.z - 6);
      renderer.render(scene, camera);
    }
  }
  showInfo(); frame();
})();
