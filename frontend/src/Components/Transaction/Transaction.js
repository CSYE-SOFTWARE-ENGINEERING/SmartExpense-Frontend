
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useGlobalContext } from '../../context/globalContext';
import { InnerLayout } from '../../styles/Layouts';
import IncomeItem from '../IncomeItem/IncomeItem';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement
);

function Transaction() {
  const {
    getIncomes,
    getExpenses,
    incomes,
    expenses,
    deleteIncome,
    deleteExpense
  } = useGlobalContext();

  useEffect(() => {
    getIncomes();
    getExpenses();
  }, []);

  const allTransactions = [...incomes, ...expenses].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // === CATEGORY TOTALS FOR PIE & TABLE ===
  const categoryStats = {};
  allTransactions.forEach(tx => {
    const cat = tx.category || 'Unknown';
    const type = tx.type || 'expense';
    const key = cat + '_' + type;
    if (!categoryStats[key]) {
      categoryStats[key] = { category: cat, type: type, total: 0, count: 0 };
    }
    categoryStats[key].total += tx.amount;
    categoryStats[key].count += 1;
  });

  // === BAR CHART DATA ===
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const barData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        label: 'Amount',
        data: [totalIncome, totalExpense],
        backgroundColor: ['#10b981', '#ef4444'],
      },
    ],
  };

  // === LINE CHART DATA (MONTHLY TRENDS) ===
  const monthlyData = {};

  allTransactions.forEach(tx => {
    const date = new Date(tx.date);
    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[label]) {
      monthlyData[label] = { income: 0, expense: 0 };
    }
    monthlyData[label][tx.type] += tx.amount;
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const lineData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Income',
        data: sortedMonths.map(m => monthlyData[m].income),
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        tension: 0.3,
      },
      {
        label: 'Expense',
        data: sortedMonths.map(m => monthlyData[m].expense),
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
        tension: 0.3,
      },
    ],
  };

  const pieData = {
    labels: Object.values(categoryStats).map(stat => `${stat.category} (${stat.type})`),
    datasets: [
      {
        label: 'Category',
        data: Object.values(categoryStats).map(stat => stat.total),
        backgroundColor: [
          '#4f46e5', '#ec4899', '#10b981',
          '#f59e0b', '#8b5cf6', '#ef4444',
          '#22d3ee', '#6366f1', '#f43f5e'
        ],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  return (
    <TransactionStyled>
      <InnerLayout>
        <h1>Transaction Overview</h1>

        <div className="charts">
          <div className="chart"><h3>Category Breakdown</h3><Pie data={pieData} /></div>
          <div className="chart"><h3>Total Income vs Expense</h3><Bar data={barData} /></div>
          <div className="chart"><h3>Monthly Trends</h3><Line data={lineData} /></div>
        </div>

        <div className="table">
          <h3>Category Statistics</h3>
          <table>
            <thead>
              <tr><th>Category</th><th>Type</th><th>Count</th><th>Total</th></tr>
            </thead>
            <tbody>
              {Object.values(categoryStats).map((stat, i) => (
                <tr key={i}>
                  <td>{stat.category}</td>
                  <td>{stat.type}</td>
                  <td>{stat.count}</td>
                  <td>${stat.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tx-list">
          <h3>All Transactions</h3>
          {allTransactions.map((item) => (
            <IncomeItem
              key={item._id}
              id={item._id}
              title={item.title}
              description={item.description}
              amount={item.amount}
              date={item.date}
              type={item.type}
              category={item.category}
              indicatorColor={item.type === 'income' ? 'var(--color-green)' : 'var(--color-red)'}
              deleteItem={item.type === 'income' ? deleteIncome : deleteExpense}
            />
          ))}
        </div>
      </InnerLayout>
    </TransactionStyled>
  );
}

const TransactionStyled = styled.div`
  .charts {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .chart {
    max-width: 400px;
    width: 100%;
    background: white;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
  }

  .table {
    margin-bottom: 2rem;
    overflow-x: auto;

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 0.75rem;
      text-align: left;
    }

    th {
      background: #f0f0f0;
    }
  }

  .tx-list {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

export default Transaction;
