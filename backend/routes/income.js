const express = require('express');
const { addIncome, getIncomes, deleteIncome } = require('../controllers/income');

const router = express.Router();

router.post('/add-income', addIncome);
router.get('/get-incomes', getIncomes);
router.delete('/delete-income/:id', deleteIncome);

module.exports = router;
