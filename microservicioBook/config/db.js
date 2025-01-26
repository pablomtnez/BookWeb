const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI || "mongodb://localhost:27017/booksDB");
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  }catch (error) {
      console.error(`Error conectando a MongoDB: ${error.message}`);
      console.error(`Detalles del error:`, error);
      process.exit(1);
    }
  };

module.exports = connectDB;
