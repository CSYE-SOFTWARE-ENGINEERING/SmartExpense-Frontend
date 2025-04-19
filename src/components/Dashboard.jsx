import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import axios from '../utils/axiosInstance';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [balance, setBalance] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [walletData, setWalletData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('month');
  const [savings, setSavings] = useState({ rate: 0, amount: 0 });

  // Colors for charts
  const COLORS = ['#7e57c2', '#5c6bc0', '#42a5f5', '#26c6da', '#26a69a', '#66bb6a', '#d4e157', '#ffca28', '#ff7043', '#8d6e63'];
  const CATEGORY_COLORS = {
    'Groceries': '#66bb6a',
    'Utilities': '#42a5f5',
    'Dining': '#ffca28',
    'Transportation': '#8d6e63',
    'Salary': '#7e57c2',
    'Entertainment': '#ff7043',
    'Shopping': '#ec407a',
    'Uncategorized': '#bdbdbd'
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter data based on selected timeframe when data changes
    filterDataByTimeframe(activeTimeframe);
  }, [transactions]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const walletRes = await axios.get('/wallets');
      const walletsData = walletRes.data || [];
      setWallets(walletsData);
      
      if (walletsData.length === 0) {
        setLoading(false);
        return;
      }
  
      let allTx = [];
      let totalBalance = 0;
  
      for (const wallet of walletsData) {
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

      // Calculate savings rate and amount
      const totalIncome = incomeTx.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      const totalExpense = expenseTx.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      const savingsAmount = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;
      
      setSavings({
        rate: savingsRate,
        amount: savingsAmount
      });

      // Generate wallet distribution data
      const walletSums = walletsData.map(wallet => ({
        name: wallet.name,
        value: parseFloat(wallet.balance || 0),
        type: wallet.type
      }));
      setWalletData(walletSums);

      // Process category spending data
      processTransactionsData(allTx);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const processTransactionsData = (transactions) => {
    // Create time series data (group by date)
    const grouped = {};
    transactions.forEach(tx => {
      const dateStr = tx.date?.split('T')[0];
      if (!dateStr) return;
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = { date: dateStr, income: 0, expense: 0 };
      }
      
      if (tx.type === 'INCOME') {
        grouped[dateStr].income += parseFloat(tx.amount || 0);
      } else if (tx.type === 'EXPENSE') {
        grouped[dateStr].expense += parseFloat(tx.amount || 0);
      }
    });
    
    // Sort by date and convert to array
    const chartArray = Object.values(grouped)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        // Add cumulative balance calculation
        balance: 0 // This will be calculated below
      }));
    
    // Calculate running balance
    let runningBalance = 0;
    chartArray.forEach(day => {
      runningBalance += day.income - day.expense;
      day.balance = runningBalance;
    });
    
    setChartData(chartArray);

    // Process category spending
    const categories = {};
    transactions
      .filter(tx => tx.type === 'EXPENSE')
      .forEach(tx => {
        const category = tx.categoryName || 'Uncategorized';
        if (!categories[category]) categories[category] = 0;
        categories[category] += parseFloat(tx.amount || 0);
      });
    
    const categoryArray = Object.keys(categories).map(category => ({
      name: category,
      value: categories[category]
    }));
    
    // Sort by amount (highest first)
    categoryArray.sort((a, b) => b.value - a.value);
    setCategoryData(categoryArray);
  };

  const filterDataByTimeframe = (timeframe) => {
    setActiveTimeframe(timeframe);
    
    if (!transactions.length) return;
    
    const today = new Date();
    let startDate;
    
    // Calculate start date based on timeframe
    switch (timeframe) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
    }

    // Filter transactions within timeframe
    const filteredTx = transactions.filter(tx => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= today;
    });

    // Update charts with filtered data
    processTransactionsData(filteredTx);
  };

  const getSpendingTrend = () => {
    if (chartData.length < 2) return { status: 'neutral', percent: 0 };
    
    // Get last two periods and compare
    const periods = Math.min(2, Math.floor(chartData.length / 2));
    const lastPeriod = chartData.slice(-periods);
    const previousPeriod = chartData.slice(-periods * 2, -periods);
    
    const lastExpense = lastPeriod.reduce((sum, day) => sum + day.expense, 0);
    const prevExpense = previousPeriod.reduce((sum, day) => sum + day.expense, 0);
    
    if (prevExpense === 0) return { status: 'neutral', percent: 0 };
    
    const percentChange = ((lastExpense - prevExpense) / prevExpense) * 100;
    
    return {
      status: percentChange > 0 ? 'increase' : percentChange < 0 ? 'decrease' : 'neutral',
      percent: Math.abs(percentChange)
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const totalIncome = income.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
  const totalExpense = expense.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
  const spendingTrend = getSpendingTrend();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <div className="timeframe-selector">
          <button 
            className={activeTimeframe === 'week' ? 'active' : ''} 
            onClick={() => filterDataByTimeframe('week')}
          >
            Week
          </button>
          <button 
            className={activeTimeframe === 'month' ? 'active' : ''} 
            onClick={() => filterDataByTimeframe('month')}
          >
            Month
          </button>
          <button 
            className={activeTimeframe === 'quarter' ? 'active' : ''} 
            onClick={() => filterDataByTimeframe('quarter')}
          >
            Quarter
          </button>
          <button 
            className={activeTimeframe === 'year' ? 'active' : ''} 
            onClick={() => filterDataByTimeframe('year')}
          >
            Year
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your financial data...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="dashboard-empty">
          <h2>Welcome to SmartExpense!</h2>
          <p>You don't have any transactions yet. Start by adding a wallet and recording your transactions.</p>
          <div className="empty-actions">
            <button onClick={() => window.location.href = '/wallets'} className="primary-button">Add Wallet</button>
            <button onClick={() => window.location.href = '/transactions'} className="secondary-button">Record Transaction</button>
          </div>
        </div>
      ) : (
        <>
          <div className="metrics-row">
            <div className="metric-card">
              <div className="metric-icon income-icon">
                <i className="fas fa-arrow-down"></i>
              </div>
              <div className="metric-content">
                <h3>Total Income</h3>
                <p className="metric-value">{formatCurrency(totalIncome)}</p>
                <p className="metric-period">{activeTimeframe}</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon expense-icon">
                <i className="fas fa-arrow-up"></i>
              </div>
              <div className="metric-content">
                <h3>Total Expenses</h3>
                <p className="metric-value">{formatCurrency(totalExpense)}</p>
                <div className="trend-indicator">
                  <span className={`trend-${spendingTrend.status}`}>
                    {spendingTrend.status === 'increase' && '↑'}
                    {spendingTrend.status === 'decrease' && '↓'}
                    {spendingTrend.status === 'neutral' && '→'}
                    {spendingTrend.percent.toFixed(1)}%
                  </span>
                  <span className="trend-label">vs previous {activeTimeframe}</span>
                </div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon balance-icon">
                <i className="fas fa-wallet"></i>
              </div>
              <div className="metric-content">
                <h3>Current Balance</h3>
                <p className="metric-value">{formatCurrency(balance)}</p>
                <p className="metric-period">across all wallets</p>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon savings-icon">
                <i className="fas fa-piggy-bank"></i>
              </div>
              <div className="metric-content">
                <h3>Savings Rate</h3>
                <p className="metric-value">{savings.rate.toFixed(1)}%</p>
                <p className="metric-period">{formatCurrency(savings.amount)} saved</p>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card cash-flow-chart">
              <h3>Cash Flow</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7e57c2" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#7e57c2" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec407a" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ec407a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(value) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#7e57c2" 
                      fillOpacity={1} 
                      fill="url(#colorIncome)" 
                      stackId="1"
                      name="Income"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#ec407a" 
                      fillOpacity={1} 
                      fill="url(#colorExpense)" 
                      stackId="2"
                      name="Expense"
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card balance-trend-chart">
              <h3>Balance Trend</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(value) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#26a69a" 
                      strokeWidth={3}
                      dot={{ stroke: '#26a69a', strokeWidth: 2, r: 4 }}
                      activeDot={{ stroke: '#26a69a', strokeWidth: 2, r: 6 }}
                      name="Running Balance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card spending-chart">
              <h3>Spending by Category</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card wallet-chart">
              <h3>Wallet Distribution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={walletData} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100} 
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Balance" 
                      radius={[0, 4, 4, 0]}
                    >
                      {walletData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="recent-transactions-section">
            <h3>Recent Transactions</h3>
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Wallet</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5)
                  .map((tx) => (
                    <tr key={tx.id} className={tx.type === 'INCOME' ? 'income-tx' : 'expense-tx'}>
                      <td>{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="tx-description">{tx.description}</td>
                      <td>{tx.categoryName || 'Uncategorized'}</td>
                      <td className={`tx-amount ${tx.type === 'INCOME' ? 'income-amount' : 'expense-amount'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </td>
                      <td>{tx.walletName}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
            <div className="view-all-link">
              <a href="/transactions">View All Transactions →</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}