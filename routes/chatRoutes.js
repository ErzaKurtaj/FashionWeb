// Requires Node 18+ (native fetch). Add node-fetch if on older Node.
const express          = require("express");
const router           = express.Router();
const { searchProducts } = require("../models/products");

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

TRAINING COURSES (these are educational courses, NOT products — never describe them by color):
- Shoe Design Course (Module 01): Learn to design footwear that combines comfort with style — covers material selection, pattern making, last construction, and manufacturing processes.
- Bags Design Course (Module 02): Learn to create fashion-forward handbags — covers materials, hardware, and structural design.
Full details and registration: /pages/training.html

WEBSITE NAVIGATION: FASHION (home /), SHOPPING (/pages/clothes.html), TRAINING COURSES (/pages/training.html), ABOUT US (/pages/about.html)

RULES:
- Keep replies concise: 2–3 sentences unless listing products or styling options
- When product cards are being shown alongside your reply, keep your text brief — just introduce or narrate the selection
- Name specific items with prices when making recommendations
- For cart or checkout questions: explain users can click "BUY NOW" on a product, log in to their account, and complete purchase
- When asked about training courses, describe the course topic and what it teaches (never list product colors like "Purple/Red/Blue Heels" as if they were courses), and point the user to /pages/training.html for full details and registration
- If asked about something unrelated to fashion, shopping, or the brand: "My expertise is in fashion and style — shall I help you find the perfect piece?"
- Refer to the brand as PASSIONIS, not "the store" or "the website"`;

router.post("/", async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  const text = message.trim();

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history
      .slice(-8)
      .map((h) => ({ role: h.role, content: String(h.content) })),
    { role: "user", content: text },
  ];

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      error: "Erza is offline. Set GROQ_API_KEY in your .env file.",
    });
  }

  // Run Groq and product search in parallel
  const [groqRes, products] = await Promise.all([
    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages,
        temperature: 0.72,
        max_tokens:  280,
      }),
      signal: AbortSignal.timeout(40000),
    }).catch((err) => ({ _fetchError: err })),

    Promise.resolve(searchProducts(text, 5)),
  ]);

  // Handle Groq fetch errors
  if (groqRes._fetchError) {
    const err = groqRes._fetchError;
    if (err.name === "TimeoutError") {
      return res.status(504).json({ error: "Response timed out. Please try again." });
    }
    console.error("Chat route error:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }

  if (!groqRes.ok) {
    const errText = await groqRes.text().catch(() => "");
    console.error("Groq error:", groqRes.status, errText);
    return res.status(502).json({ error: "The AI service returned an error. Please try again." });
  }

  const data  = await groqRes.json();
  const reply = (data.choices?.[0]?.message?.content || "").trim() ||
                "I was unable to generate a response — please try again.";

  res.json({
    reply,
    products: products.length > 0 ? products : null,
  });
});

module.exports = router;
