
import React from 'react'
import { Link } from 'react-router-dom'
import './Sidebar.css'

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="profile">
        <img src="https://i.pravatar.cc/100" alt="User" />
        <h3>Mike</h3>
        <p>Your Money</p>
      </div>
      <nav>
        <ul>
          <li><Link to="/">📊 Dashboard</Link></li>
          <li><Link to="/transactions">📄 Transactions</Link></li>
          <li><Link to="/incomes">💰 Incomes</Link></li>
          <li><Link to="/expenses">💸 Expenses</Link></li>
          <li><Link to="/budgets">📈 Budgets</Link></li>
          <li><Link to="/wallets">👛 Wallets</Link></li>
          <li><Link to="/login">🔐 Login</Link></li>
        </ul>
      </nav>
      <div className="signout">↩ Sign Out</div>
    </div>
  )
}
