const express = require('express');
const multer = require('multer');
const axios = require('axios');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// File upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5000000 } });

// Upload receipt
router.post('/upload', auth, upload.single('receipt'), (req, res) => {
  res.json({ path: `/uploads/${req.file.filename}` });
});

// Get expenses
router.get('/', auth, async (req, res) => {
  try {
    const [expenses] = await db.query(
      'SELECT * FROM expenses WHERE employee_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense
router.post('/', auth, async (req, res) => {
  try {
    const { description, category, amount, currency, expense_date, paid_by, receipt_url, status } = req.body;
    
    let converted_amount = amount;
    let conversion_rate = 1;
    
    // Currency conversion (if submitting)
    if (status === 'pending') {
      const [company] = await db.query('SELECT base_currency FROM companies WHERE id = ?', [req.user.company_id]);
      
      if (currency !== company[0].base_currency) {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        conversion_rate = response.data.rates[company[0].base_currency];
        converted_amount = (amount * conversion_rate).toFixed(2);
      }
    }
    
    const [result] = await db.query(
      'INSERT INTO expenses (company_id, employee_id, description, category, amount, currency, converted_amount, conversion_rate, expense_date, paid_by, receipt_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.company_id, req.user.id, description, category, amount, currency, converted_amount, conversion_rate, expense_date, paid_by, receipt_url, status]
    );
    
    // Trigger approval workflow if submitted
    if (status === 'pending') {
      await axios.post('http://localhost:5000/api/approvals/trigger', 
        { expenseId: result.insertId },
        { headers: { Authorization: req.headers.authorization } }
      ).catch(err => console.log('Approval trigger failed'));
    }
    
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM expenses WHERE id = ? AND employee_id = ? AND status = ?',
      [req.params.id, req.user.id, 'draft']
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;