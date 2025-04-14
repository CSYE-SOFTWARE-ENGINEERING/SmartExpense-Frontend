import React, { useEffect, useState } from 'react';
import './FormPage.css';
import axios from 'axios';

export default function ExpensesPage() {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    date: '',
    category: '',
    description: '',
  });

  const [expenses, setExpenses] = useState([]);

  const fetchExpenses = async () => {
    const res = await axios.get('http://localhost:8080/api/expense');
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    await axios.post('http://localhost:8080/api/expense', form);
    fetchExpenses();
    setForm({ title: '', amount: '', date: '', category: '', description: '' });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8080/api/expense/${id}`);
    fetchExpenses();
  };

  return (
    <div className="expense-page">
      {/* 顶部标题 */}
      <h1 className="page-title">Total Expense: ${expenses.reduce((sum, i) => sum + i.amount, 0)}</h1>

      <div className="expense-content">
        {/* 左边添加表单 */}
        <div className="form-section">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Expense Title" />
          <input name="amount" value={form.amount} onChange={handleChange} placeholder="Expense Amount" />
          <input name="date" type="date" value={form.date} onChange={handleChange} />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Add A Reference" />
          <button onClick={handleAdd}>+ Add Expense</button>
        </div>

        {/* 右边笔记风卡片列表 */}
        <div className="record-section">
          {expenses.length === 0 ? (
            <p className="empty-note">No expense records yet.</p>
          ) : (
            expenses.map((item) => (
              <div className="item-card" key={item.id}>
                <div>
                  <b>{item.title}</b> | ${item.amount} | {item.date}
                  <div className="note-text">{item.description}</div>
                </div>
                <button onClick={() => handleDelete(item.id)}>🗑️</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
