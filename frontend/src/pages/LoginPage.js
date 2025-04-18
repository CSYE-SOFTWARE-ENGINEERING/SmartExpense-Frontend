import React, { useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axiosClient.post('/auth/login', form);
    login(res.data.token);
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>登录</h2>
      <input placeholder="用户名" onChange={e => setForm({ ...form, username: e.target.value })} />
      <input placeholder="密码" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button type="submit">登录</button>
    </form>
  );
}

export default LoginPage;