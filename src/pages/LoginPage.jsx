// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

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
          // ✅ 保存 token，axios 会自动带上它
          localStorage.setItem('token', data.token);

          // ✅ 跳转到 dashboard
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
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
