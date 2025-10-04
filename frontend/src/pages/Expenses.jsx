import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const { data } = await axios.get(`${API}/expenses`, getHeaders());
      setExpenses(data);
    } catch (error) {
      alert('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await axios.delete(`${API}/expenses/${id}`, getHeaders());
      loadExpenses();
    } catch (error) {
      alert('Failed to delete expense');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '30px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a202c', marginBottom: '8px' }}>
            My Expenses
          </h1>
          <p style={{ color: '#718096', fontSize: '14px' }}>
            Manage and track all your expense reports
          </p>
        </div>
        <button
          onClick={() => navigate('/expenses/new')}
          className="btn btn-primary"
        >
          + New Expense
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          Loading expenses...
        </div>
      ) : expenses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#718096', fontSize: '16px', marginBottom: '20px' }}>
            No expenses yet. Create your first expense report!
          </p>
          <button onClick={() => navigate('/expenses/new')} className="btn btn-primary">
            Create Expense
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Date</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: '500' }}>{exp.description}</td>
                  <td>{exp.category}</td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>
                    {exp.currency} {parseFloat(exp.amount).toFixed(2)}
                  </td>
                  <td>{new Date(exp.expense_date).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${exp.status}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {exp.status === 'draft' && (
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="btn btn-danger"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}