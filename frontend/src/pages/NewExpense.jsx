import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function NewExpense() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    description: '',
    category: 'Food',
    amount: '',
    currency: 'INR',
    expense_date: '',
    paid_by: '',
    receipt_url: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await axios.get(`${API}/users`, getHeaders());
    setUsers(data);
    if (data.length > 0) setForm(f => ({ ...f, paid_by: data[0].id }));
  };

  const handleFileUpload = async (e) => {
    const formData = new FormData();
    formData.append('receipt', e.target.files[0]);
    const { data } = await axios.post(`${API}/expenses/upload`, formData, getHeaders());
    setForm({ ...form, receipt_url: data.path });
  };

  const handleSubmit = async (status) => {
    try {
      await axios.post(`${API}/expenses`, { ...form, status }, getHeaders());
      navigate('/expenses');
    } catch (error) {
      alert('Failed to create expense');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', background: 'white' }}>
      <h1>New Expense</h1>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Receipt</label>
        <input type="file" onChange={handleFileUpload} />
        {form.receipt_url && (
          <img src={`http://localhost:5000${form.receipt_url}`} 
               style={{ width: '200px', marginTop: '10px', display: 'block' }} />
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Description *</label>
        <input
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          style={{ width: '100%', padding: '8px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Category *</label>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Amount *</label>
          <input
            type="number"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Currency *</label>
          <select
            value={form.currency}
            onChange={e => setForm({ ...form, currency: e.target.value })}
            style={{ width: '100%', padding: '8px' }}
          >
            <option>INR</option>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Date *</label>
        <input
          type="date"
          value={form.expense_date}
          onChange={e => setForm({ ...form, expense_date: e.target.value })}
          style={{ width: '100%', padding: '8px' }}
          required
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Paid By *</label>
        <select
          value={form.paid_by}
          onChange={e => setForm({ ...form, paid_by: e.target.value })}
          style={{ width: '100%', padding: '8px' }}
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => handleSubmit('draft')}
          style={{ flex: 1, padding: '10px', background: '#666', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Save as Draft
        </button>
        <button
          onClick={() => handleSubmit('pending')}
          style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Submit for Approval
        </button>
      </div>
    </div>
  );
}