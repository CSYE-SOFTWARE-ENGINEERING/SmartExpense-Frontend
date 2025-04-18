import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import axios from '../utils/axiosInstance';

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Check if we already have user data in localStorage
      const userData = localStorage.getItem('userData');
      
      if (userData) {
        // If we have user data in localStorage, use it
        setUser(JSON.parse(userData));
        setIsLoading(false);
      } else {
        // Otherwise fetch from API
        const response = await axios.get('/auth/current-user');
        
        if (response.data) {
          const userInfo = response.data;
          setUser({
            username: userInfo.username || '',
            firstName: userInfo.firstName || '',
            lastName: userInfo.lastName || ''
          });
          
          // Store user data in localStorage for future use
          localStorage.setItem('userData', JSON.stringify({
            username: userInfo.username || '',
            firstName: userInfo.firstName || '',
            lastName: userInfo.lastName || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If we can't fetch user data, use the token to get at least the username
      try {
        // Get token and try to extract username (if token is JWT)
        const token = localStorage.getItem('token');
        if (token) {
          // Try to extract username from token if it's a JWT
          // This is a fallback and depends on your token structure
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          if (tokenData.sub) {
            setUser({ 
              username: tokenData.sub,
              firstName: '',
              lastName: ''
            });
          }
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Determine display name (use firstName if available, otherwise username)
  const displayName = user.firstName || user.username;

  return (
    <div className="sidebar">
      <div className="profile">
        <img src="https://i.pravatar.cc/100" alt="User" />
        <h3>{isLoading ? 'Loading...' : displayName}</h3>
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