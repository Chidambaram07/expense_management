const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, country } = req.body;
    
    // Get currency from country (simplified)
    const currencyMap = { 'India': 'INR', 'USA': 'USD', 'UK': 'GBP' };
    const base_currency = currencyMap[country] || 'USD';
    
    // Create company
    const [companyResult] = await db.query(
      'INSERT INTO companies (name, country, base_currency) VALUES (?, ?, ?)',
      [name + "'s Company", country, base_currency]
    );
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const [userResult] = await db.query(
      'INSERT INTO users (company_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [companyResult.insertId, name, email, hashedPassword, 'admin']
    );
    
    // Generate token
    const token = jwt.sign(
      { id: userResult.insertId, email, role: 'admin', company_id: companyResult.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: userResult.insertId, name, email, role: 'admin' } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;