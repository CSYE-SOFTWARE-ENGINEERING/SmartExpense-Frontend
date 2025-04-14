import React, { useEffect, useState } from 'react';
import './IncomesPage.css';
import axios from 'axios';

export default function IncomesPage() {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    date: '',
    category: '',
    description: '',
  });

  const [incomes, setIncomes] = useState([]);

  const fetchIncomes = async () => {
    const res = await axios.get('http://localhost:8080/api/income');
    setIncomes(res.data);
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    await axios.post('http://localhost:8080/api/income', form);
    fetchIncomes();
    setForm({ title: '', amount: '', date: '', category: '', description: '' });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8080/api/income/${id}`);
    fetchIncomes();
  };

  return (
    <div className="incomes-page">
      <h1 className="page-title">Total Income: ${incomes.reduce((sum, i) => sum + i.amount, 0)}</h1>

      <div className="incomes-content">
        <div className="incomes-form-section">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Income Title" />
          <input name="amount" value={form.amount} onChange={handleChange} placeholder="Income Amount" />
          <input name="date" type="date" value={form.date} onChange={handleChange} />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Add A Reference" />
          <button onClick={handleAdd}>+ Add Income</button>
        </div>

        <div className="incomes-record-section">
          {incomes.length === 0 ? (
            <p className="empty-note">No income records yet.</p>
          ) : (
            incomes.map((item) => (
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
