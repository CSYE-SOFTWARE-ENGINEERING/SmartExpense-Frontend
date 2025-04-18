import React, { useEffect, useState } from 'react';
import './ExpensesPage.css';
import axios from '../utils/axiosInstance';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#e53935', '#ef5350', '#f44336', '#ffcdd2', '#b71c1c', '#ff8a80'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', date: '', category: '', note: '' });

  const fetchExpenses = async () => {
    try {
      const walletRes = await axios.get('/wallets');
      const wallets = walletRes.data || [];
      let allTx = [];

      for (const wallet of wallets) {
        const txRes = await axios.get(`/transactions/wallet/${wallet.id}`);
        const txs = txRes.data || [];
        allTx.push(...txs);
      }

      const expenseTx = allTx.filter(tx => tx.type === 'EXPENSE');
      setExpenses(expenseTx);
      setTotal(expenseTx.reduce((sum, tx) => sum + (tx.amount || 0), 0));

      const grouped = {};
      expenseTx.forEach(tx => {
        const category = tx.categoryName || 'Uncategorized';
        if (!grouped[category]) grouped[category] = 0;
        grouped[category] += tx.amount;
      });
      const categoryArray = Object.keys(grouped).map((key) => ({ name: key, value: grouped[key] }));
      setCategoryData(categoryArray);
    } catch (error) {
      console.error('Failed to fetch expense data:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="expenses-page">
      <h1 className="expense-title">
        Total Expense: <span className="expense-total">${total}</span>
      </h1>

      <div className="expense-chart-form-wrapper">
        <div className="expense-form">
          <input type="text" placeholder="Expense Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input type="number" placeholder="Expense Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <textarea placeholder="Add A Reference" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}></textarea>
          <button disabled>+ Add Expense</button>
        </div>

        <div className="expense-chart">
          <h3>Expense by Category</h3>
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

      <div className="expenses-section">
        {expenses.length === 0 ? (
          <p className="empty-note">No expense records yet.</p>
        ) : (
          expenses.map((tx) => (
            <div className="expense-card" key={tx.id}>
              <div className="expense-main">
                <span className="expense-title"><strong>{tx.description}</strong></span>
                <span className="expense-amount">– ${tx.amount}</span>
                <span className="expense-date">{tx.date?.split('T')[0]}</span>
              </div>
              <div className="expense-meta">
                Wallet: {tx.walletName} | Category: {tx.categoryName || 'N/A'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
