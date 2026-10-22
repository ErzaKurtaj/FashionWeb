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
    elegant: {
      title: "Elegant",
      caption: "Structured silhouettes, restrained contrast, intentional form.",
      chips: ["Tailored", "Contrast", "Proportion"],
      outfits: [
        "assets/images/elegant.png", "assets/images/elegant1.jpg", "assets/images/elegant2.jpg",
        "assets/images/elegant6.png", "assets/images/elegant5.png",
      ],
    },
    calm: {
      title: "Calm",
      caption: "Soft textures, neutral tones, effortless balance.",
      chips: ["Neutral", "Texture", "Flow"],
      outfits: [
        "assets/images/calm3.png", "assets/images/calm7.png", "assets/images/calm.png",
        "assets/images/calm2.png", "assets/images/calm4.png",
      ],
    },
    confident: {
      title: "Confident",
      caption: "Defined lines, visual tension, composed strength.",
      chips: ["Structure", "Volume", "Edge"],
      outfits: [
        "assets/images/confy.png", "assets/images/draping.png", "assets/images/confident2.png",
        "assets/images/confident3.png", "assets/images/confident4.png",
      ],
    },
    melancholic: {
      title: "Melancholic",
      caption: "Muted palettes, fluid drape, emotional quiet.",
      chips: ["Drape", "Muted", "Layered"],
      outfits: [
        "assets/images/cozy.png", "assets/images/cozy3.png", "assets/images/cozy1.png",
        "assets/images/cozy4.png", "assets/images/cozy5.png",
      ],
    },
  };

  // Dedicated "note" imagery only exists for Elegant (brown1-5); the other
  // moods fall back to their own outfit set so the interpreter never shows
  // a broken image. Drop in note-calm-*/note-confident-*/note-melancholic-*
  // files later and list them here to give those moods their own pool.
  const noteData = {
    elegant:     { images: ["assets/images/brown1.png", "assets/images/brown2.png", "assets/images/brown3.png", "assets/images/brown4.png", "assets/images/brown5.png"] },
    calm:        { images: moodData.calm.outfits },
    confident:   { images: moodData.confident.outfits },
    melancholic: { images: moodData.melancholic.outfits },
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
  const buttons        = moodSection.querySelectorAll(".mood-btn");
  const stateTitle     = document.getElementById("moodStateTitle");
  const stateCaption   = document.getElementById("moodStateCaption");
  const chipsEl        = document.getElementById("moodChips");
  const track          = document.getElementById("moodCarouselTrack");
  const carouselEl     = document.querySelector(".mood-carousel");
  const carouselStage  = document.querySelector(".mood-carousel-stage");
  const prevBtn        = document.querySelector(".mood-carousel .prev");
  const nextBtn        = document.querySelector(".mood-carousel .next");
  const counterCur     = document.getElementById("moodCarouselCurrent");
  const counterTotal   = document.getElementById("moodCarouselTotal");
  const indexWatermark = document.getElementById("moodIndexWatermark");
  const noteInput      = document.getElementById("moodNoteInput");
  const noteSubmit     = document.getElementById("moodNoteSubmit");
  const noteResponse   = document.getElementById("moodNoteResponse");
  const interpretBox   = document.getElementById("moodInterpretationCards");
  const resultsSection = document.getElementById("mood-wardrobe");

  /* ─── Emotion select ─────────────────────────────────────────────── */
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => loadMood(btn.dataset.mood));
  });

  function loadMood(mood) {
    const data = moodData[mood];
    if (!data) return;

    buttons.forEach((b) => b.classList.remove("is-active"));
    moodSection.querySelector(`[data-mood="${mood}"]`)?.classList.add("is-active");

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

  /* ─── Carousel ───────────────────────────────────────────────────── */
  function buildCarousel(outfits) {
    if (!track) return;
    track.innerHTML = "";
    currentIndex = Math.floor(outfits.length / 2);

    outfits.forEach((src) => {
      const div = document.createElement("div");
      div.className = "mood-look";
      div.innerHTML = `<img src="${src}" alt="" loading="lazy">`;
      track.appendChild(div);
    });

    if (counterTotal) counterTotal.textContent = outfits.length;

    track.classList.add("no-anim");
    updateCarousel();
    requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove("no-anim")));
  }

  function updateCarousel() {
    if (!track) return;
    const looks = track.querySelectorAll(".mood-look");
    const mobileMode = bp.mobile.matches;

    carouselEl?.classList.toggle("is-slider", mobileMode);

    if (mobileMode) {
      const cardWidth = carouselStage ? carouselStage.offsetWidth : 0;
      if (cardWidth > 0) track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      looks.forEach((look, i) => { look.className = i === currentIndex ? "mood-look is-center" : "mood-look"; });
    } else {
      track.style.transform = "";
      looks.forEach((look, i) => {
        look.className = "mood-look";
        const d = i - currentIndex;
        if      (d === 0)  look.classList.add("is-center");
        else if (d === -1) look.classList.add("is-left");
        else if (d <= -2)  look.classList.add("is-far-left");
        else if (d === 1)  look.classList.add("is-right");
        else if (d >= 2)   look.classList.add("is-far-right");
      });
    }

    if (counterCur) counterCur.textContent = currentIndex + 1;
    if (indexWatermark) indexWatermark.textContent = String(currentIndex + 1).padStart(2, "0");
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
    if (!carouselEl) return;
    let startX = 0, startY = 0;
    carouselEl.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    carouselEl.addEventListener("touchend", (e) => {
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

    let mood = "elegant";
    if      (text.includes("soft")   || text.includes("neutral") || text.includes("linen"))  mood = "calm";
    else if (text.includes("hoodie") || text.includes("layered") || text.includes("grey"))   mood = "melancholic";
    else if (text.includes("bold")   || text.includes("contrast") || text.includes("red"))   mood = "confident";
    else if (text.includes("black")  || text.includes("blazer")  || text.includes("sharp"))  mood = "elegant";

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
  loadMoodSilently("elegant");

  function loadMoodSilently(mood) {
    const data = moodData[mood];
    if (!data) return;
    moodSection.querySelector(`[data-mood="${mood}"]`)?.classList.add("is-active");
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
