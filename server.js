const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Product catalogue ──────────────────────────────────────────── */
const products = [
  // Trendy Dresses
  { name: 'Long Skirt and Top',   price: '39.95 EUR', category: 'Trendy Dresses',  image: 'images/set.jpg',       url: 'details.html', tags: ['skirt','top','set','outfit'] },
  { name: 'Cute Pink Dress',      price: '25.95 EUR', category: 'Trendy Dresses',  image: 'images/cute.jpg',      url: 'd2.html',      tags: ['pink','dress','cute','floral'] },
  { name: 'Mint Dress & Blazer',  price: '87.95 EUR', category: 'Trendy Dresses',  image: 'images/mint.jpg',      url: 'd3.html',      tags: ['mint','dress','blazer','green','set'] },
  { name: 'Long Brown Dress',     price: '25.95 EUR', category: 'Trendy Dresses',  image: 'images/long.jpg',      url: 'd4.html',      tags: ['long','brown','dress','maxi'] },
  { name: 'Satin Black Dress',    price: '35.95 EUR', category: 'Trendy Dresses',  image: 'images/cutest.jpg',    url: 'd5.html',      tags: ['satin','black','dress','elegant','night'] },
  // Old Money Style
  { name: 'White Pants',          price: '45.95 EUR', category: 'Old Money Style', image: 'images/white.jpg',     url: 'd6.html',      tags: ['white','pants','trousers','old money','classic'] },
  { name: 'Brown Shirt',          price: '25.95 EUR', category: 'Old Money Style', image: 'images/beige.jpg',     url: 'd7.html',      tags: ['brown','shirt','beige','old money'] },
  { name: 'Yellow Dress',         price: '27.95 EUR', category: 'Old Money Style', image: 'images/yellow.jpg',    url: 'd8.html',      tags: ['yellow','dress','old money','summer'] },
  { name: 'Shirt & Pants',        price: '55.95 EUR', category: 'Old Money Style', image: 'images/best.jpg',      url: 'd9.html',      tags: ['shirt','pants','set','outfit','old money'] },
  { name: 'Black Shirt',          price: '34.95 EUR', category: 'Old Money Style', image: 'images/black.jpg',     url: 'd10.html',     tags: ['black','shirt','old money','classic'] },
  // Elegant Clothes
  { name: 'Mini Skirt & T-Shirt', price: '45.95 EUR', category: 'Elegant Clothes', image: 'images/el.jpg',        url: 'd11.html',     tags: ['mini','skirt','tshirt','top','elegant','set'] },
  { name: 'Oversize Blazer',      price: '39.95 EUR', category: 'Elegant Clothes', image: 'images/blazer.jpg',    url: 'd12.html',     tags: ['oversize','blazer','jacket','elegant','work'] },
  { name: 'Blazer & Skirt',       price: '65.95 EUR', category: 'Elegant Clothes', image: 'images/STREET.jpg',    url: 'd13.html',     tags: ['blazer','skirt','set','elegant','street','work'] },
  { name: 'Sweater',              price: '25.95 EUR', category: 'Elegant Clothes', image: 'images/autumn.jpg',    url: 'd14.html',     tags: ['sweater','knit','autumn','winter','elegant'] },
  { name: 'Mini Dress',           price: '27.95 EUR', category: 'Elegant Clothes', image: 'images/yello.jpg',     url: 'd15.html',     tags: ['mini','dress','yellow','elegant','short'] },
  // Simple Outfits
  { name: 'Oversize Jacket',      price: '42.95 EUR', category: 'Simple Outfits',  image: 'images/jacket.jpg',    url: 'd16.html',     tags: ['oversize','jacket','simple','casual','streetwear'] },
  { name: 'White Pants',          price: '39.95 EUR', category: 'Simple Outfits',  image: 'images/jeans.jpg',     url: 'd17.html',     tags: ['white','pants','jeans','simple','casual'] },
  { name: 'Basic T-Shirt',        price: '17.95 EUR', category: 'Simple Outfits',  image: 'images/tshirt.jpg',    url: 'd18.html',     tags: ['basic','tshirt','top','simple','casual','everyday'] },
  { name: 'Oversize Cargo',       price: '25.95 EUR', category: 'Simple Outfits',  image: 'images/cargo.jpg',     url: 'd19.html',     tags: ['oversize','cargo','pants','simple','casual','streetwear'] },
  { name: 'Neck Sweater',         price: '27.95 EUR', category: 'Simple Outfits',  image: 'images/sweater.jpg',   url: 'd20.html',     tags: ['neck','sweater','knit','simple','casual','winter'] },
  // Wedding Clothes
  { name: 'White Long Dress',     price: '45.95 EUR', category: 'Wedding Clothes', image: 'images/whitedress.jpg',url: 'd21.html',     tags: ['white','long','dress','wedding','bridal','bride'] },
  { name: 'Cropped Dress',        price: '39.95 EUR', category: 'Wedding Clothes', image: 'images/orange.jpg',    url: 'd22.html',     tags: ['cropped','dress','wedding','orange','guest'] },
  { name: 'Long Wavy Dress',      price: '25.95 EUR', category: 'Wedding Clothes', image: 'images/short.jpg',     url: 'd23.html',     tags: ['long','wavy','dress','wedding','guest'] },
  { name: 'Green Dress',          price: '27.95 EUR', category: 'Wedding Clothes', image: 'images/green.jpg',     url: 'd24.html',     tags: ['green','dress','wedding','guest'] },
  { name: 'Navy Dress',           price: '33.95 EUR', category: 'Wedding Clothes', image: 'images/navy.jpg',      url: 'd25.html',     tags: ['navy','blue','dress','wedding','guest'] },
  // Shoes Design
  { name: 'Purple Heels',         price: 'View Course', category: 'Shoes Design',  image: 'images/1.jpg',         url: 'training.html',tags: ['purple','heels','shoes','design','course'] },
  { name: 'Red Heels',            price: 'View Course', category: 'Shoes Design',  image: 'images/red.jpg',       url: 'training.html',tags: ['red','heels','shoes','design','course'] },
  { name: 'Black Heels',          price: 'View Course', category: 'Shoes Design',  image: 'images/LV.jpg',        url: 'training.html',tags: ['black','heels','shoes','design','classic','course'] },
  { name: 'Brown Heels',          price: 'View Course', category: 'Shoes Design',  image: 'images/SL.jpg',        url: 'training.html',tags: ['brown','heels','shoes','design','course'] },
  { name: 'Blue Heels',           price: 'View Course', category: 'Shoes Design',  image: 'images/blue.jpg',      url: 'training.html',tags: ['blue','heels','shoes','design','course'] },
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

/* ── Routes ─────────────────────────────────────────────────────── */
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ results: [] });
  res.json({ results: searchProducts(q) });
});

/* Serve the project root as static files */
app.use(express.static(path.join(__dirname)));

/* SPA-style fallback — serve index.html for any unknown route */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Passionis server running at http://localhost:${PORT}\n`);
});
