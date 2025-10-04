import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    const { data } = await axios.get(`${API}/approvals/pending`, getHeaders());
    setApprovals(data);
  };

  const handleApprove = async () => {
    await axios.post(`${API}/approvals/${selectedApproval.id}/approve`, 
      { comments }, 
      getHeaders()
    );
    alert('Approved successfully');
    setSelectedApproval(null);
    setComments('');
    loadApprovals();
  };

  const handleReject = async () => {
    await axios.post(`${API}/approvals/${selectedApproval.id}/reject`, 
      { comments }, 
      getHeaders()
    );
    alert('Rejected successfully');
    setSelectedApproval(null);
    setComments('');
    loadApprovals();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Pending Approvals</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead style={{ background: '#ddd' }}>
          <tr>
            <th style={{ padding: '10px', textAlign: 'left' }}>Employee</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map(appr => (
            <tr key={appr.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{appr.employee_name}</td>
              <td style={{ padding: '10px' }}>{appr.description}</td>
              <td style={{ padding: '10px', textAlign: 'right' }}>
                {appr.currency} {appr.amount} (₹{appr.converted_amount})
              </td>
              <td style={{ padding: '10px' }}>{appr.expense_date}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button
                  onClick={() => setSelectedApproval(appr)}
                  style={{ padding: '5px 10px', background: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedApproval && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', maxWidth: '500px', width: '100%' }}>
            <h2>Review Expense</h2>
            <p><strong>Employee:</strong> {selectedApproval.employee_name}</p>
            <p><strong>Description:</strong> {selectedApproval.description}</p>
            <p><strong>Amount:</strong> {selectedApproval.currency} {selectedApproval.amount}</p>
            <p><strong>Converted:</strong> ₹{selectedApproval.converted_amount}</p>
            <p><strong>Date:</strong> {selectedApproval.expense_date}</p>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Comments</label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                style={{ width: '100%', padding: '8px', minHeight: '80px' }}
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                onClick={handleApprove}
                style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                style={{ flex: 1, padding: '10px', background: '#f44', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                Reject
              </button>
              <button
                onClick={() => setSelectedApproval(null)}
                style={{ flex: 1, padding: '10px', background: '#666', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}