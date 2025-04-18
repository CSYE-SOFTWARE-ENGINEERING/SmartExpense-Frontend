import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import './TransactionsPage.css';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    description: '',
    amount: '',
    date: '',
    type: 'INCOME',
    categoryId: '',
    walletId: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchTransactions = async () => {
    const walletRes = await axios.get('/wallets');
    setWallets(walletRes.data);

    const allTx = [];
    for (const wallet of walletRes.data) {
      const res = await axios.get(`/transactions/wallet/${wallet.id}`);
      allTx.push(...res.data);
    }
    allTx.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(allTx);
  };

  const fetchCategories = async () => {
    const res = await axios.get('/categories');
    setCategories(res.data);
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await axios.put(`/transactions/${formData.id}`, formData);
    } else {
      await axios.post('/transactions', formData);
    }
    setFormData({ id: null, description: '', amount: '', date: '', type: 'INCOME', categoryId: '', walletId: '' });
    setIsEditing(false);
    fetchTransactions();
  };

  const handleEdit = (tx) => {
    setFormData({
      id: tx.id,
      description: tx.description,
      amount: tx.amount,
      date: tx.date.split('T')[0],
      type: tx.type,
      categoryId: tx.categoryId,
      walletId: tx.walletId
    });
    setIsEditing(true);
  };

  return (
    <div className="transactions-page">
      <h1 className="page-title">All Transactions</h1>

      <form onSubmit={handleSubmit} className="transaction-form">
        <input type="text" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
        <input type="number" placeholder="Amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <select value={formData.walletId} onChange={e => setFormData({ ...formData, walletId: e.target.value })} required>
          <option value="">Select Wallet</option>
          {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} required>
          <option value="">Select Category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit">{isEditing ? 'Update' : 'Add'} Transaction</button>
      </form>

      <div className="transactions-section">
        {transactions.length === 0 ? (
          <p className="empty-note">No transaction records yet.</p>
        ) : (
          transactions.map((item) => (
            <div className="item-card" key={item.id}>
              <div>
                <b>{item.description}</b> - ${item.amount} ({item.type}) on {item.date.split('T')[0]}<br />
                <small>Wallet: {item.walletName} | Category: {item.categoryName}</small>
              </div>
              <button onClick={() => handleEdit(item)}>Edit</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
