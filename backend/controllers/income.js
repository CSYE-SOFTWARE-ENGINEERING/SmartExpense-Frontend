const Income = require("../models/IncomeModel");

// Add
exports.addIncome = async (req, res) => {
  const { title, amount, category, description, date } = req.body;

  try {
    if (!title || !category || !description || !date) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    if (amount <= 0 || isNaN(Number(amount))) {
      return res.status(400).json({ message: 'Amount must be a positive number!' });
    }

    const income = new Income({
      title,
      amount,
      category,
      description,
      date
    });

    await income.save();

    res.status(200).json({ message: 'Income Added' });
  } catch (error) {

    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find().sort({ createdAt: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


exports.deleteIncome = async (req, res) => {
  const { id } = req.params;
  try {
    await Income.findByIdAndDelete(id);
    res.status(200).json({ message: 'Income Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
