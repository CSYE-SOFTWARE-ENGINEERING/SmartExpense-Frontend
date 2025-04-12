// const mongoose = require('mongoose');

// const db = async () => {
//     try {
//         mongoose.set('strictQuery', false)
//         await mongoose.connect(process.env.MONGO_URI)
//         console.log('Db Connected')
//     } catch (error) {
//         console.log('DB Connection Error',error.message);
//     }
// }

// module.exports = {db}

const mongoose = require('mongoose');

const db = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("DB Connection Error", error.message);
    }
};

module.exports = { db };

  