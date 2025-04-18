const Income = require("../models/IncomeModel");

// 添加收入（绑定 userId）
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
      date,
      user: req.userId  // 绑定当前用户
    });

    await income.save();

    res.status(200).json({ message: 'Income Added' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 获取当前用户的所有收入
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 只允许删除当前用户的收入
exports.deleteIncome = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Income.findOneAndDelete({ _id: id, user: req.userId });

    if (!deleted) {
      return res.status(404).json({ message: 'Not found or not authorized' });
    }

    res.status(200).json({ message: 'Income Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
