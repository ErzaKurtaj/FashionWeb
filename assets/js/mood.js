/* ─────────────────────────────────────────────────────────────────────────
   PASSIONIS — mood.js
   "Mood Wardrobe": emotion selector, outfit carousel, and note interpreter.
   Adapted from the EMOTIF concept. Scroll-reveal, header and nav are already
   handled by main.js — this file only owns the mood-section behaviour.
───────────────────────────────────────────────────────────────────────── */

(function () {
  const moodSection = document.getElementById("mood-select");
  if (!moodSection) return; // section not present on this page

  /* ─── Data ────────────────────────────────────────────────────────── */
  const moodData = {
    serene: {
      title: "Serene",
      caption: "Pale neutrals, flowing fabrics, easy shapes.",
      chips: ["Pale neutrals", "Flowing", "Easy"],
      outfits: [
        "assets/images/elegant.png", "assets/images/elegant1.jpg", "assets/images/elegant2.jpg",
        "assets/images/elegant6.png", "assets/images/elegant5.png",
      ],
    },
    effortless: {
      title: "Effortless",
      caption: "Bright palettes, light fabrics, playful shapes.",
      chips: ["Bright", "Light", "Playful"],
      outfits: [
        "assets/images/calm3.png", "assets/images/calm7.png", "assets/images/calm.png",
        "assets/images/calm2.png", "assets/images/calm4.png",
      ],
    },
    bold: {
      title: "Bold",
      caption: "Strong contrast, sharp tailoring, statement pieces.",
      chips: ["Contrast", "Tailored", "Statement"],
      outfits: [
        "assets/images/confy.png", "assets/images/draping.png", "assets/images/confident2.png",
        "assets/images/confident3.png", "assets/images/confident4.png",
      ],
    },
    reflective: {
      title: "Reflective",
      caption: "Muted tones, layered looks, long lines.",
      chips: ["Muted", "Layered", "Long lines"],
      outfits: [
        "assets/images/cozy.png", "assets/images/cozy3.png", "assets/images/cozy1.png",
        "assets/images/cozy4.png", "assets/images/cozy5.png",
      ],
    },
  };

  // Dedicated "note" imagery only exists for Serene (brown1-5); the other
  // moods fall back to their own outfit set so the interpreter never shows
  // a broken image. Drop in note-effortless-*/note-bold-*/note-reflective-*
  // files later and list them here to give those moods their own pool.
  const noteData = {
    serene:     { images: ["assets/images/brown1.png", "assets/images/brown2.png", "assets/images/brown3.png", "assets/images/brown4.png", "assets/images/brown5.png"] },
    effortless: { images: moodData.effortless.outfits },
    bold:       { images: moodData.bold.outfits },
    reflective: { images: moodData.reflective.outfits },
  };

  /* ─── Breakpoints ────────────────────────────────────────────────── */
  const bp = {
    mobile: window.matchMedia("(max-width: 1040px)"),
    xs:     window.matchMedia("(max-width: 480px)"),
  };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  /* ─── State ──────────────────────────────────────────────────────── */
  let currentIndex    = 0;
  let lastNoteEmotion = null;

  /* ─── DOM ────────────────────────────────────────────────────────── */
  const buttons         = moodSection.querySelectorAll(".mood-row");
  const moodRows        = document.getElementById("moodRows");
  const moodRight       = document.getElementById("moodRight");
  const rightImages     = moodRight ? moodRight.querySelectorAll(".mood-right-images img") : [];
  const rightCaptions   = moodRight ? moodRight.querySelectorAll(".mood-right-caption") : [];
  const mobileThumb     = document.getElementById("moodMobileThumb");
  const mobileThumbImgs = mobileThumb ? mobileThumb.querySelectorAll("img") : [];
  const mobileThumbTitle = document.getElementById("moodMobileThumbTitle");
  const mobileThumbDesc  = document.getElementById("moodMobileThumbDesc");
  const stateTitle     = document.getElementById("moodStateTitle");
  const stateCaption   = document.getElementById("moodStateCaption");
  const chipsEl        = document.getElementById("moodChips");
  const track          = document.getElementById("moodCarouselTrack");
  const plateFrame     = document.querySelector(".mood-plate-frame");
  const prevBtn        = document.querySelector(".mood-plate-nav .prev");
  const nextBtn        = document.querySelector(".mood-plate-nav .next");
  const counterCur     = document.getElementById("moodCarouselCurrent");
  const counterTotal   = document.getElementById("moodCarouselTotal");
  const noteInput      = document.getElementById("moodNoteInput");
  const noteSubmit     = document.getElementById("moodNoteSubmit");
  const noteResponse   = document.getElementById("moodNoteResponse");
  const interpretBox   = document.getElementById("moodInterpretationCards");
  const resultsSection = document.getElementById("mood-wardrobe");

  /* ─── Emotion select ─────────────────────────────────────────────── */
  // Desktop (fine pointer): hovering a row reveals that mood on the right
  // panel — pure exploration, nothing is committed yet. Clicking a row (any
  // pointer type) commits it — same as before: populates the wardrobe
  // carousel below and scrolls to it. On touch, there's no hover, so a tap
  // does both at once (reveals the mobile thumbnail AND commits).
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;

  // Right panel: shows a photo at all times — auto-cycling through every
  // mood on a timer when idle, "just color + the current photo drifting
  // through," rather than sitting empty. Hovering a row pauses the cycle
  // and locks the panel to that specific mood; leaving resumes it.
  const AUTO_CYCLE_MOODS = ["serene", "effortless", "bold", "reflective"];
  let autoCycleIndex = 0;
  let autoCycleTimer = null;

  function showRightPanel(mood) {
    rightImages.forEach((img) => img.classList.toggle("is-shown", img.dataset.mood === mood));
    rightCaptions.forEach((cap) => cap.classList.toggle("is-shown", cap.dataset.mood === mood));
  }

  function startAutoCycle() {
    stopAutoCycle();
    autoCycleTimer = setInterval(() => {
      autoCycleIndex = (autoCycleIndex + 1) % AUTO_CYCLE_MOODS.length;
      showRightPanel(AUTO_CYCLE_MOODS[autoCycleIndex]);
    }, 3200);
  }

  function stopAutoCycle() {
    clearInterval(autoCycleTimer);
  }

  function setActiveRow(mood, btn) {
    buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
    moodRows?.classList.add("has-active");

    showRightPanel(mood);

    if (mobileThumb) {
      mobileThumb.hidden = false;
      mobileThumbImgs.forEach((img) => img.classList.toggle("is-shown", img.dataset.mood === mood));
      if (mobileThumbTitle) mobileThumbTitle.textContent = btn.querySelector(".mood-row-title")?.textContent || "";
      if (mobileThumbDesc)  mobileThumbDesc.textContent  = btn.dataset.descriptor || "";
    }
  }

  function clearActiveRow() {
    buttons.forEach((b) => b.classList.remove("is-active"));
    moodRows?.classList.remove("has-active");
  }

  buttons.forEach((btn) => {
    if (isFinePointer) {
      btn.addEventListener("pointerenter", () => {
        stopAutoCycle();
        setActiveRow(btn.dataset.mood, btn);
      });
    }
    btn.addEventListener("click", () => {
      if (!isFinePointer) setActiveRow(btn.dataset.mood, btn);
      loadMood(btn.dataset.mood);
    });
  });

  if (isFinePointer && moodRows) {
    moodRows.addEventListener("pointerleave", () => {
      clearActiveRow();
      startAutoCycle();
    });
  }

  if (moodRight) {
    showRightPanel(AUTO_CYCLE_MOODS[autoCycleIndex]);
    if (isFinePointer) startAutoCycle();
  }

  function loadMood(mood) {
    const data = moodData[mood];
    if (!data) return;

    if (stateTitle)   stateTitle.textContent   = data.title;
    if (stateCaption) stateCaption.textContent = data.caption;

    if (chipsEl) {
      chipsEl.innerHTML = "";
      (data.chips || []).forEach((label) => {
        const span = document.createElement("span");
        span.className   = "mood-chip";
        span.textContent = label;
        chipsEl.appendChild(span);
      });
    }

    buildCarousel(data.outfits);

    setTimeout(() => {
      resultsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  /* ─── Carousel ───────────────────────────────────────────────────
     A single specimen plate that crossfades between looks — not a card
     fan — so desktop and mobile share the exact same mechanics. ────── */
  function buildCarousel(outfits) {
    if (!track) return;
    track.innerHTML = "";
    currentIndex = 0;

    outfits.forEach((src) => {
      const div = document.createElement("div");
      div.className = "mood-look";
      div.innerHTML = `<img src="${src}" alt="" loading="lazy">`;
      track.appendChild(div);
    });

    if (counterTotal) counterTotal.textContent = String(outfits.length).padStart(2, "0");

    track.classList.add("no-anim");
    updateCarousel();
    requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove("no-anim")));
  }

  function updateCarousel() {
    if (!track) return;
    const looks = track.querySelectorAll(".mood-look");
    looks.forEach((look, i) => look.classList.toggle("is-center", i === currentIndex));
    if (counterCur) counterCur.textContent = String(currentIndex + 1).padStart(2, "0");
  }

  function stepCarousel(dir) {
    if (!track) return;
    const total = track.querySelectorAll(".mood-look").length;
    if (!total) return;
    currentIndex = Math.max(0, Math.min(total - 1, currentIndex + dir));
    updateCarousel();
  }

  prevBtn?.addEventListener("click", () => stepCarousel(-1));
  nextBtn?.addEventListener("click", () => stepCarousel(+1));

  document.addEventListener("keydown", (e) => {
    if (!resultsSection) return;
    const hasFocus = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
    if (hasFocus) return;
    const r = resultsSection.getBoundingClientRect();
    const inView = r.top < window.innerHeight && r.bottom > 0;
    if (!inView) return;
    if (e.key === "ArrowLeft")  stepCarousel(-1);
    if (e.key === "ArrowRight") stepCarousel(+1);
  });

  (function initSwipe() {
    if (!plateFrame) return;
    let startX = 0, startY = 0;
    plateFrame.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    plateFrame.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      stepCarousel(dx < 0 ? +1 : -1);
    }, { passive: true });
  })();

  /* ─── Note interpretation ────────────────────────────────────────── */
  noteSubmit?.addEventListener("click", interpretNote);
  noteInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") interpretNote(); });

  function interpretNote() {
    const text = noteInput.value.toLowerCase().trim();
    if (!text) return;

    let mood = "serene";
    if      (text.includes("soft")   || text.includes("neutral") || text.includes("linen"))  mood = "effortless";
    else if (text.includes("hoodie") || text.includes("layered") || text.includes("grey"))   mood = "reflective";
    else if (text.includes("bold")   || text.includes("contrast") || text.includes("red"))   mood = "bold";
    else if (text.includes("black")  || text.includes("blazer")  || text.includes("sharp"))  mood = "serene";

    lastNoteEmotion = mood;
    if (noteResponse) noteResponse.textContent = `Reads as ${moodData[mood].title.toLowerCase()} — here's where that leads.`;
    renderCards(mood);
  }

  function renderCards(mood) {
    const data = noteData[mood];
    if (!data || !interpretBox) return;

    interpretBox.innerHTML = "";
    interpretBox.hidden    = false;

    const allPositions = ["far-left", "left", "center", "right", "far-right"];
    const xsPositions   = ["left", "center", "right"];

    const useXS     = bp.xs.matches;
    const positions = useXS ? xsPositions : allPositions;
    const count     = useXS ? 3 : 5;

    const shuffled = [...data.images].sort(() => Math.random() - 0.5).slice(0, count);

    shuffled.forEach((src, i) => {
      const card = document.createElement("div");
      card.className = `note-card ${positions[i]}`;
      card.innerHTML = `<img src="${src}" alt="" loading="lazy">`;
      interpretBox.appendChild(card);
    });
  }

  /* ─── Resize handling ────────────────────────────────────────────── */
  const onResize = debounce(() => {
    updateCarousel();
    if (lastNoteEmotion && interpretBox && !interpretBox.hidden) renderCards(lastNoteEmotion);
  }, 200);

  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      updateCarousel();
      if (lastNoteEmotion && interpretBox && !interpretBox.hidden) renderCards(lastNoteEmotion);
    }, 300);
  }, { passive: true });

  /* ─── Init: load the first mood so the section isn't empty ──────── */
  loadMoodSilently("serene");

  function loadMoodSilently(mood) {
    const data = moodData[mood];
    if (!data) return;
    if (stateTitle)   stateTitle.textContent   = data.title;
    if (stateCaption) stateCaption.textContent = data.caption;
    if (chipsEl) {
      (data.chips || []).forEach((label) => {
        const span = document.createElement("span");
        span.className   = "mood-chip";
        span.textContent = label;
        chipsEl.appendChild(span);
      });
    }
    buildCarousel(data.outfits);
  }
})();
