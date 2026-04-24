# Passionis — Fashion Website

A multi-page fashion e-commerce website with a Node.js + Express backend powering live product search.

## Getting Started

**Requirements:** Node.js 18+

```bash
npm install
npm run dev     # development (auto-restarts on file changes)
# or
npm start       # production
```

Then open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── index.html              # Home / Fashion page
├── server.js               # Express server + /api/search endpoint
├── package.json
│
├── pages/
│   ├── clothes.html        # Shopping catalogue
│   ├── training.html       # Training courses
│   ├── about.html          # About us
│   ├── details.html        # Product detail (generic)
│   └── d2.html – d25.html  # Individual product detail pages
│
├── assets/
│   ├── css/
│   │   ├── style.css       # Global styles (index.html)
│   │   ├── clothes.css     # Shopping page styles
│   │   ├── training.css    # Training page styles
│   │   ├── about.css       # About page styles
│   │   ├── details.css     # Product detail styles
│   │   └── search.css      # Shared search overlay styles (all pages)
│   ├── js/
│   │   ├── main.js         # Shared JS (header, nav, cart, search)
│   │   └── m2.js – m25.js  # Per-product cart logic
│   └── images/
```

## Features

- **Live search** — debounced input triggers `/api/search?q=` and renders product cards in a full-screen overlay
- **Trending tags** — one-click tag pills pre-fill and run a search
- **Cart** — add/remove items with size selection; persisted in `localStorage`
- **Responsive navbar** — collapses to a hamburger menu on mobile; active link highlighted per page
- **Training modal** — course registration form with confirmation message
- **Scroll reveal** — elements animate in via `IntersectionObserver`

## Search API

`GET /api/search?q={query}` — returns up to 8 ranked results.

```json
{
  "results": [
    {
      "name": "Silk Evening Dress",
      "price": "189.00 EUR",
      "category": "Dresses",
      "image": "/assets/images/dress1.jpg",
      "url": "/pages/d2.html",
      "tags": ["dress", "elegant", "silk"]
    }
  ]
}
```
