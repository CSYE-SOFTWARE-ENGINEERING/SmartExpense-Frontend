import React, { useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/auth/register', form);
      alert("注册成功，请登录");
      navigate('/login');
    } catch (err) {
      console.error("注册失败:", err.response?.data || err.message);
      alert("注册失败：" + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>注册</h2>
      <input placeholder="用户名" onChange={e => setForm({ ...form, username: e.target.value })} />
      <input placeholder="密码" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button type="submit">注册</button>
    </form>
  );
}

export default RegisterPage;
