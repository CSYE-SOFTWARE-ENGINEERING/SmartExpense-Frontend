// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:8085/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (res.ok) {
        if (data.token) {
          // Save token
          localStorage.setItem('token', data.token);
          
          // Store user data if available
          if (data.user) {
            localStorage.setItem('userData', JSON.stringify({
              username: data.user.username || '',
              firstName: data.user.firstName || '',
              lastName: data.user.lastName || ''
            }));
            
            console.log('User data saved:', data.user);
          }

          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          setErrorMsg('Login succeeded but token missing');
        }
      } else {
        setErrorMsg(data.error || data.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Login to SmartExpense</h2>
        {errorMsg && <p className="error">{errorMsg}</p>}
        
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
          required
        />
        
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          required
        />
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="register-link">
          Don't have an account? <Link to="/register">Register now</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;