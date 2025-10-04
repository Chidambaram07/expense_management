const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, manager_id FROM users WHERE company_id = ?',
      [req.user.company_id]
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, role, manager_id } = req.body;
    
    // Generate random password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      'INSERT INTO users (company_id, name, email, password, role, manager_id) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.company_id, name, email, hashedPassword, role, manager_id || null]
    );
    
    // TODO: Send email with password (nodemailer)
    console.log(`Password for ${email}: ${password}`);
    
    res.json({ id: result.insertId, password });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get managers only
router.get('/managers', auth, async (req, res) => {
  try {
    const [managers] = await db.query(
      'SELECT id, name FROM users WHERE company_id = ? AND role = ?',
      [req.user.company_id, 'manager']
    );
    res.json(managers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;