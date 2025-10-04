const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Create approval rule
router.post('/rules', auth, async (req, res) => {
  try {
    const { category, manager_approves_first, approval_type, min_percentage, approvers } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO approval_rules (company_id, category, manager_approves_first, approval_type, min_percentage) VALUES (?, ?, ?, ?, ?)',
      [req.user.company_id, category, manager_approves_first, approval_type, min_percentage]
    );
    
    // Add approvers
    for (let i = 0; i < approvers.length; i++) {
      await db.query(
        'INSERT INTO rule_approvers (rule_id, approver_id, sequence_order, is_required) VALUES (?, ?, ?, ?)',
        [result.insertId, approvers[i].id, i + 1, approvers[i].required]
      );
    }
    
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get approval rules
router.get('/rules', auth, async (req, res) => {
  try {
    const [rules] = await db.query(
      'SELECT * FROM approval_rules WHERE company_id = ?',
      [req.user.company_id]
    );
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger workflow (called by Dev 2)
router.post('/trigger', auth, async (req, res) => {
  try {
    const { expenseId } = req.body;
    
    const [expenses] = await db.query('SELECT * FROM expenses WHERE id = ?', [expenseId]);
    const expense = expenses[0];
    
    // Get approval rule
    const [rules] = await db.query(
      'SELECT * FROM approval_rules WHERE company_id = ? AND category = ?',
      [expense.company_id, expense.category]
    );
    
    if (rules.length === 0) {
      // No rule, auto-approve
      await db.query('UPDATE expenses SET status = ? WHERE id = ?', ['approved', expenseId]);
      return res.json({ message: 'Auto-approved' });
    }
    
    const rule = rules[0];
    
    // Get employee's manager
    const [employees] = await db.query('SELECT manager_id FROM users WHERE id = ?', [expense.employee_id]);
    
    // Create approval for manager (if enabled)
    if (rule.manager_approves_first && employees[0].manager_id) {
      await db.query(
        'INSERT INTO expense_approvals (expense_id, approver_id, status) VALUES (?, ?, ?)',
        [expenseId, employees[0].manager_id, 'pending']
      );
    }
    
    // Get rule approvers
    const [approvers] = await db.query(
      'SELECT approver_id, sequence_order FROM rule_approvers WHERE rule_id = ?',
      [rule.id]
    );
    
    // Create approvals
    for (const approver of approvers) {
      await db.query(
        'INSERT INTO expense_approvals (expense_id, approver_id, status) VALUES (?, ?, ?)',
        [expenseId, approver.approver_id, 'pending']
      );
    }
    
    res.json({ message: 'Workflow triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending approvals for manager
router.get('/pending', auth, async (req, res) => {
  try {
    const [approvals] = await db.query(`
      SELECT ea.*, e.description, e.amount, e.currency, e.converted_amount, 
             e.expense_date, u.name as employee_name
      FROM expense_approvals ea
      JOIN expenses e ON ea.expense_id = e.id
      JOIN users u ON e.employee_id = u.id
      WHERE ea.approver_id = ? AND ea.status = 'pending'
      ORDER BY e.created_at DESC
    `, [req.user.id]);
    
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const { comments } = req.body;
    
    await db.query(
      'UPDATE expense_approvals SET status = ?, comments = ?, approved_at = NOW() WHERE id = ?',
      ['approved', comments, req.params.id]
    );
    
    // Check if all approvals done
    const [approval] = await db.query('SELECT expense_id FROM expense_approvals WHERE id = ?', [req.params.id]);
    const [pending] = await db.query(
      'SELECT COUNT(*) as count FROM expense_approvals WHERE expense_id = ? AND status = ?',
      [approval[0].expense_id, 'pending']
    );
    
    if (pending[0].count === 0) {
      await db.query('UPDATE expenses SET status = ? WHERE id = ?', ['approved', approval[0].expense_id]);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/reject', auth, async (req, res) => {
  try {
    const { comments } = req.body;
    
    await db.query(
      'UPDATE expense_approvals SET status = ?, comments = ?, approved_at = NOW() WHERE id = ?',
      ['rejected', comments, req.params.id]
    );
    
    const [approval] = await db.query('SELECT expense_id FROM expense_approvals WHERE id = ?', [req.params.id]);
    await db.query('UPDATE expenses SET status = ? WHERE id = ?', ['rejected', approval[0].expense_id]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;