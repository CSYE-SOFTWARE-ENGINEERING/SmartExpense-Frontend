import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import axios from '../utils/axiosInstance';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

export default function Dashboard() {
  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const walletRes = await axios.get('/wallets');
      const wallets = walletRes.data || [];
      if (wallets.length === 0) return;
  
      const allTx = [];
  
      let totalBalance = 0;
  
      for (const wallet of wallets) {
        totalBalance += wallet.balance || 0;
  
        const txRes = await axios.get(`/transactions/wallet/${wallet.id}`);
        const txs = txRes.data || [];
        allTx.push(...txs);
      }
  
      setBalance(totalBalance);
      setTransactions(allTx);
  
      const incomeTx = allTx.filter(tx => tx.type === 'INCOME');
      const expenseTx = allTx.filter(tx => tx.type === 'EXPENSE');
      setIncome(incomeTx);
      setExpense(expenseTx);
  
      const grouped = {};
      allTx.forEach(tx => {
        const dateStr = tx.date?.split('T')[0];
        if (!grouped[dateStr]) {
          grouped[dateStr] = { name: dateStr, income: 0, expense: 0 };
        }
        if (tx.type === 'INCOME') {
          grouped[dateStr].income += tx.amount;
        } else if (tx.type === 'EXPENSE') {
          grouped[dateStr].expense += tx.amount;
        }
      });
  
      const chartArray = Object.values(grouped).sort((a, b) => new Date(a.name) - new Date(b.name));
      setChartData(chartArray);
  
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
    }
  };
  

  

  

  const totalIncome = income.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpense = expense.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="summary-cards">
        <div className="card income-card">
          <h3>Total Income</h3>
          <p style={{ color: 'green' }}>${totalIncome}</p>
        </div>
        <div className="card expense-card">
          <h3>Total Expense</h3>
          <p style={{ color: 'red' }}>${totalExpense}</p>
        </div>
        <div className="card balance-card">
          <h3>Wallet Balance</h3>
          <p style={{ color: 'blue' }}>${balance}</p>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="chart-placeholder">
          <h3>Spending Overview</h3>
          <LineChart width={500} height={250} data={chartData}>
            <Line type="monotone" dataKey="income" stroke="#4caf50" />
            <Line type="monotone" dataKey="expense" stroke="#e53935" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
          </LineChart>
        </div>

        <div className="recent-transactions">
          <h3>Recent Transactions</h3>
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="3">No recent transactions.</td></tr>
              ) : (
                transactions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5)
                  .map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.description}</td>
                      <td>${tx.amount}</td>
                      <td>{tx.date?.split('T')[0]}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
