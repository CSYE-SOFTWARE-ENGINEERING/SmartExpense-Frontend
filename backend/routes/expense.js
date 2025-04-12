const express = require('express');
const { addExpense, getExpense, deleteExpense } = require('../controllers/expense');

const router = express.Router();

router.post('/add-expense', addExpense);
router.get('/get-expenses', getExpense);
router.delete('/delete-expense/:id', deleteExpense);

module.exports = router;
