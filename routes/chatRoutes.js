// Requires Node 18+ (native fetch). Add node-fetch if on older Node.
const express = require("express");
const router = express.Router();

const SYSTEM_PROMPT = `You are Erza, the personal style consultant for PASSIONIS — a luxury fashion house.

Your personality: sophisticated, warm, quietly authoritative. You speak with editorial confidence — never sycophantic, never robotic. Get straight to the point with elegance. No filler openers like "Certainly!" or "Of course!".

You assist customers with:
- Product recommendations from the PASSIONIS catalogue
- Outfit pairings, styling advice, and occasion dressing
- General size and fit guidance
- Shopping cart, checkout, and order questions
- Account login and registration help
- Brand philosophy and the SS 2025 collection

PASSIONIS CATALOGUE (reference for recommendations):
TRENDY DRESSES: Long Skirt and Top (39.95€), Cute Pink Dress (25.95€), Mint Dress & Blazer (87.95€), Long Brown Dress (25.95€), Satin Black Dress (35.95€)
OLD MONEY STYLE: White Pants (45.95€), Brown Shirt (25.95€), Yellow Dress (27.95€), Shirt & Pants set (55.95€), Black Shirt (34.95€)
ELEGANT CLOTHES: Mini Skirt & T-Shirt (45.95€), Oversize Blazer (39.95€), Blazer & Skirt (65.95€), Sweater (25.95€), Mini Dress (27.95€)
SIMPLE OUTFITS: Oversize Jacket (42.95€), White Pants (39.95€), Basic T-Shirt (17.95€), Oversize Cargo (25.95€), Neck Sweater (27.95€)
WEDDING CLOTHES: White Long Dress (45.95€), Cropped Dress (39.95€), Long Wavy Dress (25.95€), Green Dress (27.95€), Navy Dress (33.95€)
SHOE DESIGN COURSES: Purple, Red, Black, Brown, Blue Heels — training courses on the Training Courses page

WEBSITE NAVIGATION: FASHION (home /), SHOPPING (/pages/clothes.html), TRAINING COURSES (/pages/training.html), ABOUT US (/pages/about.html)

RULES:
- Keep replies concise: 2–3 sentences unless listing products or styling options
- Name specific items with prices when making recommendations
- For cart or checkout questions: explain users can click "BUY NOW" on a product, log in to their account, and complete purchase
- If asked about something unrelated to fashion, shopping, or the brand: "My expertise is in fashion and style — shall I help you find the perfect piece?"
- Refer to the brand as PASSIONIS, not "the store" or "the website"`;

router.post("/", async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history
      .slice(-8)
      .map((h) => ({ role: h.role, content: String(h.content) })),
    { role: "user", content: message.trim() },
  ];

  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3.2",
        messages,
        stream: false,
        options: { temperature: 0.72, num_predict: 280 },
      }),
      signal: AbortSignal.timeout(40000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Ollama error:", response.status, text);
      return res
        .status(502)
        .json({ error: "The AI service returned an error. Please try again." });
    }

    const data = await response.json();
    const reply =
      (data.message?.content || "").trim() ||
      "I was unable to generate a response — please try again.";

    res.json({ reply });
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Erza is offline. Please start Ollama with: ollama serve",
      });
    }
    if (err.name === "TimeoutError") {
      return res
        .status(504)
        .json({ error: "Response timed out. Please try again." });
    }
    console.error("Chat route error:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = router;
