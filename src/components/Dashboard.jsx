
import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import axios from 'axios';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const incomeRes = await axios.get('http://localhost:8080/api/income');
    const expenseRes = await axios.get('http://localhost:8080/api/expense');
    const transactionRes = await axios.get('http://localhost:8080/api/transaction');
    setIncome(incomeRes.data || []);
    setExpense(expenseRes.data || []);
    setTransactions(transactionRes.data || []);
  };

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expense.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: '01/04/2025', income: 5000, expense: 800 },
    { name: '02/04/2025', income: 4000, expense: 600 },
    { name: '03/04/2025', income: 4800, expense: 900 },
    { name: '04/04/2025', income: 4900, expense: 1000 },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="summary-cards">
        <div className="card income-card">
          <h3>Total Income</h3>
          <p>${totalIncome}</p>
        </div>
        <div className="card expense-card">
          <h3>Total Expense</h3>
          <p>${totalExpense}</p>
        </div>
        <div className="card balance-card">
          <h3>Balance</h3>
          <p>${balance}</p>
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
          <ul>
            {transactions.slice(0, 5).map((tx) => (
              <li key={tx.id}>
                <span>{tx.title}</span>
                <span>${tx.amount}</span>
                <span>{tx.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
