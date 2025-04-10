const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { upload } = require('../config/cloudinary');
const mongoose = require('mongoose');

// Helper untuk error handling
const handleError = (res, err, defaultMessage = 'Terjadi kesalahan') => {
  console.error('❌ Error:', err);

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: 'Validasi gagal',
      details: err.errors
    });
  }

  if (err.name === 'MongoServerError') {
    return res.status(400).json({
      error: 'Database error',
      details: err.message
    });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : defaultMessage
  });
};

// GET all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}); // .lean() dihapus kecuali benar-benar perlu
    
    // Debugging: Log hasil query
    console.log('Products found:', products.length);
    
    // Pastikan products adalah array
    if (!Array.isArray(products)) {
      throw new Error('Hasil query bukan array');
    }
    
    // Response final
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
    
  } catch (err) {
    console.error('Error in /api/products:', err);
    
    // Error response lebih informatif
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// POST new product with image upload
router.post('/products', async (req, res) => { // upload.single('image') DIHAPUS
  try {
    console.log('📦 BODY JSON YANG DITERIMA:', req.body); // Body sekarang JSON
    const { name, price, description, sizes = '', image } = req.body; // Ambil 'image' dari body

    // Validasi input
    if (!name || !price) {
      return res.status(400).json({ error: 'Nama dan harga wajib diisi' });
    }

    const newProduct = new Product({
      name,
      price: parseFloat(price),
      description: description || '',
      image: image || null, // Gunakan URL dari req.body
      sizes: sizes ? sizes.split(',').map(size => size.trim()) : []
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    handleError(res, err, 'Gagal menambah produk');
  }
});

// PUT update product
router.put('/products/:id', async (req, res) => { // upload.single('image') DIHAPUS
  try {
    console.log('📦 BODY JSON YANG DITERIMA:', req.body); // Body sekarang JSON
    const { name, price, description, sizes = '', image } = req.body; // Ambil 'image' dari body

    const updateData = {
      name,
      price: parseFloat(price),
      description: description || '',
      sizes: sizes ? sizes.split(',').map(size => size.trim()) : []
    };

   if (req.body.hasOwnProperty('image')) { // Lebih eksplisit: cek jika properti 'image' ada
       updateData.image = image; // Bisa URL atau null
    }
    // Jika properti 'image' tidak ada di req.body, field image di DB tidak akan diubah

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    res.json(updated);
  } catch (err) {
    handleError(res, err, 'Gagal update produk');
  }
});
// DELETE product
router.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    res.json({
      message: 'Produk berhasil dihapus',
      deletedId: deleted._id
    });
  } catch (err) {
    handleError(res, err, 'Gagal menghapus produk');
  }
});

module.exports = router;
