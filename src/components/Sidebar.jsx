import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="profile">
        <img src="https://i.pravatar.cc/100" alt="User" />
        <h3>Alice</h3>
        <p>Welcome Back!</p>
      </div>
      <nav>
        <ul>
          <li><Link to="/dashboard">📊 Dashboard</Link></li>
          <li><Link to="/transactions">📄 Transactions</Link></li>
          <li><Link to="/incomes">💰 Incomes</Link></li>
          <li><Link to="/expenses">💸 Expenses</Link></li>
          <li><Link to="/budgets">📈 Budgets</Link></li>
          <li><Link to="/wallets">👛 Wallets</Link></li>
        </ul>
      </nav>
      <div className="signout" onClick={handleLogout} style={{ cursor: 'pointer', marginTop: '2rem', color: '#ff4d4f' }}>
        ↩ Sign Out
      </div>
    </div>
  );
}
