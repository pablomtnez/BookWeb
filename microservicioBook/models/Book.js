const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    favorites: { type: Boolean, default: false },
});

module.exports = mongoose.model("Book", BookSchema);
