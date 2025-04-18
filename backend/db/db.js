

const mongoose = require('mongoose');

const db = async () => {
  try {
    mongoose.set("strictQuery", false);
    console.log("Connecting to MongoDB:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB Connection Error", error.message);
  }
};

module.exports = { db };


  