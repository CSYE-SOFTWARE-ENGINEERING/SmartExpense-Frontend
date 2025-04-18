const Expense = require("../models/ExpenseModel");

exports.addExpense = async (req, res) => {
  const { title, amount, category, description, date } = req.body;

  try {
    if (!title || !category || !description || !date) {
      return res.status(400).json({ message: 'All fields are required!' });
    }
    if (amount <= 0 || isNaN(Number(amount))) {
      return res.status(400).json({ message: 'Amount must be a positive number!' });
    }

    const expense = new Expense({
      title,
      amount,
      category,
      description,
      date,
      user: req.userId  // 
    });

    await expense.save();
    res.status(200).json({ message: 'Expense Added' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 
exports.getExpense = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Expense.findOneAndDelete({ _id: id, user: req.userId });

    if (!deleted) {
      return res.status(404).json({ message: 'Not found or not authorized' });
    }

    res.status(200).json({ message: 'Expense Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
