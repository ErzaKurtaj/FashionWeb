(function () {
  "use strict";

  // Inject stylesheet — absolute path works from any page depth
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/assets/css/chat.css";
  document.head.appendChild(link);

  // ── Widget HTML ────────────────────────────────────────────────
  var widget = document.createElement("div");
  widget.className = "chat-widget";
  widget.setAttribute("aria-label", "Erza Style Assistant");
  widget.innerHTML = [
    '<div class="chat-panel" role="dialog" aria-modal="true" aria-label="Erza chat">',
    '  <div class="chat-hd">',
    '    <div class="chat-hd-left">',
    '      <div class="chat-avatar">A</div>',
    "      <div>",
    '        <div class="chat-hd-name">ARIA</div>',
    '        <div class="chat-hd-sub">PASSIONIS Style Consultant</div>',
    "      </div>",
    "    </div>",
    '    <div class="chat-hd-status">',
    '      <span class="chat-hd-dot"></span>',
    "      <span>Online</span>",
    "    </div>",
    "  </div>",
    '  <div class="chat-msgs" id="chat-msgs"></div>',
    '  <div class="chat-foot">',
    "    <input",
    '      type="text"',
    '      class="chat-in"',
    '      id="chat-in"',
    '      placeholder="Ask about styles, sizing, products…"',
    '      autocomplete="off"',
    '      maxlength="500"',
    '      aria-label="Message Erza"',
    "    />",
    '    <button class="chat-btn" id="chat-btn" aria-label="Send" disabled>',
    '      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">',
    '        <path d="M1.5 6.5L11.5 1.5L8.5 6.5L11.5 11.5L1.5 6.5Z"',
    '          fill="white" stroke="white" stroke-width="0.6"',
    '          stroke-linejoin="round" stroke-linecap="round"/>',
    "      </svg>",
    "    </button>",
    "  </div>",
    "</div>",
    '<button class="chat-toggle" id="chat-toggle" aria-label="Open chat assistant">',
    '  <div class="chat-notif" id="chat-notif" aria-hidden="true"></div>',
    '  <svg class="icon-open" width="22" height="22" viewBox="0 0 22 22" fill="none">',
    '    <path d="M11 2C6.03 2 2 5.58 2 10c0 2.44 1.18 4.62 3.03 6.1L4.5 20l4.16-2.08A9.7 9.7 0 0 0 11 18c4.97 0 9-3.58 9-8s-4.03-8-9-8Z"',
    '      stroke="white" stroke-width="1.55" stroke-linejoin="round" fill="none"/>',
    "  </svg>",
    '  <svg class="icon-close" width="17" height="17" viewBox="0 0 17 17" fill="none">',
    '    <line x1="2.5" y1="2.5" x2="14.5" y2="14.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/>',
    '    <line x1="14.5" y1="2.5" x2="2.5" y2="14.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/>',
    "  </svg>",
    "</button>",
  ].join("\n");

  document.body.appendChild(widget);

  // ── References ─────────────────────────────────────────────────
  var toggle = document.getElementById("chat-toggle");
  var msgs = document.getElementById("chat-msgs");
  var input = document.getElementById("chat-in");
  var btn = document.getElementById("chat-btn");
  var notif = document.getElementById("chat-notif");

  var history = [];
  var isOpen = false;
  var isBusy = false;
  var welcomed = false;

  // Show notification badge after 2 s (invites user to open)
  setTimeout(function () {
    if (!isOpen) notif.classList.add("visible");
  }, 2000);

  // ── Toggle ─────────────────────────────────────────────────────
  toggle.addEventListener("click", function () {
    isOpen = !isOpen;
    widget.classList.toggle("open", isOpen);
    notif.classList.remove("visible");

    if (isOpen) {
      if (!welcomed) {
        welcomed = true;
        appendBot(
          "Welcome to PASSIONIS. I'm Erza, your personal style consultant. " +
            "Are you looking for something specific — an occasion, a colour, or a particular piece?",
        );
      }
      setTimeout(function () {
        input.focus();
      }, 300);
    }
  });

  // ── Input handling ─────────────────────────────────────────────
  input.addEventListener("input", function () {
    btn.disabled = input.value.trim().length === 0 || isBusy;
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!btn.disabled) sendMessage();
    }
  });

  btn.addEventListener("click", sendMessage);

  // ── Send / receive ─────────────────────────────────────────────
  function sendMessage() {
    var text = input.value.trim();
    if (!text || isBusy) return;

    appendUser(text);
    input.value = "";
    btn.disabled = true;
    isBusy = true;

    var typing = appendTyping();

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: history }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        typing.remove();
        var reply =
          data.reply ||
          data.error ||
          "I'm unable to respond right now — please try again.";
        appendBot(reply);

        history.push({ role: "user", content: text });
        history.push({ role: "assistant", content: reply });
        if (history.length > 20) history = history.slice(-20);
      })
      .catch(function () {
        typing.remove();
        appendBot("I'm momentarily unavailable. Please try again in a moment.");
      })
      .finally(function () {
        isBusy = false;
        btn.disabled = input.value.trim().length === 0;
      });
  }

  // ── DOM helpers ────────────────────────────────────────────────
  function appendUser(text) {
    var row = document.createElement("div");
    row.className = "chat-row user";
    var bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    msgs.appendChild(row);
    scrollBottom();
    return row;
  }

  function appendBot(text) {
    var row = document.createElement("div");
    row.className = "chat-row bot";
    var bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    msgs.appendChild(row);
    scrollBottom();
    return row;
  }

  function appendTyping() {
    var wrap = document.createElement("div");
    wrap.className = "chat-typing-wrap";
    wrap.innerHTML = '<div class="chat-typing"><i></i><i></i><i></i></div>';
    msgs.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function scrollBottom() {
    msgs.scrollTop = msgs.scrollHeight;
  }
})();
