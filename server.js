require('dotenv').config();

const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const jwt          = require('jsonwebtoken');
const authRoutes             = require('./routes/authRoutes');
const chatRoutes             = require('./routes/chatRoutes');
const cartRoutes             = require('./routes/cartRoutes');
const orderRoutes            = require('./routes/orderRoutes');
const { initDb, ensureDemoUser } = require('./models/db');
const { searchProducts }     = require('./models/products');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

/* ── PostgreSQL ─────────────────────────────────────────────────── */
initDb()
  .then(ensureDemoUser)
  .catch(err => { console.error('Database error:', err.message); process.exit(1); });

/* ── Core middleware ────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ── Auth API ───────────────────────────────────────────────────── */
app.use('/api/auth', authRoutes);

/* ── Chat API ───────────────────────────────────────────────────── */
app.use('/api/chat', chatRoutes);

/* ── Cart API ───────────────────────────────────────────────────── */
app.use('/api/cart', cartRoutes);

/* ── Order / checkout API ────────────────────────────────────────── */
app.use('/api', orderRoutes);

/* ── Search API ─────────────────────────────────────────────────── */
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ results: [] });
  res.json({ results: searchProducts(q) });
});

/* ── Redirect already-logged-in users away from login page ─────── */
app.get('/login.html', (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return next();
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.redirect('/');
  } catch {
    res.clearCookie('token');
    next();
  }
});

/* ── Protect all HTML pages (except public auth pages) ──────────── */
const PUBLIC_PAGES = ['/login.html', '/forgot-password.html', '/reset-password.html'];

app.use((req, res, next) => {
  const isHtml   = req.path === '/' || req.path.endsWith('.html');
  const isPublic = PUBLIC_PAGES.includes(req.path);

  if (!isHtml || isPublic) return next();

  const token = req.cookies && req.cookies.token;
  if (!token) return res.redirect('/login.html');

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie('token');
    res.redirect('/login.html');
  }
});

/* ── Static files ───────────────────────────────────────────────── */
app.use(express.static(path.join(__dirname)));

/* ── Fallback ───────────────────────────────────────────────────── */
app.get('*', (req, res) => res.redirect('/'));

/* ── Error handler ─────────────────────────────────────────────────
   Catches anything thrown by earlier middleware that no route-level
   try/catch handled — most commonly a malformed JSON request body, which
   express.json() rejects before any route runs. Without this, Express
   falls back to its default HTML stack-trace page: API clients (cart.js,
   auth.js, etc.) can't parse that as JSON, so a perfectly diagnosable
   error (e.g. "invalid JSON body") surfaces to the user as a generic
   "Cart request failed." with no indication of what actually went wrong —
   and the HTML page itself leaks server file paths. Keep this last. ──── */
app.use((err, req, res, next) => {
  console.error('[unhandled]', err.message);
  const status = err.status || err.statusCode || 500;
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ error: 'Something went wrong. Please try again.' });
  }
  res.status(status).send('Something went wrong. Please try again.');
});

app.listen(PORT, () => {
  console.log(`\n  Passionis server running at http://localhost:${PORT}\n`);
});
