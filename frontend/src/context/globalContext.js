import React, { useContext, useState } from "react";
import axios from '../utils/axiosClient'; 

const GlobalContext = React.createContext();

export const GlobalProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);

  const addIncome = async (income) => {
    try {
      await axios.post('/add-income', income);
      getIncomes();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const getIncomes = async () => {
    const response = await axios.get('/get-incomes');
    setIncomes(response.data);
  };

  const deleteIncome = async (id) => {
    await axios.delete(`/delete-income/${id}`);
    getIncomes();
  };

  const addExpense = async (expense) => {
    try {
      await axios.post('/add-expense', expense);
      getExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const getExpenses = async () => {
    const response = await axios.get('/get-expenses');
    setExpenses(response.data);
  };

  const deleteExpense = async (id) => {
    await axios.delete(`/delete-expense/${id}`);
    getExpenses();
  };

  const totalIncome = () =>
    incomes.reduce((acc, item) => acc + item.amount, 0);

  const totalExpenses = () =>
    expenses.reduce((acc, item) => acc + item.amount, 0);

  const totalBalance = () => totalIncome() - totalExpenses();

  const transactionHistory = () => {
    const history = [...incomes, ...expenses];
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return history.slice(0, 3);
  };

  return (
    <GlobalContext.Provider
      value={{
        addIncome,
        getIncomes,
        incomes,
        deleteIncome,
        expenses,
        totalIncome,
        addExpense,
        getExpenses,
        deleteExpense,
        totalExpenses,
        totalBalance,
        transactionHistory,
        error,
        setError,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);