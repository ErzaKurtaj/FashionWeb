/* ─────────────────────────────────────────────────────────────────────────
   PASSIONIS — capsule.js
   Capsule 01: a 3D walk-through showcase built from real shop products
   (name, price, photo). Each photo is shown as a flat picture in the scene.
   "Add to bag" adds the real product to the real, server-backed cart via
   window.PassionisCart (exposed by cart.js). Requires THREE (loaded before
   this file).
───────────────────────────────────────────────────────────────────────── */
(function () {
  var root = document.getElementById("capsule");
  if (!root) return;

  // A hand-picked selection of real catalogue products (see models/products.js
  // for the full list / source of truth for id, name, price, image).
  var PIECES = [
    { id: "1",  name: "Long Skirt and Top", price: "39.95 EUR", image: "/assets/images/set.jpg",
      desc: "Matching set in fluid fabric, cut for easy movement." },
    { id: "5",  name: "Satin Black Dress",  price: "35.95 EUR", image: "/assets/images/cutest.jpg",
      desc: "Liquid satin that catches the light with every step." },
    { id: "9",  name: "Shirt & Pants",      price: "55.95 EUR", image: "/assets/images/best.jpg",
      desc: "A tailored set built for quiet, old-money confidence." },
    { id: "13", name: "Blazer & Skirt",     price: "65.95 EUR", image: "/assets/images/STREET.jpg",
      desc: "Structured blazer paired with a sharp, straight skirt." },
    { id: "16", name: "Oversize Jacket",    price: "42.95 EUR", image: "/assets/images/jacket.jpg",
      desc: "Relaxed outerwear with room to layer underneath." },
    { id: "21", name: "White Long Dress",   price: "45.95 EUR", image: "/assets/images/whitedress.jpg",
      desc: "A clean, floor-length silhouette for your most important day." },
  ];

  var bg = 0xf2efe9, GAP = 5, idx = 0, visible = true;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- soft ground shadow (unchanged) ---------- */
  function shadowTex() {
    var c = document.createElement("canvas"); c.width = 128; c.height = 128; var g = c.getContext("2d");
    var gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    gr.addColorStop(0, "rgba(60,55,45,0.35)"); gr.addColorStop(1, "rgba(60,55,45,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
  }

  /* Crops a loaded texture to cover a planeAspect (w/h) box, the way CSS
     object-fit: cover crops a photo instead of stretching it. */
  function applyCoverUV(texture, planeAspect) {
    var img = texture.image;
    var imgAspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
    if (imgAspect > planeAspect) {
      var sx = planeAspect / imgAspect;
      texture.repeat.set(sx, 1);
      texture.offset.set((1 - sx) / 2, 0);
    } else {
      var sy = imgAspect / planeAspect;
      texture.repeat.set(1, sy);
      texture.offset.set(0, (1 - sy) / 2);
    }
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
  }

  /* ---------- UI ---------- */
  var dots = $("vcDots"), fbHost = null, target = 0, pos = 0, snapTimer = null;
  function go(i) { target = Math.max(0, Math.min(PIECES.length - 1, i)); }
  PIECES.forEach(function (p, i) {
    var b = document.createElement("button"); b.type = "button";
    b.setAttribute("aria-label", "Go to " + p.name); b.innerHTML = "<i></i>";
    b.addEventListener("click", function () { go(i); });
    dots.appendChild(b);
  });

  function syncBagCount() {
    var badge = document.getElementById("cart-count");
    $("vcBagN").textContent = badge ? badge.textContent : "0";
  }

  function showInfo() {
    var p = PIECES[idx];
    $("vcCount").textContent = String(idx + 1).padStart(2, "0") + " / " + String(PIECES.length).padStart(2, "0");
    $("vcName").textContent = p.name;
    $("vcPrice").textContent = p.price;
    $("vcDesc").textContent = p.desc;
    $("vcMsg").textContent = "";
    for (var i = 0; i < dots.children.length; i++) dots.children[i].setAttribute("aria-current", i === idx ? "true" : "false");
    if (fbHost) {
      fbHost.innerHTML = "";
      var img = document.createElement("img");
      img.src = p.image; img.alt = p.name;
      img.style.cssText = "max-width:100%;max-height:100%;object-fit:contain;";
      fbHost.appendChild(img);
    }
  }

  $("vcAdd").addEventListener("click", function () {
    var size  = root.querySelector('input[name="vcSize"]:checked').value;
    var piece = PIECES[idx];
    var msg   = $("vcMsg");

    if (!window.PassionisCart || !window.PassionisCart.add) {
      msg.textContent = "Couldn't reach your bag — please refresh and try again.";
      return;
    }

    msg.textContent = "Adding…";
    window.PassionisCart
      .add({ id: piece.id, name: piece.name, price: piece.price, image: piece.image }, size, 1)
      .then(function () {
        msg.textContent = piece.name + " (" + size + ") added to your bag.";
        syncBagCount();
      });
  });

  $("vcPrev").addEventListener("click", function () { go(Math.round(target) - 1); });
  $("vcNext").addEventListener("click", function () { go(Math.round(target) + 1); });

  /* ---------- 3D scene ---------- */
  var stage = $("vcStage"), renderer, scene, camera;
  function srgb(t) { if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; else if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding; return t; }

  var PLANE_ASPECT = 3 / 4; // matches the site's own product-photo crop (see .item-img-wrap)
  var H = 2.7, Wd = H * PLANE_ASPECT;

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(bg, 1);
    stage.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(bg, 5.5, 17);
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);

    var shTex = srgb(new THREE.CanvasTexture(shadowTex()));
    var loader = new THREE.TextureLoader();

    PIECES.forEach(function (p, i) {
      var x = i % 2 ? 0.45 : -0.45, z = -i * GAP;

      var sh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, fog: true }));
      sh.rotation.x = -Math.PI / 2; sh.position.set(x, -1.4, z); scene.add(sh);

      loader.load(p.image, function (tex) {
        srgb(tex);
        tex.anisotropy = 4;
        applyCoverUV(tex, PLANE_ASPECT);
        var m = new THREE.Mesh(new THREE.PlaneGeometry(Wd, H), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: true }));
        m.position.set(x, -0.05, z);
        scene.add(m);
      });
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
  showInfo(); syncBagCount(); frame();
})();
