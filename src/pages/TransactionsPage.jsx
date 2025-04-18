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
    try {
      const walletRes = await axios.get('/wallets');
      setWallets(walletRes.data || []);

      const allTx = [];
      for (const wallet of walletRes.data || []) {
        const res = await axios.get(`/transactions/wallet/${wallet.id}`);
        allTx.push(...(res.data || []));
      }
      allTx.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(allTx);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
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

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/transactions/${formData.id}`, formData);
      } else {
        await axios.post('/transactions', formData);
      }
      setFormData({ id: null, description: '', amount: '', date: '', type: 'INCOME', categoryId: '', walletId: '' });
      setIsEditing(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    }
  };

  const handleEdit = (tx) => {
    setFormData({
      id: tx.id,
      description: tx.description || '',
      amount: tx.amount || '',
      date: tx.date ? tx.date.split('T')[0] : '',
      type: tx.type || 'INCOME',
      categoryId: tx.categoryId || '',
      walletId: tx.walletId || ''
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await axios.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const resetForm = () => {
    setFormData({ id: null, description: '', amount: '', date: '', type: 'INCOME', categoryId: '', walletId: '' });
    setIsEditing(false);
  };

  return (
    <div className="transactions-page">
      <h1 className="page-title">All Transactions</h1>

      <div className="transaction-form-container">
        <h2>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h2>
        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-row">
            <div className="form-group">
              <label>Description</label>
              <input 
                type="text" 
                placeholder="Description" 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input 
                type="number" 
                placeholder="Amount" 
                value={formData.amount} 
                onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData({ ...formData, type: e.target.value })} 
                required
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Wallet</label>
              <select 
                value={formData.walletId} 
                onChange={e => setFormData({ ...formData, walletId: e.target.value })} 
                required
              >
                <option value="">Select Wallet</option>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select 
                value={formData.categoryId} 
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })} 
                required
              >
                <option value="">Select Category</option>
                {categories
                  .filter(c => formData.type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE')
                  .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                }
              </select>
            </div>
          </div>

          <div className="form-buttons">
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button type="submit" className="submit-btn">
              {isEditing ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>

      <div className="transactions-section">
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="empty-note">No transaction records yet.</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Date</th>
                <th>Wallet</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.id} className={item.type === 'INCOME' ? 'income-row' : 'expense-row'}>
                  <td>{item.description}</td>
                  <td>${item.amount}</td>
                  <td>{item.type}</td>
                  <td>{item.date?.split('T')[0]}</td>
                  <td>{item.walletName}</td>
                  <td>{item.categoryName}</td>
                  <td className="action-cell">
                    <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}