// BudgetPage.jsx
import React, { useEffect, useState } from 'react';
import './BudgetPage.css';
import axios from '../utils/axiosInstance';

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([
    { category: 'Food', limit: 300 },
    { category: 'Transport', limit: 200 },
    { category: 'Entertainment', limit: 150 },
  ]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

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
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

  const getSpent = (category) => {
    return expenses
      .filter(e => e.categoryName === category)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  return (
    <div className="budget-page">
      <h1 className="budget-title">Total Budget: <span className="total-budget">${totalBudget}</span></h1>

      <div className="budget-section">
        {budgets.map((b, i) => {
          const spent = getSpent(b.category);
          const remaining = Math.max(0, b.limit - spent);
          const percent = Math.min(100, (spent / b.limit) * 100);

          return (
            <div className="budget-card" key={i}>
              <div className="budget-main">
                <span className="budget-category"><strong>{b.category}</strong></span>
                <span className="budget-amount">${b.limit}</span>
              </div>
              <div className="budget-meta">
                Spent: ${spent} | Remaining: ${remaining}
              </div>
              <div className="budget-bar">
                <div className="budget-bar-fill" style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
