import React, { useEffect, useState } from 'react';
import './ExpensesPage.css';
import axios from '../utils/axiosInstance';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#e53935', '#ef5350', '#f44336', '#ffcdd2', '#b71c1c', '#ff8a80'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [form, setForm] = useState({ 
    title: '', 
    amount: '', 
    date: '', 
    category: '', 
    note: '',
    walletId: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchWallets();
    fetchCategories();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await axios.get('/wallets');
      setWallets(res.data || []);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!form.title || !form.amount || !form.date || !form.walletId) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Get category ID from selection
      let categoryId = null;
      if (form.category) {
        const selectedCategory = categories.find(c => c.name === form.category);
        if (selectedCategory) {
          categoryId = selectedCategory.id;
        }
      }
      
      const expenseData = {
        amount: parseFloat(form.amount),
        description: form.title,
        date: form.date,
        type: 'EXPENSE',
        walletId: form.walletId,
        categoryId: categoryId
      };
      
      await axios.post('/transactions', expenseData);
      
      // Reset form and refresh
      setForm({ 
        title: '', 
        amount: '', 
        date: '', 
        category: '', 
        note: '',
        walletId: '' 
      });
      
      fetchExpenses();
      
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  return (
    <div className="expenses-page">
      <h1 className="expense-title">
        Total Expense: <span className="expense-total">${total}</span>
      </h1>

      <div className="expense-chart-form-wrapper">
        <div className="expense-form">
          <input 
            type="text" 
            placeholder="Expense Title" 
            value={form.title} 
            onChange={e => setForm({ ...form, title: e.target.value })} 
            required
          />
          <input 
            type="number" 
            placeholder="Expense Amount" 
            value={form.amount} 
            onChange={e => setForm({ ...form, amount: e.target.value })} 
            required
          />
          <input 
            type="date" 
            value={form.date} 
            onChange={e => setForm({ ...form, date: e.target.value })} 
            required
          />
          <select 
            value={form.walletId} 
            onChange={e => setForm({ ...form, walletId: e.target.value })} 
            required
          >
            <option value="">Select Wallet</option>
            {wallets.map(wallet => (
              <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
            ))}
          </select>
          <select 
            value={form.category} 
            onChange={e => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories
              .filter(c => c.type === 'EXPENSE')
              .map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))
            }
          </select>
          <textarea 
            placeholder="Add A Reference" 
            value={form.note} 
            onChange={e => setForm({ ...form, note: e.target.value })}
          ></textarea>
          <button onClick={handleSubmit}>+ Add Expense</button>
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