import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import './AiInsightsPage.css';

export default function AiInsightsPage() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [insights, setInsights] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingsRate, setSavingsRate] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch wallets
      const walletRes = await axios.get('/wallets');
      const walletData = walletRes.data || [];
      setWallets(walletData);

      // Fetch all transactions
      let allTransactions = [];
      for (const wallet of walletData) {
        const txRes = await axios.get(`/transactions/wallet/${wallet.id}`);
        allTransactions = [...allTransactions, ...(txRes.data || [])];
      }
      setTransactions(allTransactions);

      // Fetch categories
      const catRes = await axios.get('/categories');
      setCategories(catRes.data || []);

      // Fetch budgets
      const budgetRes = await axios.get('/budgets');
      setBudgets(budgetRes.data || []);

      // Process data after fetching everything
      processTransactionData(allTransactions, catRes.data || [], budgetRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTransactionData = (txData, catData, budgetData) => {
    // 1. Calculate category spending
    const catSpending = {};
    txData.forEach(tx => {
      if (tx.type === 'EXPENSE') {
        const catName = tx.categoryName || 'Uncategorized';
        if (!catSpending[catName]) {
          catSpending[catName] = 0;
        }
        catSpending[catName] += Number(tx.amount);
      }
    });

    const catSpendingArray = Object.keys(catSpending).map(name => ({
      name,
      value: catSpending[name]
    })).sort((a, b) => b.value - a.value);

    setCategorySpending(catSpendingArray);

    // 2. Calculate monthly spending
    const monthlyData = {};
    txData.forEach(tx => {
      if (!tx.date) return;
      
      const date = new Date(tx.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          name: monthYear,
          income: 0,
          expense: 0
        };
      }
      
      if (tx.type === 'INCOME') {
        monthlyData[monthYear].income += Number(tx.amount);
      } else if (tx.type === 'EXPENSE') {
        monthlyData[monthYear].expense += Number(tx.amount);
      }
    });

    const monthlyArray = Object.values(monthlyData)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    setMonthlySpending(monthlyArray);

    // 3. Calculate top expenses
    const sortedExpenses = txData
      .filter(tx => tx.type === 'EXPENSE')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5);
    
    setTopExpenses(sortedExpenses);

    // 4. Calculate savings rate
    const totalIncome = txData
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    const totalExpense = txData
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    const savings = totalIncome - totalExpense;
    const savingsRateValue = totalIncome > 0 
      ? (savings / totalIncome) * 100 
      : 0;
    
    setSavingsRate(savingsRateValue);

    // 5. Generate insights
    const insightsList = [];

    // Insight: Budget status
    budgetData.forEach(budget => {
      if (budget.spentAmount > budget.amount) {
        insightsList.push({
          type: 'warning',
          title: `Budget Exceeded: ${budget.categoryName}`,
          description: `You've spent $${budget.spentAmount} out of your $${budget.amount} budget for ${budget.categoryName}.`
        });
      } else if (budget.spentAmount > budget.amount * 0.8) {
        insightsList.push({
          type: 'info',
          title: `Budget Almost Reached: ${budget.categoryName}`,
          description: `You've used ${budget.percentageUsed.toFixed(1)}% of your ${budget.categoryName} budget.`
        });
      }
    });

    // Insight: Spending trends
    if (monthlyArray.length > 1) {
      const lastMonth = monthlyArray[monthlyArray.length - 1];
      const prevMonth = monthlyArray[monthlyArray.length - 2];
      
      if (lastMonth && prevMonth) {
        const change = ((lastMonth.expense - prevMonth.expense) / prevMonth.expense) * 100;
        if (change > 20) {
          insightsList.push({
            type: 'warning',
            title: 'Spending Increase',
            description: `Your spending increased by ${change.toFixed(1)}% compared to the previous month.`
          });
        } else if (change < -10) {
          insightsList.push({
            type: 'success',
            title: 'Spending Decrease',
            description: `Your spending decreased by ${Math.abs(change).toFixed(1)}% compared to the previous month.`
          });
        }
      }
    }

    // Insight: Savings rate
    if (savingsRateValue < 10) {
      insightsList.push({
        type: 'warning',
        title: 'Low Savings Rate',
        description: `Your savings rate is ${savingsRateValue.toFixed(1)}%. Consider reducing expenses in top spending categories.`
      });
    } else if (savingsRateValue > 20) {
      insightsList.push({
        type: 'success',
        title: 'Good Savings Rate',
        description: `Your savings rate is ${savingsRateValue.toFixed(1)}%. You're on track for good financial health.`
      });
    }

    // Insight: Category spending
    if (catSpendingArray.length > 0) {
      const topCategory = catSpendingArray[0];
      const topPercentage = (topCategory.value / totalExpense) * 100;
      
      if (topPercentage > 40) {
        insightsList.push({
          type: 'info',
          title: 'High Category Spending',
          description: `${topCategory.name} accounts for ${topPercentage.toFixed(1)}% of your total spending.`
        });
      }
    }

    setInsights(insightsList);

    // 6. Generate recommendations
    const recommendationsList = [];

    // Recommendation: Budget creation
    const categoriesWithoutBudget = catData
      .filter(cat => cat.type === 'EXPENSE')
      .filter(cat => !budgetData.some(b => b.categoryId === cat.id));
    
    if (categoriesWithoutBudget.length > 0) {
      recommendationsList.push({
        title: 'Create More Budgets',
        description: `Set up budgets for ${categoriesWithoutBudget.map(c => c.name).join(', ')} to better control spending.`
      });
    }

    // Recommendation: Savings improvement
    if (savingsRateValue < 20) {
      recommendationsList.push({
        title: 'Improve Savings Rate',
        description: 'Aim to save at least 20% of your income. Review your top spending categories to find potential savings.'
      });
    }

    // Recommendation: Spending reduction
    if (catSpendingArray.length > 0) {
      const topCategory = catSpendingArray[0];
      recommendationsList.push({
        title: `Reduce ${topCategory.name} Spending`,
        description: `This is your highest spending category at $${topCategory.value.toFixed(2)}. Consider ways to cut costs here.`
      });
    }

    // Recommendation: Income diversification
    const incomeSourceCount = new Set(
      txData
        .filter(tx => tx.type === 'INCOME')
        .map(tx => tx.categoryName)
    ).size;
    
    if (incomeSourceCount < 2) {
      recommendationsList.push({
        title: 'Diversify Income Sources',
        description: 'Having multiple income streams provides greater financial stability.'
      });
    }

    // Recommendation: Regular expense review
    recommendationsList.push({
      title: 'Review Subscriptions',
      description: 'Review recurring expenses regularly and cancel those you no longer use or need.'
    });

    setRecommendations(recommendationsList);
  };

  if (loading) {
    return (
      <div className="insights-page">
        <h1 className="insights-title">AI Insights</h1>
        <div className="insights-loading">Loading financial insights...</div>
      </div>
    );
  }

  return (
    <div className="insights-page">
      <h1 className="insights-title">AI Insights</h1>
      
      <div className="insights-summary">
        <div className="insight-metric">
          <h3>Savings Rate</h3>
          <div className="metric-value">{savingsRate.toFixed(1)}%</div>
        </div>
        <div className="insight-metric">
          <h3>Budget Status</h3>
          <div className="metric-value">
            {budgets.filter(b => b.percentageUsed < 100).length}/{budgets.length} On Track
          </div>
        </div>
        <div className="insight-metric">
          <h3>Top Expense</h3>
          <div className="metric-value">
            {categorySpending.length > 0 ? categorySpending[0].name : 'N/A'}
          </div>
        </div>
      </div>

      {/* Key Insights Section */}
      <div className="insights-section">
        <h2>Key Insights</h2>
        {insights.length === 0 ? (
          <div className="empty-insights">
            No insights available yet. Add more transaction data to generate insights.
          </div>
        ) : (
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <h3>{insight.title}</h3>
                <p>{insight.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spending Trends Section */}
      <div className="insights-chart-section">
        <h2>Spending & Income Trends</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#4caf50" 
                name="Income" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#f44336" 
                name="Expenses" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Spending Section */}
      <div className="insights-chart-grid">
        <div className="chart-card">
          <h2>Category Spending</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h2>Top Expenses</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topExpenses.map(tx => ({
                  name: tx.description || 'Unnamed',
                  amount: Number(tx.amount)
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#f44336">
                  {topExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="insights-section">
        <h2>Smart Recommendations</h2>
        <div className="recommendations-list">
          {recommendations.map((rec, index) => (
            <div key={index} className="recommendation-card">
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}