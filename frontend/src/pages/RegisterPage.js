import React, { useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/auth/register', form);
      alert("Registration successful!");
      navigate('/login');
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Create an Account</h2>
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
        <button type="submit" style={styles.button}>Register</button>
        <p style={styles.text}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
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
    padding: '0.8rem', background: '#10b981', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontSize: '1rem',
  },
  text: {
    fontSize: '0.9rem', textAlign: 'center',
  },
  link: {
    color: '#10b981', textDecoration: 'none', fontWeight: '500',
  },
  title: {
    textAlign: 'center',
  }
};

export default RegisterPage;
