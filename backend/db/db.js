

const mongoose = require('mongoose');

const db = async () => {
  try {
    mongoose.set("strictQuery", false);
    
    // ✅ 打印实际读取到的连接地址
    console.log("Connecting to MongoDB:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB Connection Error", error.message);
  }
};

module.exports = { db };


// const mongoose = require('mongoose');

// const db = async () => {
//     try {
//         mongoose.set("strictQuery", false);
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("MongoDB connected");
//     } catch (error) {
//         console.error("DB Connection Error", error.message);
//     }
// };

// module.exports = { db };

  