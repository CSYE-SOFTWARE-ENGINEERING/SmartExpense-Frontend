import React, { useEffect, useState } from 'react';
import './TransactionsPage.css';
import axios from 'axios';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const res = await axios.get('http://localhost:8080/api/transaction');
    setTransactions(res.data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="transactions-page">
      <h1 className="page-title">All Transactions</h1>

      <div className="transactions-section">
        {transactions.length === 0 ? (
          <p className="empty-note">No transaction records yet.</p>
        ) : (
          transactions.map((item) => (
            <div className="item-card" key={item.id}>
              <div>
                <b>{item.title}</b> | ${item.amount} | {item.date}
                <div className="note-text">{item.description}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
