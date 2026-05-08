const mongoose = require('mongoose');

const DEFAULT_DB_NAME = 'BOOKINGAPP';

const connectDB = async () => {
  try {
    const dbName = process.env.MONGO_DB_NAME || DEFAULT_DB_NAME;
    const conn = await mongoose.connect(process.env.MONGO_URI, { dbName });
    console.log(`MongoDB Connected: ${conn.connection.host} (database: ${conn.connection.name})`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;