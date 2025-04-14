
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import LoginPage from './pages/LoginPage'
import TransactionsPage from './pages/TransactionsPage'
import IncomesPage from './pages/IncomesPage'
import ExpensesPage from './pages/ExpensesPage'
import BudgetsPage from './pages/BudgetsPage'
import WalletsPage from './pages/WalletsPage'

export default function App() {
  const isLoggedIn = true // TODO: Replace with real auth logic

  return (
    <Router>
      {isLoggedIn ? (
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/incomes" element={<IncomesPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/wallets" element={<WalletsPage />} />
          </Routes>
        </div>
      ) : (
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      )}
    </Router>
  )
}
