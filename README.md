
# SmartExpense Frontend

This is the frontend part of the **SmartExpense** application — a personal finance tracker built to manage incomes, expenses, and transactions with a clean and intuitive interface.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

---

## 🚀 Features

- Responsive dashboard and navigation layout
- Add and view **Incomes**, **Expenses**, and **Transactions**
- Stylized UI with card-based design, clean spacing, and hover effects
- Connected to a Spring Boot-based backend API built with Java.

---

## 🛠️ Tech Stack

- **React** (via Vite)
- **Axios** – for making HTTP requests
- **CSS Modules** (individual `.css` files per page)
- **React Router DOM** – for multi-page routing

---

## ▶️ Getting Started

### 1. Install dependencies

```bash
npm install

2. Start the development server

npm run dev

Then visit: http://localhost:5173


🔌 Backend Integration
Ensure the backend server is running (Django API):

Base URL: http://localhost:8080/api

Endpoints used:

GET /api/income, POST /api/income, DELETE /api/income/:id

GET /api/expense, POST /api/expense, DELETE /api/expense/:id

GET /api/transaction

⚠️ If CORS issues occur, make sure the backend enables cross-origin requests.


📷 Pages
Dashboard – Overview of income/expense stats (optional)

Incomes – Add and view income records

Expenses – Add and view expense records

Transactions – View all records in a unified list

## 📝 License

This project is intended for academic, demonstration, and educational purposes only.  
Commercial use, distribution, or deployment in production environments is **not permitted** without prior permission from the authors or instructors.

Copyright © 2025 SmartExpense Team
