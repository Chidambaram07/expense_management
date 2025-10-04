import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Users() {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'employee', manager_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [usersRes, managersRes] = await Promise.all([
      axios.get(`${API}/users`, getHeaders()),
      axios.get(`${API}/users/managers`, getHeaders())
    ]);
    setUsers(usersRes.data);
    setManagers(managersRes.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/users`, form, getHeaders());
      alert(`User created! Password: ${data.password}`);
      setForm({ name: '', email: '', role: 'employee', manager_id: '' });
      loadData();
    } catch (error) {
      alert('Failed to create user');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Management</h1>
      
      <div style={{ background: '#f5f5f5', padding: '20px', marginBottom: '20px' }}>
        <h2>Create New User</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            required
          />
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
          {form.role === 'employee' && (
            <select
              value={form.manager_id}
              onChange={e => setForm({ ...form, manager_id: e.target.value })}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            >
              <option value="">Select Manager</option>
              {managers.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}
          <button type="submit" style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none' }}>
            Create User
          </button>
        </form>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#ddd' }}>
          <tr>
            <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{user.name}</td>
              <td style={{ padding: '10px' }}>{user.email}</td>
              <td style={{ padding: '10px' }}>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}