const mongoose = require("mongoose");

const connectDB = async () => {
  const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/bookweb"; // URI de la base de datos

  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true, // Usa el nuevo analizador de URL
      useUnifiedTopology: true, // Usa el nuevo motor de topología unificada
      useCreateIndex: true, // Crea índices automáticamente
      useFindAndModify: false, // Usa findOneAndUpdate en lugar de findAndModify
    });
    console.log("✅ Conexión a MongoDB exitosa");
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err.message);
    console.error("Reintentando conexión en 5 segundos...");
    setTimeout(connectDB, 5000); // Reintentar conexión después de 5 segundos
  }
};

module.exports = connectDB;
