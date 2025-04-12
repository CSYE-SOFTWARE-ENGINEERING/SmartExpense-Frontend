const Expense = require("../models/ExpenseModel"); // ✅ 正确导入模型

// 添加支出
exports.addExpense = async (req, res) => {
    const { title, amount, category, description, date } = req.body;

    try {
        // 验证字段
        if (!title || !category || !description || !date) {
            return res.status(400).json({ message: 'All fields are required!' });
        }
        if (amount <= 0 || typeof amount !== 'number') {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }

        const expense = new Expense({
            title,
            amount,
            category,
            description,
            date
        });

        await expense.save();
        console.log("✅ Expense saved:", expense);
        res.status(200).json({ message: 'Expense Added' });
    } catch (error) {
        console.error("❌ Error adding expense:", error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 获取支出列表
exports.getExpense = async (req, res) => {
    try {
        console.log("🟢 getExpense - start", new Date());
        const expenses = await Expense.find().sort({ createdAt: -1 });
        console.log("✅ Expenses fetched:", expenses);
        res.status(200).json(expenses);
    } catch (error) {
        console.error("❌ getExpense error:", error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 删除支出
exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        await Expense.findByIdAndDelete(id);
        console.log("🗑️ Expense deleted:", id);
        res.status(200).json({ message: 'Expense Deleted' });
    } catch (error) {
        console.error("❌ deleteExpense error:", error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
