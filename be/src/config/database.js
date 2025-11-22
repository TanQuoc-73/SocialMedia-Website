const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Sử dụng MONGO_CONNECTIONSTRING từ .env hoặc fallback
        const mongoURI = process.env.MONGO_CONNECTIONSTRING || process.env.MONGODB_URI || 'mongodb://localhost:27017/socialmedia';

        const conn = await mongoose.connect(mongoURI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;