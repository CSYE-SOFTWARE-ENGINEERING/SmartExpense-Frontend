// src/pages/WalletsPage.jsx
import React, { useEffect, useState } from 'react';
import './WalletsPage.css';
import axios from '../utils/axiosInstance';

export default function WalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ name: '', type: '', balance: '' });

  const fetchWallets = async () => {
    try {
      const res = await axios.get('/wallets');
      const data = res.data || [];
      setWallets(data);
      const totalAmount = data.reduce((sum, w) => sum + (w.balance || 0), 0);
      setTotal(totalAmount);
    } catch (err) {
      console.error('Failed to fetch wallets:', err);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return (
    <div className="wallets-page">
      <h1 className="wallets-title">
        Total Balance: <span className="wallets-total">${total}</span>
      </h1>

      <div className="wallets-form">
        <input
          type="text"
          placeholder="Wallet Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="">Select Type</option>
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="CREDIT">Credit</option>
          <option value="INVESTMENT">Investment</option>
          <option value="SAVINGS">Savings</option>
        </select>
        <input
          type="number"
          placeholder="Initial Balance"
          value={form.balance}
          onChange={(e) => setForm({ ...form, balance: e.target.value })}
        />
        <button className="add-wallet-btn" disabled>+ Add Wallet</button>
      </div>

      <div className="wallets-list">
        {wallets.map((wallet) => (
          <div className="wallet-card" key={wallet.id}>
            <div className="wallet-header">
              <strong>{wallet.name}</strong>
              <span className="wallet-balance">${wallet.balance}</span>
            </div>
            <div className="wallet-meta">
              Type: {wallet.type} | Created At: {wallet.createdAt || 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
