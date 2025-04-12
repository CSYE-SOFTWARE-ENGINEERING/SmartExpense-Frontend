import React, { useContext, useState } from "react";
import axios from '../utils/axiosClient'; // ✅ 使用封装的 axios

const GlobalContext = React.createContext();

export const GlobalProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);

  const addIncome = async (income) => {
    try {
      await axios.post('/api/v1/add-income', income);
      getIncomes();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const getIncomes = async () => {
    const response = await axios.get('/api/v1/get-incomes');
    setIncomes(response.data);
  };

  const deleteIncome = async (id) => {
    await axios.delete(`/api/v1/delete-income/${id}`);
    getIncomes();
  };

  const addExpense = async (expense) => {
    try {
      await axios.post('/api/v1/add-expense', expense);
      getExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const getExpenses = async () => {
    const response = await axios.get('/api/v1/get-expenses');
    setExpenses(response.data);
  };

  const deleteExpense = async (id) => {
    await axios.delete(`/api/v1/delete-expense/${id}`);
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

// import React, { useContext, useState } from "react"
// import axios from '../utils/axiosClient';


// //Local
// // const BASE_URL = "http://localhost:5000/api/v1/";

// //Docker
// const BASE_URL = "http://backend:5000/api/v1/";



// const GlobalContext = React.createContext()

// export const GlobalProvider = ({children}) => {

//     const [incomes, setIncomes] = useState([])
//     const [expenses, setExpenses] = useState([])
//     const [error, setError] = useState(null)

//     //calculate incomes
//     const addIncome = async (income) => {
//         const response = await axios.post(`${BASE_URL}add-income`, income)
//             .catch((err) =>{
//                 setError(err.response.data.message)
//             })
//         getIncomes()
//     }

//     const getIncomes = async () => {
//         const response = await axios.get(`${BASE_URL}get-incomes`)
//         setIncomes(response.data)
//         console.log(response.data)
//     }

//     const deleteIncome = async (id) => {
//         const res  = await axios.delete(`${BASE_URL}delete-income/${id}`)
//         getIncomes()
//     }

//     const totalIncome = () => {
//         let totalIncome = 0;
//         incomes.forEach((income) =>{
//             totalIncome = totalIncome + income.amount
//         })

//         return totalIncome;
//     }


//     //calculate incomes
//     const addExpense = async (income) => {
//         const response = await axios.post(`${BASE_URL}add-expense`, income)
//             .catch((err) =>{
//                 setError(err.response.data.message)
//             })
//         getExpenses()
//     }

//     const getExpenses = async () => {
//         const response = await axios.get(`${BASE_URL}get-expenses`)
//         setExpenses(response.data)
//         console.log(response.data)
//     }

//     const deleteExpense = async (id) => {
//         const res  = await axios.delete(`${BASE_URL}delete-expense/${id}`)
//         getExpenses()
//     }

//     const totalExpenses = () => {
//         let totalIncome = 0;
//         expenses.forEach((income) =>{
//             totalIncome = totalIncome + income.amount
//         })

//         return totalIncome;
//     }


//     const totalBalance = () => {
//         return totalIncome() - totalExpenses()
//     }

//     const transactionHistory = () => {
//         const history = [...incomes, ...expenses]
//         history.sort((a, b) => {
//             return new Date(b.createdAt) - new Date(a.createdAt)
//         })

//         return history.slice(0, 3)
//     }


//     return (
//         <GlobalContext.Provider value={{
//             addIncome,
//             getIncomes,
//             incomes,
//             deleteIncome,
//             expenses,
//             totalIncome,
//             addExpense,
//             getExpenses,
//             deleteExpense,
//             totalExpenses,
//             totalBalance,
//             transactionHistory,
//             error,
//             setError
//         }}>
//             {children}
//         </GlobalContext.Provider>
//     )
// }

// export const useGlobalContext = () =>{
//     return useContext(GlobalContext)
// }