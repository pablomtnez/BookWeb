const mongoose = require('mongoose');
const config = require('config');

const connectDB = async () => {
    try {
        const dbURI = config.get('mongoURI');
        await mongoose.connect(dbURI); // Conexión sin opciones
        console.log('Conexión a MongoDB exitosa');
    } catch (err) {
        console.error('Error conectando a MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
