const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// 注册
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: "用户名已存在" });

    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "注册成功" });
  } catch (err) {
    res.status(500).json({ message: "服务器错误", error: err.message });
  }
});

// 登录
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "用户不存在" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "密码错误" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "登录失败", error: err.message });
  }
});

module.exports = router;
