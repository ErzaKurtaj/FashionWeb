require('dotenv').config();

const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const jwt          = require('jsonwebtoken');
const authRoutes             = require('./routes/authRoutes');
const chatRoutes             = require('./routes/chatRoutes');
const { initDb }             = require('./models/db');
const { searchProducts }     = require('./models/products');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

/* ── PostgreSQL ─────────────────────────────────────────────────── */
initDb().catch(err => { console.error('Database error:', err.message); process.exit(1); });

/* ── Core middleware ────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ── Auth API ───────────────────────────────────────────────────── */
app.use('/api/auth', authRoutes);

/* ── Chat API ───────────────────────────────────────────────────── */
app.use('/api/chat', chatRoutes);

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

/* ── Protect all HTML pages (except /login.html) ───────────────── */
app.use((req, res, next) => {
  const isHtml   = req.path === '/' || req.path.endsWith('.html');
  const isPublic = req.path === '/login.html';

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

app.listen(PORT, () => {
  console.log(`\n  Passionis server running at http://localhost:${PORT}\n`);
});
