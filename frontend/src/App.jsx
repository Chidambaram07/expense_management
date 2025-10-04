import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Users from './pages/Users';
import Expenses from './pages/Expenses';
import NewExpense from './pages/NewExpense';
import ApprovalRules from './pages/ApprovalRules';
import Approvals from './pages/Approvals';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        {user.role === 'admin' && (
          <>
            <Route path="/users" element={<Users />} />
            <Route path="/rules" element={<ApprovalRules />} />
          </>
        )}
        {(user.role === 'manager' || user.role === 'admin') && (
          <Route path="/approvals" element={<Approvals />} />
        )}
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/expenses/new" element={<NewExpense />} />
        <Route path="*" element={<Navigate to="/expenses" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;