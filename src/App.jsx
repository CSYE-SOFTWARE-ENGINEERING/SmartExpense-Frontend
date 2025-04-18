import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TransactionsPage from './pages/TransactionsPage';
import IncomesPage from './pages/IncomesPage';
import ExpensesPage from './pages/ExpensesPage';
import BudgetsPage from './pages/BudgetsPage';
import WalletsPage from './pages/WalletsPage';
import Register from './Register'; // <-- this is your new Register page

function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('token');
  return isLoggedIn ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} /> {/* ✅ Add this line */}
        <Route
          path="/register"
          element={<RegisterPage />}
        />
        <Route
          path="/*"
          element={
            <PrivateRoute>
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
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
