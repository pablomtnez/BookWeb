const mongoose = require("mongoose");

const connectDB = async () => {
  const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/bookweb";

  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conexión a MongoDB exitosa");
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err.message);
    console.error("Reintentando conexión en 5 segundos...");
    setTimeout(connectDB, 5000); // Reintentar conexión después de 5 segundos
  }
};

module.exports = connectDB;
