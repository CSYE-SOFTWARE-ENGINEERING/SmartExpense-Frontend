const Income = require("../models/IncomeModel"); // ✅ 正确命名模型

// 添加收入
exports.addIncome = async (req, res) => {
    const { title, amount, category, description, date } = req.body;

    try {
        // 验证字段是否填写完整
        if (!title || !category || !description || !date) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        if (amount <= 0 || typeof amount !== 'number') {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }

        const income = new Income({
            title,
            amount,
            category,
            description,
            date,
        });

        await income.save();
        console.log("✅ Income saved:", income);
        res.status(200).json({ message: 'Income Added' });

    } catch (error) {
        console.error("❌ Error adding income:", error.message);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 获取所有收入
exports.getIncomes = async (req, res) => {
    try {
        console.log("🟢 getIncomes - start", new Date());
        const incomes = await Income.find().sort({ createdAt: -1 });
        console.log("✅ getIncomes - data fetched:", incomes);
        res.status(200).json(incomes);
    } catch (error) {
        console.error("❌ getIncomes error:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 删除收入
exports.deleteIncome = async (req, res) => {
    const { id } = req.params;

    try {
        await Income.findByIdAndDelete(id);
        console.log("🗑️ Income deleted:", id);
        res.status(200).json({ message: 'Income Deleted' });
    } catch (error) {
        console.error("❌ deleteIncome error:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
