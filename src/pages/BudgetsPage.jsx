import React, { useEffect, useState } from 'react';
import './BudgetPage.css';
import axios from '../utils/axiosInstance';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [form, setForm] = useState({ 
    amount: '', 
    categoryId: '', 
    startDate: '', 
    endDate: '' 
  });

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
    fetchCategories();
  }, []);

  // Update available categories whenever budgets or categories change
  useEffect(() => {
    updateAvailableCategories();
  }, [budgets, categories]);

  const fetchBudgets = async () => {
    try {
      const res = await axios.get('/budgets');
      console.log('Fetched budgets:', res.data);
      setBudgets(res.data || []);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      setMessage({ text: 'Failed to load budgets', type: 'error' });
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories');
      // Filter for expense categories only
      const expenseCategories = res.data.filter(cat => cat.type === 'EXPENSE');
      setCategories(expenseCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setMessage({ text: 'Failed to load categories', type: 'error' });
    }
  };

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

  // Update the list of available categories (ones that don't already have a budget)
  const updateAvailableCategories = () => {
    // If we're in edit mode, we need to handle differently
    if (editingBudgetId) {
      // Get the current budget we're editing
      const currentBudget = budgets.find(b => b.id === editingBudgetId);
      if (!currentBudget) return;

      // For editing, we only care about the current category or ones without budgets
      const budgetedCategoryIds = budgets
        .filter(b => b.id !== editingBudgetId) // Exclude current budget
        .map(b => parseInt(b.categoryId));
      
      // Allow both the current category and unbudgeted categories
      const available = categories.filter(cat => 
        !budgetedCategoryIds.includes(cat.id) || 
        cat.id === parseInt(currentBudget.categoryId)
      );
      
      setAvailableCategories(available);
    } else {
      // For new budgets, only show categories without existing budgets
      const budgetedCategoryIds = budgets.map(b => parseInt(b.categoryId));
      const available = categories.filter(cat => !budgetedCategoryIds.includes(cat.id));
      setAvailableCategories(available);
    }
  };

  // Ensure proper data types for budget request
  const prepareBudgetData = (formData) => {
    return {
      // Amount: Convert to number with 2 decimal places
      amount: Number(parseFloat(formData.amount).toFixed(2)),
      
      // CategoryId: Ensure it's an integer
      categoryId: Number(formData.categoryId),
      
      // Dates: Format as YYYY-MM-DD strings
      startDate: new Date(formData.startDate).toISOString().split('T')[0],
      endDate: new Date(formData.endDate).toISOString().split('T')[0]
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Form validation
      if (!form.amount || !form.categoryId || !form.startDate || !form.endDate) {
        setMessage({ text: 'Please fill in all fields', type: 'error' });
        return;
      }
      
      // Validate dates
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);
      if (endDate < startDate) {
        setMessage({ text: 'End date must be after start date', type: 'error' });
        return;
      }
      
      // Check for duplicate budget (only for new budgets)
      if (!editingBudgetId && budgets.some(b => parseInt(b.categoryId) === parseInt(form.categoryId))) {
        setMessage({ 
          text: 'This category already has a budget. Please edit the existing budget instead.', 
          type: 'error' 
        });
        return;
      }
      
      // Set submitting state to prevent multiple submissions
      setIsSubmitting(true);
      setMessage({ text: editingBudgetId ? 'Updating budget...' : 'Creating budget...', type: 'info' });
      
      // Prepare data with proper types and formats
      const budgetData = prepareBudgetData(form);
      
      // Log request data for debugging
      console.log('Budget request data:', budgetData);
      
      let response;
      if (editingBudgetId) {
        // Update existing budget
        response = await axios.put(`/budgets/${editingBudgetId}`, budgetData);
        console.log('Budget updated response:', response.data);
        setMessage({ text: 'Budget updated successfully!', type: 'success' });
      } else {
        // Create new budget with better error handling
        try {
          response = await axios.post('/budgets', budgetData);
          console.log('Budget created response:', response.data);
          setMessage({ text: 'Budget created successfully!', type: 'success' });
        } catch (err) {
          console.error('Detailed create budget error:', err);
          
          // Check for specific error cases
          if (err.response) {
            console.error('Error response status:', err.response.status);
            console.error('Error response data:', err.response.data);
            
            // Handle specific HTTP status codes
            if (err.response.status === 400) {
              setMessage({ text: 'Invalid budget data. Please check your inputs.', type: 'error' });
            } else if (err.response.status === 409) {
              setMessage({ text: 'A budget for this category already exists.', type: 'error' });
            } else {
              setMessage({ 
                text: err.response.data.message || 'Server error. Please try again.', 
                type: 'error' 
              });
            }
          } else if (err.request) {
            // The request was made but no response was received
            console.error('No response received:', err.request);
            setMessage({ text: 'No response from server. Please check your connection.', type: 'error' });
          } else {
            // Something happened in setting up the request
            console.error('Request setup error:', err.message);
            setMessage({ text: 'Request failed: ' + err.message, type: 'error' });
          }
          
          setIsSubmitting(false);
          return; // Stop execution if there was an error
        }
      }
      
      // Reset form and editing state
      setForm({ amount: '', categoryId: '', startDate: '', endDate: '' });
      setEditingBudgetId(null);
      
      // Refresh budgets list
      fetchBudgets();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error(editingBudgetId ? 'Failed to update budget:' : 'Failed to create budget:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      
      setMessage({ 
        text: error.response?.data?.message || (editingBudgetId ? 'Failed to update budget' : 'Failed to create budget'), 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (budget) => {
    // Pre-fill form with budget details
    setForm({
      amount: budget.amount,
      categoryId: budget.categoryId.toString(),
      startDate: budget.startDate.split('T')[0], // Remove time portion
      endDate: budget.endDate.split('T')[0]
    });
    
    // Set editing mode
    setEditingBudgetId(budget.id);
    
    // Scroll to form
    document.querySelector('.budget-form-container').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    try {
      setMessage({ text: 'Deleting budget...', type: 'info' });
      
      await axios.delete(`/budgets/${id}`);
      
      setMessage({ text: 'Budget deleted successfully!', type: 'success' });
      
      // Reset form if we were editing this budget
      if (editingBudgetId === id) {
        setForm({ amount: '', categoryId: '', startDate: '', endDate: '' });
        setEditingBudgetId(null);
      }
      
      // Refresh budgets list
      fetchBudgets();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Failed to delete budget:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to delete budget', 
        type: 'error' 
      });
    }
  };

  const cancelEdit = () => {
    // Reset form and editing state
    setForm({ amount: '', categoryId: '', startDate: '', endDate: '' });
    setEditingBudgetId(null);
    setMessage({ text: '', type: '' });
  };

  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

  const getSpent = (categoryId) => {
    return expenses
      .filter(e => e.categoryId === categoryId)
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  };

  // Clear message when user interacts with form
  const handleFormChange = (e) => {
    setMessage({ text: '', type: '' });
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="budget-page">
      <h1 className="budget-title">Total Budget: <span className="total-budget">${totalBudget.toFixed(2)}</span></h1>

      <div className="budget-form-container">
        <h2>{editingBudgetId ? 'Edit Budget' : 'Create New Budget'}</h2>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form className="budget-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount</label>
            <input 
              type="number" 
              name="amount"
              value={form.amount} 
              onChange={handleFormChange}
              placeholder="Budget amount"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select 
              name="categoryId"
              value={form.categoryId} 
              onChange={handleFormChange}
              required
              disabled={editingBudgetId !== null} // Can't change category when editing
            >
              <option value="">Select a category</option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {availableCategories.length === 0 && categories.length > 0 && !editingBudgetId && (
              <p className="helper-text">All categories already have budgets. Edit existing budgets instead.</p>
            )}
          </div>
          
          <div className="form-group">
            <label>Start Date</label>
            <input 
              type="date" 
              name="startDate"
              value={form.startDate} 
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>End Date</label>
            <input 
              type="date" 
              name="endDate"
              value={form.endDate} 
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="form-buttons">
            {editingBudgetId && (
              <button 
                type="button" 
                className="cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="budget-submit-btn"
              disabled={isSubmitting || (availableCategories.length === 0 && !editingBudgetId)}
            >
              {isSubmitting 
                ? (editingBudgetId ? 'Updating...' : 'Creating...') 
                : (editingBudgetId ? 'Update Budget' : 'Create Budget')
              }
            </button>
          </div>
        </form>
      </div>

      <div className="budget-section">
        <h2>Existing Budgets</h2>
        {budgets.length === 0 ? (
          <p className="empty-budget">No budgets created yet.</p>
        ) : (
          budgets.map((b) => {
            const spent = getSpent(b.categoryId);
            const remaining = Math.max(0, parseFloat(b.amount) - spent);
            const percent = Math.min(100, (spent / parseFloat(b.amount)) * 100);
            const categoryName = categories.find(c => c.id === b.categoryId)?.name || b.categoryName || 'Unknown Category';

            return (
              <div className="budget-card" key={b.id}>
                <div className="budget-main">
                  <span className="budget-category"><strong>{categoryName}</strong></span>
                  <span className="budget-amount">${parseFloat(b.amount).toFixed(2)}</span>
                </div>
                <div className="budget-meta">
                  <span>Spent: ${spent.toFixed(2)}</span>
                  <span>Remaining: ${remaining.toFixed(2)}</span>
                </div>
                <div className="budget-meta">
                  <span>Period: {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</span>
                  <span>{percent.toFixed(1)}% used</span>
                </div>
                <div className="budget-bar">
                  <div 
                    className="budget-bar-fill" 
                    style={{ 
                      width: `${percent}%`,
                      backgroundColor: percent > 100 ? '#e53935' : 
                                      percent > 75 ? '#ff9800' : 
                                      '#4caf50'
                    }}
                  ></div>
                </div>
                <div className="budget-actions">
                  <button 
                    className="edit-btn" 
                    onClick={() => handleEdit(b)}
                    disabled={editingBudgetId !== null}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(b.id)}
                    disabled={editingBudgetId !== null}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}