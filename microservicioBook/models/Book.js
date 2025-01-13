const mongoose = require("mongoose");

// Esquema del Libro
const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          // Validar formato del ISBN-10 o ISBN-13
          return /^[0-9]{10}$|^[0-9]{13}$/.test(v);
        },
        message: (props) => `${props.value} no es un ISBN válido.`,
      },
    },
    favorites: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Agregar createdAt y updatedAt automáticamente
  }
);

// Índices para mejorar rendimiento
BookSchema.index({ title: "text", author: "text" });

// Métodos estáticos
BookSchema.statics.findByTitle = function (title) {
  return this.find({ title: new RegExp(title, "i") }); // Búsqueda insensible a mayúsculas
};

BookSchema.statics.findByAuthor = function (author) {
  return this.find({ author: new RegExp(author, "i") });
};

// Exportar el modelo
module.exports = mongoose.model("Book", BookSchema);
