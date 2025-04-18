// IncomesPage.jsx
import React, { useEffect, useState } from 'react';
import './IncomesPage.css';
import axios from '../utils/axiosInstance';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#4caf50', '#81c784', '#66bb6a', '#a5d6a7', '#2e7d32', '#c8e6c9'];

export default function IncomesPage() {
  const [incomes, setIncomes] = useState([]);
  const [total, setTotal] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', date: '', category: '', note: '' });

  const fetchIncomes = async () => {
    try {
      const walletRes = await axios.get('/wallets');
      const wallets = walletRes.data || [];
      let allTx = [];

      for (const wallet of wallets) {
        const txRes = await axios.get(`/transactions/wallet/${wallet.id}`);
        const txs = txRes.data || [];
        allTx.push(...txs);
      }

      const incomeTx = allTx.filter(tx => tx.type === 'INCOME');
      setIncomes(incomeTx);
      setTotal(incomeTx.reduce((sum, tx) => sum + (tx.amount || 0), 0));

      const grouped = {};
      incomeTx.forEach(tx => {
        const category = tx.categoryName || 'Uncategorized';
        if (!grouped[category]) grouped[category] = 0;
        grouped[category] += tx.amount;
      });
      const categoryArray = Object.keys(grouped).map((key) => ({ name: key, value: grouped[key] }));
      setCategoryData(categoryArray);
    } catch (error) {
      console.error('Failed to fetch income data:', error);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  return (
    <div className="incomes-page">
      <h1 className="income-title">
        Total Income: <span className="income-total">${total}</span>
      </h1>

      <div className="income-chart-form-wrapper">
        <div className="income-form">
          <input type="text" placeholder="Income Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input type="number" placeholder="Income Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <textarea placeholder="Add A Reference" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}></textarea>
          <button disabled>+ Add Income</button>
        </div>

        <div className="income-chart">
          <h3>Income by Category</h3>
          <PieChart width={300} height={250}>
            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      <div className="incomes-section">
        {incomes.length === 0 ? (
          <p className="empty-note">No income records yet.</p>
        ) : (
          incomes.map((tx) => (
            <div className="income-card" key={tx.id}>
              <div className="income-main">
                <span className="income-title"><strong>{tx.description}</strong></span>
                <span className="income-amount">+ ${tx.amount}</span>
                <span className="income-date">{tx.date?.split('T')[0]}</span>
              </div>
              <div className="income-meta">
                Wallet: {tx.walletName} | Category: {tx.categoryName || 'N/A'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
