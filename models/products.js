const products = [
  // Trendy Dresses
  { id: '1',  name: 'Long Skirt and Top',   price: '39.95 EUR', category: 'Trendy Dresses',  image: '/assets/images/set.jpg',        url: '/pages/details.html', tags: ['skirt','top','set','outfit'] },
  { id: '2',  name: 'Cute Pink Dress',      price: '25.95 EUR', category: 'Trendy Dresses',  image: '/assets/images/cute.jpg',       url: '/pages/d2.html',      tags: ['pink','dress','cute','floral'] },
  { id: '3',  name: 'Mint Dress & Blazer',  price: '87.95 EUR', category: 'Trendy Dresses',  image: '/assets/images/mint.jpg',       url: '/pages/d3.html',      tags: ['mint','dress','blazer','green','set'] },
  { id: '4',  name: 'Long Brown Dress',     price: '25.95 EUR', category: 'Trendy Dresses',  image: '/assets/images/long.jpg',       url: '/pages/d4.html',      tags: ['long','brown','dress','maxi'] },
  { id: '5',  name: 'Satin Black Dress',    price: '35.95 EUR', category: 'Trendy Dresses',  image: '/assets/images/cutest.jpg',     url: '/pages/d5.html',      tags: ['satin','black','dress','elegant','night'] },
  // Old Money Style
  { id: '6',  name: 'White Pants',          price: '45.95 EUR', category: 'Old Money Style', image: '/assets/images/white.jpg',      url: '/pages/d6.html',      tags: ['white','pants','trousers','old money','classic'] },
  { id: '7',  name: 'Brown Shirt',          price: '25.95 EUR', category: 'Old Money Style', image: '/assets/images/beige.jpg',      url: '/pages/d7.html',      tags: ['brown','shirt','beige','old money'] },
  { id: '8',  name: 'Yellow Dress',         price: '27.95 EUR', category: 'Old Money Style', image: '/assets/images/yellow.jpg',     url: '/pages/d8.html',      tags: ['yellow','dress','old money','summer'] },
  { id: '9',  name: 'Shirt & Pants',        price: '55.95 EUR', category: 'Old Money Style', image: '/assets/images/best.jpg',       url: '/pages/d9.html',      tags: ['shirt','pants','set','outfit','old money'] },
  { id: '10', name: 'Black Shirt',          price: '34.95 EUR', category: 'Old Money Style', image: '/assets/images/black.jpg',      url: '/pages/d10.html',     tags: ['black','shirt','old money','classic'] },
  // Elegant Clothes
  { id: '11', name: 'Mini Skirt & T-Shirt', price: '45.95 EUR', category: 'Elegant Clothes', image: '/assets/images/el.jpg',         url: '/pages/d11.html',     tags: ['mini','skirt','tshirt','top','elegant','set'] },
  { id: '12', name: 'Oversize Blazer',      price: '39.95 EUR', category: 'Elegant Clothes', image: '/assets/images/blazer.jpg',     url: '/pages/d12.html',     tags: ['oversize','blazer','jacket','elegant','work'] },
  { id: '13', name: 'Blazer & Skirt',       price: '65.95 EUR', category: 'Elegant Clothes', image: '/assets/images/STREET.jpg',     url: '/pages/d13.html',     tags: ['blazer','skirt','set','elegant','street','work'] },
  { id: '14', name: 'Sweater',              price: '25.95 EUR', category: 'Elegant Clothes', image: '/assets/images/autumn.jpg',     url: '/pages/d14.html',     tags: ['sweater','knit','autumn','winter','elegant'] },
  { id: '15', name: 'Mini Dress',           price: '27.95 EUR', category: 'Elegant Clothes', image: '/assets/images/yello.jpg',      url: '/pages/d15.html',     tags: ['mini','dress','yellow','elegant','short'] },
  // Simple Outfits
  { id: '16', name: 'Oversize Jacket',      price: '42.95 EUR', category: 'Simple Outfits',  image: '/assets/images/jacket.jpg',     url: '/pages/d16.html',     tags: ['oversize','jacket','simple','casual','streetwear'] },
  { id: '17', name: 'White Pants',          price: '39.95 EUR', category: 'Simple Outfits',  image: '/assets/images/jeans.jpg',      url: '/pages/d17.html',     tags: ['white','pants','jeans','simple','casual'] },
  { id: '18', name: 'Basic T-Shirt',        price: '17.95 EUR', category: 'Simple Outfits',  image: '/assets/images/tshirt.jpg',     url: '/pages/d18.html',     tags: ['basic','tshirt','top','simple','casual','everyday'] },
  { id: '19', name: 'Oversize Cargo',       price: '25.95 EUR', category: 'Simple Outfits',  image: '/assets/images/cargo.jpg',      url: '/pages/d19.html',     tags: ['oversize','cargo','pants','simple','casual','streetwear'] },
  { id: '20', name: 'Neck Sweater',         price: '27.95 EUR', category: 'Simple Outfits',  image: '/assets/images/sweater.jpg',    url: '/pages/d20.html',     tags: ['neck','sweater','knit','simple','casual','winter'] },
  // Wedding Clothes
  { id: '21', name: 'White Long Dress',     price: '45.95 EUR', category: 'Wedding Clothes', image: '/assets/images/whitedress.jpg', url: '/pages/d21.html',     tags: ['white','long','dress','wedding','bridal','bride'] },
  { id: '22', name: 'Cropped Dress',        price: '39.95 EUR', category: 'Wedding Clothes', image: '/assets/images/orange.jpg',     url: '/pages/d22.html',     tags: ['cropped','dress','wedding','orange','guest'] },
  { id: '23', name: 'Long Wavy Dress',      price: '25.95 EUR', category: 'Wedding Clothes', image: '/assets/images/short.jpg',      url: '/pages/d23.html',     tags: ['long','wavy','dress','wedding','guest'] },
  { id: '24', name: 'Green Dress',          price: '27.95 EUR', category: 'Wedding Clothes', image: '/assets/images/green.jpg',      url: '/pages/d24.html',     tags: ['green','dress','wedding','guest'] },
  { id: '25', name: 'Navy Dress',           price: '33.95 EUR', category: 'Wedding Clothes', image: '/assets/images/navy.jpg',       url: '/pages/d25.html',     tags: ['navy','blue','dress','wedding','guest'] },
  // Shoes Design (course reference items — not purchasable products, no cart/detail page)
  { id: '26', name: 'Purple Heels',         price: 'View Course', category: 'Shoes Design',  image: '/assets/images/1.jpg',          url: '/pages/training.html',tags: ['purple','heels','shoes','design','course'] },
  { id: '27', name: 'Red Heels',            price: 'View Course', category: 'Shoes Design',  image: '/assets/images/red.jpg',        url: '/pages/training.html',tags: ['red','heels','shoes','design','course'] },
  { id: '28', name: 'Black Heels',          price: 'View Course', category: 'Shoes Design',  image: '/assets/images/LV.jpg',         url: '/pages/training.html',tags: ['black','heels','shoes','design','classic','course'] },
  { id: '29', name: 'Brown Heels',          price: 'View Course', category: 'Shoes Design',  image: '/assets/images/SL.jpg',         url: '/pages/training.html',tags: ['brown','heels','shoes','design','course'] },
  { id: '30', name: 'Blue Heels',           price: 'View Course', category: 'Shoes Design',  image: '/assets/images/blue.jpg',       url: '/pages/training.html',tags: ['blue','heels','shoes','design','course'] },
];

function searchProducts(query, limit) {
  limit = limit || 8;
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
    .slice(0, limit)
    .map(({ product }) => ({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      category: product.category,
      image:    product.image,
      url:      product.url,
    }));
}

function getProductById(id) {
  return products.find(p => p.id === String(id));
}

// Parses a catalogue price string like "39.95 EUR" into a plain number.
// Returns null for non-numeric prices (e.g. the "View Course" heels entries,
// which aren't purchasable and should never reach checkout).
function getNumericPrice(product) {
  const match = /^(\d+(?:\.\d+)?)/.exec(product.price);
  return match ? Number(match[1]) : null;
}

module.exports = { products, searchProducts, getProductById, getNumericPrice };
