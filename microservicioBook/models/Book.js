const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String },
    isbn: { type: String },
    publishedDate: { type: Date },
    favorites: { type: Boolean, default: false },
});

module.exports = mongoose.model('Book', BookSchema);
