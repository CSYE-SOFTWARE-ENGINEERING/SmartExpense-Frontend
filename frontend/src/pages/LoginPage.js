import React, { useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/auth/login', form);
      login(res.data.token);
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Welcome Back</h2>
        <input
          placeholder="Username"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
          style={styles.input}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
        <p style={styles.text}>
          Don’t have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', background: '#f5f7fa',
  },
  form: {
    background: '#fff', padding: '2rem', borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px',
  },
  input: {
    padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px',
    fontSize: '1rem',
  },
  button: {
    padding: '0.8rem', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontSize: '1rem',
  },
  text: {
    fontSize: '0.9rem', textAlign: 'center',
  },
  link: {
    color: '#4f46e5', textDecoration: 'none', fontWeight: '500',
  },
  title: {
    textAlign: 'center',
  }
};

export default LoginPage;
