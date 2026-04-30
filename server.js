require('dotenv').config();

const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const jwt          = require('jsonwebtoken');
const authRoutes   = require('./routes/authRoutes');
const { initDb }   = require('./models/db');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── PostgreSQL ─────────────────────────────────────────────────── */
initDb().catch(err => { console.error('Database error:', err.message); process.exit(1); });

/* ── Core middleware ────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ── Auth API ───────────────────────────────────────────────────── */
app.use('/api/auth', authRoutes);

/* ── Product catalogue ──────────────────────────────────────────── */
const products = [
  // Trendy Dresses
  { name: 'Long Skirt and Top',   price: '39.95 EUR', category: 'Trendy Dresses',  image: '/assets/images/set.jpg',       url: '/pages/details.html', tags: ['skirt','top','set','outfit'] },
  { name: 'Cute Pink Dress',      price: '25.95 EUR', category: 'Trendy Dresses',  image: '/assets/images/cute.jpg',      url: '/pages/d2.html',      tags: ['pink','dress','cute','floral'] },
  { name: 'Mint Dress & Blazer',  price: '87.95 EUR', category: 'Trendy Dresses',  image: '/assets/images/mint.jpg',      url: '/pages/d3.html',      tags: ['mint','dress','blazer','green','set'] },
  { name: 'Long Brown Dress',     price: '25.95 EUR', category: 'Trendy Dresses',  image: '/assets/images/long.jpg',      url: '/pages/d4.html',      tags: ['long','brown','dress','maxi'] },
  { name: 'Satin Black Dress',    price: '35.95 EUR', category: 'Trendy Dresses',  image: '/assets/images/cutest.jpg',    url: '/pages/d5.html',      tags: ['satin','black','dress','elegant','night'] },
  // Old Money Style
  { name: 'White Pants',          price: '45.95 EUR', category: 'Old Money Style', image: '/assets/images/white.jpg',     url: '/pages/d6.html',      tags: ['white','pants','trousers','old money','classic'] },
  { name: 'Brown Shirt',          price: '25.95 EUR', category: 'Old Money Style', image: '/assets/images/beige.jpg',     url: '/pages/d7.html',      tags: ['brown','shirt','beige','old money'] },
  { name: 'Yellow Dress',         price: '27.95 EUR', category: 'Old Money Style', image: '/assets/images/yellow.jpg',    url: '/pages/d8.html',      tags: ['yellow','dress','old money','summer'] },
  { name: 'Shirt & Pants',        price: '55.95 EUR', category: 'Old Money Style', image: '/assets/images/best.jpg',      url: '/pages/d9.html',      tags: ['shirt','pants','set','outfit','old money'] },
  { name: 'Black Shirt',          price: '34.95 EUR', category: 'Old Money Style', image: '/assets/images/black.jpg',     url: '/pages/d10.html',     tags: ['black','shirt','old money','classic'] },
  // Elegant Clothes
  { name: 'Mini Skirt & T-Shirt', price: '45.95 EUR', category: 'Elegant Clothes', image: '/assets/images/el.jpg',        url: '/pages/d11.html',     tags: ['mini','skirt','tshirt','top','elegant','set'] },
  { name: 'Oversize Blazer',      price: '39.95 EUR', category: 'Elegant Clothes', image: '/assets/images/blazer.jpg',    url: '/pages/d12.html',     tags: ['oversize','blazer','jacket','elegant','work'] },
  { name: 'Blazer & Skirt',       price: '65.95 EUR', category: 'Elegant Clothes', image: '/assets/images/STREET.jpg',    url: '/pages/d13.html',     tags: ['blazer','skirt','set','elegant','street','work'] },
  { name: 'Sweater',              price: '25.95 EUR', category: 'Elegant Clothes', image: '/assets/images/autumn.jpg',    url: '/pages/d14.html',     tags: ['sweater','knit','autumn','winter','elegant'] },
  { name: 'Mini Dress',           price: '27.95 EUR', category: 'Elegant Clothes', image: '/assets/images/yello.jpg',     url: '/pages/d15.html',     tags: ['mini','dress','yellow','elegant','short'] },
  // Simple Outfits
  { name: 'Oversize Jacket',      price: '42.95 EUR', category: 'Simple Outfits',  image: '/assets/images/jacket.jpg',    url: '/pages/d16.html',     tags: ['oversize','jacket','simple','casual','streetwear'] },
  { name: 'White Pants',          price: '39.95 EUR', category: 'Simple Outfits',  image: '/assets/images/jeans.jpg',     url: '/pages/d17.html',     tags: ['white','pants','jeans','simple','casual'] },
  { name: 'Basic T-Shirt',        price: '17.95 EUR', category: 'Simple Outfits',  image: '/assets/images/tshirt.jpg',    url: '/pages/d18.html',     tags: ['basic','tshirt','top','simple','casual','everyday'] },
  { name: 'Oversize Cargo',       price: '25.95 EUR', category: 'Simple Outfits',  image: '/assets/images/cargo.jpg',     url: '/pages/d19.html',     tags: ['oversize','cargo','pants','simple','casual','streetwear'] },
  { name: 'Neck Sweater',         price: '27.95 EUR', category: 'Simple Outfits',  image: '/assets/images/sweater.jpg',   url: '/pages/d20.html',     tags: ['neck','sweater','knit','simple','casual','winter'] },
  // Wedding Clothes
  { name: 'White Long Dress',     price: '45.95 EUR', category: 'Wedding Clothes', image: '/assets/images/whitedress.jpg',url: '/pages/d21.html',     tags: ['white','long','dress','wedding','bridal','bride'] },
  { name: 'Cropped Dress',        price: '39.95 EUR', category: 'Wedding Clothes', image: '/assets/images/orange.jpg',    url: '/pages/d22.html',     tags: ['cropped','dress','wedding','orange','guest'] },
  { name: 'Long Wavy Dress',      price: '25.95 EUR', category: 'Wedding Clothes', image: '/assets/images/short.jpg',     url: '/pages/d23.html',     tags: ['long','wavy','dress','wedding','guest'] },
  { name: 'Green Dress',          price: '27.95 EUR', category: 'Wedding Clothes', image: '/assets/images/green.jpg',     url: '/pages/d24.html',     tags: ['green','dress','wedding','guest'] },
  { name: 'Navy Dress',           price: '33.95 EUR', category: 'Wedding Clothes', image: '/assets/images/navy.jpg',      url: '/pages/d25.html',     tags: ['navy','blue','dress','wedding','guest'] },
  // Shoes Design
  { name: 'Purple Heels',         price: 'View Course', category: 'Shoes Design',  image: '/assets/images/1.jpg',         url: '/pages/training.html',tags: ['purple','heels','shoes','design','course'] },
  { name: 'Red Heels',            price: 'View Course', category: 'Shoes Design',  image: '/assets/images/red.jpg',       url: '/pages/training.html',tags: ['red','heels','shoes','design','course'] },
  { name: 'Black Heels',          price: 'View Course', category: 'Shoes Design',  image: '/assets/images/LV.jpg',        url: '/pages/training.html',tags: ['black','heels','shoes','design','classic','course'] },
  { name: 'Brown Heels',          price: 'View Course', category: 'Shoes Design',  image: '/assets/images/SL.jpg',        url: '/pages/training.html',tags: ['brown','heels','shoes','design','course'] },
  { name: 'Blue Heels',           price: 'View Course', category: 'Shoes Design',  image: '/assets/images/blue.jpg',      url: '/pages/training.html',tags: ['blue','heels','shoes','design','course'] },
];

/* ── Search helper ──────────────────────────────────────────────── */
function searchProducts(query) {
  const q     = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 1);
  if (!words.length) return [];

  return products
    .map(product => {
      const haystack = [
        product.name.toLowerCase(),
        product.category.toLowerCase(),
        ...product.tags,
      ].join(' ');

      let score = 0;
      for (const word of words) {
        if (haystack.includes(word)) score++;
      }
      if (product.name.toLowerCase().includes(q)) score += 2;

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ product }) => ({
      name:     product.name,
      price:    product.price,
      category: product.category,
      image:    product.image,
      url:      product.url,
    }));
}

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
