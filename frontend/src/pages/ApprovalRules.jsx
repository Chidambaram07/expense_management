import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function ApprovalRules() {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    category: 'Food',
    manager_approves_first: true,
    approval_type: 'sequential',
    min_percentage: 100,
    approvers: []
  });
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [rulesRes, usersRes] = await Promise.all([
      axios.get(`${API}/approvals/rules`, getHeaders()),
      axios.get(`${API}/users`, getHeaders())
    ]);
    setRules(rulesRes.data);
    setUsers(usersRes.data);
  };

  const addApprover = () => {
    if (!selectedUser) return;
    const user = users.find(u => u.id === parseInt(selectedUser));
    setForm({
      ...form,
      approvers: [...form.approvers, { id: user.id, name: user.name, required: false }]
    });
    setSelectedUser('');
  };

  const removeApprover = (id) => {
    setForm({
      ...form,
      approvers: form.approvers.filter(a => a.id !== id)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/approvals/rules`, form, getHeaders());
      alert('Rule created successfully');
      setForm({
        category: 'Food',
        manager_approves_first: true,
        approval_type: 'sequential',
        min_percentage: 100,
        approvers: []
      });
      loadData();
    } catch (error) {
      alert('Failed to create rule');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Approval Rules</h1>

      <div style={{ background: '#f5f5f5', padding: '20px', marginBottom: '20px' }}>
        <h2>Create New Rule</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              style={{ width: '100%', padding: '8px' }}
            >
              <option>Food</option>
              <option>Travel</option>
              <option>Office Supplies</option>
              <option>Entertainment</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={form.manager_approves_first}
                onChange={e => setForm({ ...form, manager_approves_first: e.target.checked })}
              />
              {' '}Manager Approves First
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Approval Type</label>
            <select
              value={form.approval_type}
              onChange={e => setForm({ ...form, approval_type: e.target.value })}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="sequential">Sequential</option>
              <option value="percentage">Percentage-based</option>
            </select>
          </div>

          {form.approval_type === 'percentage' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Minimum Approval %</label>
              <input
                type="number"
                value={form.min_percentage}
                onChange={e => setForm({ ...form, min_percentage: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Add Approvers</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
              >
                <option value="">Select User</option>
                {users.filter(u => !form.approvers.find(a => a.id === u.id)).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={addApprover}
                style={{ padding: '8px 15px', background: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                Add
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3>Selected Approvers:</h3>
            {form.approvers.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'white', marginBottom: '5px' }}>
                <span>{i + 1}. {a.name}</span>
                <button
                  type="button"
                  onClick={() => removeApprover(a.id)}
                  style={{ padding: '5px 10px', background: '#f44', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button 
            type="submit"
            style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Create Rule
          </button>
        </form>
      </div>

      <h2>Existing Rules</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead style={{ background: '#ddd' }}>
          <tr>
            <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Manager First</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(rule => (
            <tr key={rule.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{rule.category}</td>
              <td style={{ padding: '10px' }}>{rule.approval_type}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {rule.manager_approves_first ? '✓' : '✗'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}