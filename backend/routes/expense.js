// const express = require('express');
// const { addExpense, getExpense, deleteExpense } = require('../controllers/expense');

// const router = express.Router();

// router.post('/add-expense', addExpense);
// router.get('/get-expenses', getExpense);
// router.delete('/delete-expense/:id', deleteExpense);

// module.exports = router;

const express = require('express');
const { addExpense, getExpense, deleteExpense } = require('../controllers/expense');
const auth = require('../middleware/auth'); // ✅ 加载中间件

const router = express.Router();

router.post('/add-expense', auth, addExpense);
router.get('/get-expenses', auth, getExpense);
router.delete('/delete-expense/:id', auth, deleteExpense);

module.exports = router;
