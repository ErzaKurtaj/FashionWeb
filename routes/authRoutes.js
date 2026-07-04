const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const { pool } = require('../models/db');
const { sendVerificationEmail } = require('../models/mailer');

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/* POST /api/auth/signup */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ error: 'All fields are required.' });

    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match.' });

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'An account with that email already exists.' });

    const hash  = await bcrypt.hash(password, 12);
    const token = crypto.randomBytes(32).toString('hex');

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, is_verified, verification_token)
       VALUES ($1, $2, $3, FALSE, $4) RETURNING id, name`,
      [name, email.toLowerCase(), hash, token]
    );

    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify?token=${token}`;
    await sendVerificationEmail(email.toLowerCase(), rows[0].name, verifyUrl);

    res.status(201).json({ message: 'Account created. Please check your email to verify your account.' });
  } catch (err) {
    console.error('[signup]', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/* GET /api/auth/verify */
router.get('/verify', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.redirect('/login.html?verify_error=1');

  try {
    const { rows } = await pool.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id',
      [token]
    );
    if (!rows.length) return res.redirect('/login.html?verify_error=1');

    res.redirect('/login.html?verified=1');
  } catch (err) {
    console.error('[verify]', err.message);
    res.redirect('/login.html?verify_error=1');
  }
});

/* POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const { rows } = await pool.query(
      'SELECT id, name, password, is_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (!rows.length)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const user  = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Invalid email or password.' });

    if (!user.is_verified)
      return res.status(403).json({ error: 'Please verify your email before logging in.' });

    res.cookie('token', signToken(user.id), COOKIE_OPTS);
    res.json({ message: 'Logged in.', name: user.name });
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/* POST /api/auth/logout */
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out.' });
});

/* GET /api/auth/me */
router.get('/me', async (req, res) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT name, email FROM users WHERE id = $1',
      [id]
    );
    if (!rows.length) return res.status(401).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
});

module.exports = router;
