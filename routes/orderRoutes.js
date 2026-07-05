const express = require('express');
const { pool } = require('../models/db');
const { requireAuth } = require('../middleware/auth');
const { getProductById, getNumericPrice } = require('../models/products');

const router = express.Router();

router.use(requireAuth);

/* POST /api/checkout — converts the current cart into an order.
   Prices are always recalculated here from the catalogue; the client
   never gets to say what anything costs. Order creation + clearing the
   cart happens in one transaction, so a mid-way failure can't leave a
   half-placed order or a cart that's been emptied without an order to
   show for it. */
router.post('/checkout', async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows: cartRows } = await client.query(
      'SELECT product_id, quantity, size FROM cart_items WHERE user_id = $1',
      [req.user.id]
    );

    if (!cartRows.length) {
      client.release();
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    const lines = [];
    for (const row of cartRows) {
      const product = getProductById(row.product_id);
      const unitPrice = product ? getNumericPrice(product) : null;
      if (!product || unitPrice === null) {
        client.release();
        return res.status(409).json({
          error: 'One or more items in your cart are no longer available. Please review your cart.',
        });
      }
      lines.push({
        productId: row.product_id,
        name:      product.name,
        image:     product.image,
        size:      row.size,
        quantity:  row.quantity,
        unitPrice,
      });
    }

    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

    await client.query('BEGIN');

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (user_id, total, status) VALUES ($1, $2, 'placed')
       RETURNING id, total, status, created_at`,
      [req.user.id, total.toFixed(2)]
    );
    const order = orderRows[0];

    for (const line of lines) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity, size, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, line.productId, line.name, line.unitPrice.toFixed(2), line.quantity, line.size, line.image]
      );
    }

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    res.status(201).json({
      order: {
        id:        order.id,
        total:     Number(order.total),
        status:    order.status,
        createdAt: order.created_at,
        items:     lines.map((l) => ({
          productId: l.productId,
          name:      l.name,
          image:     l.image,
          size:      l.size,
          quantity:  l.quantity,
          price:     l.unitPrice,
        })),
      },
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[checkout]', err.message);
    res.status(500).json({ error: 'Could not place your order. Please try again.' });
  } finally {
    client.release();
  }
});

/* GET /api/orders — a logged-in user's past orders, most recent first. */
router.get('/orders', async (req, res) => {
  try {
    const { rows: orders } = await pool.query(
      'SELECT id, total, status, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    if (!orders.length) return res.json({ orders: [] });

    const orderIds = orders.map((o) => o.id);
    const { rows: items } = await pool.query(
      `SELECT order_id, product_id, name, price, quantity, size, image
       FROM order_items WHERE order_id = ANY($1)`,
      [orderIds]
    );

    const itemsByOrder = new Map();
    for (const item of items) {
      if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
      itemsByOrder.get(item.order_id).push({
        productId: item.product_id,
        name:      item.name,
        price:     Number(item.price),
        quantity:  item.quantity,
        size:      item.size,
        image:     item.image,
      });
    }

    res.json({
      orders: orders.map((o) => ({
        id:        o.id,
        total:     Number(o.total),
        status:    o.status,
        createdAt: o.created_at,
        items:     itemsByOrder.get(o.id) || [],
      })),
    });
  } catch (err) {
    console.error('[orders:get]', err.message);
    res.status(500).json({ error: 'Could not load your orders.' });
  }
});

module.exports = router;
