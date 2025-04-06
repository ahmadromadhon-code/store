const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,           // URL gambar
  imageDeleteHash: String, // Ini digunakan untuk hapus gambar dari Imgur
  sizes: [String]
});

module.exports = mongoose.model('Product', productSchema);
