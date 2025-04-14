
import React from 'react'
import './Dashboard.css'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'

const data = [
  { name: '01/04/2025', income: 5000, expense: 800 },
  { name: '08/04/2025', income: 4000, expense: 600 },
  { name: '15/04/2025', income: 4800, expense: 900 },
  { name: '22/04/2025', income: 4900, expense: 1000 },
]

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h2>All Transactions</h2>
      <div className="chart">
        <LineChart width={500} height={250} data={data}>
          <Line type="monotone" dataKey="income" stroke="green" />
          <Line type="monotone" dataKey="expense" stroke="red" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
        </LineChart>
      </div>
      <div className="summary">
        <div className="card income">Total Income<br /><b>$16290</b></div>
        <div className="card expense">Total Expense<br /><b>$2480</b></div>
        <div className="card balance">Total Balance<br /><b>$13810</b></div>
      </div>
    </div>
  )
}
