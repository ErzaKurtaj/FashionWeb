const express = require('express');
const { pool } = require('../models/db');
const { requireAuth } = require('../middleware/auth');
const { getProductById } = require('../models/products');

const router = express.Router();

router.use(requireAuth);

async function getCartForUser(userId) {
  const { rows } = await pool.query(
    'SELECT id, product_id, quantity, size FROM cart_items WHERE user_id = $1 ORDER BY id',
    [userId]
  );

  return rows
    .map((row) => {
      const product = getProductById(row.product_id);
      if (!product) return null; // product removed from catalogue since being added
      return {
        id:        row.id,
        productId: row.product_id,
        name:      product.name,
        price:     product.price,
        image:     product.image,
        size:      row.size,
        quantity:  row.quantity,
      };
    })
    .filter(Boolean);
}

/* GET /api/cart */
router.get('/', async (req, res) => {
  try {
    const items = await getCartForUser(req.user.id);
    res.json({ items });
  } catch (err) {
    console.error('[cart:get]', err.message);
    res.status(500).json({ error: 'Could not load your cart.' });
  }
});

/* POST /api/cart — add to, or adjust the quantity of, a cart line by a delta.
   A brand-new line is created with quantity = delta (delta must be positive
   in that case); an existing line's quantity is increased/decreased by delta,
   and removed entirely if that drops to zero or below. */
router.post('/', async (req, res) => {
  try {
    const { productId, size } = req.body;
    const delta = parseInt(req.body.delta, 10);

    if (!productId || !Number.isFinite(delta) || delta === 0) {
      return res.status(400).json({ error: 'productId and a non-zero delta are required.' });
    }

    const product = getProductById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const normSize = size || '';

    const { rows } = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3',
      [req.user.id, productId, normSize]
    );

    if (rows.length) {
      const newQty = rows[0].quantity + delta;
      if (newQty <= 0) {
        await pool.query('DELETE FROM cart_items WHERE id = $1', [rows[0].id]);
      } else {
        await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQty, rows[0].id]);
      }
    } else if (delta > 0) {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES ($1, $2, $3, $4)',
        [req.user.id, productId, delta, normSize]
      );
    }

    const items = await getCartForUser(req.user.id);
    res.json({ items });
  } catch (err) {
    console.error('[cart:post]', err.message);
    res.status(500).json({ error: 'Could not update your cart.' });
  }
});

/* DELETE /api/cart/:itemId */
router.delete('/:itemId', async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    if (!Number.isFinite(itemId)) return res.status(400).json({ error: 'Invalid item id.' });

    await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [itemId, req.user.id]);

    const items = await getCartForUser(req.user.id);
    res.json({ items });
  } catch (err) {
    console.error('[cart:delete]', err.message);
    res.status(500).json({ error: 'Could not update your cart.' });
  }
});

module.exports = router;
