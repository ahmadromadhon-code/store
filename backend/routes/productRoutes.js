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
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.setHeader('Content-Type', 'application/json'); // **PENTING: Tambahkan ini**
    res.json(products);
  } catch (err) {
    handleError(res, err, 'Gagal mengambil produk');
  }
});

// POST new product with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, sizes = '' } = req.body;

    // Validasi input
    if (!name || !price) {
      return res.status(400).json({ error: 'Nama dan harga wajib diisi' });
    }

    const newProduct = new Product({
      name,
      price: parseFloat(price),
      description: description || '',
      image: req.file?.path || null,
      sizes: sizes ? sizes.split(',').map(size => size.trim()) : []
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct); // Biasanya JSON dikirim di sini

  } catch (err) {
    handleError(res, err, 'Gagal menambah produk');
  }
});

// PUT update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, sizes = '' } = req.body;

    const updateData = {
      name,
      price: parseFloat(price),
      description: description || '',
      sizes: sizes ? sizes.split(',').map(size => size.trim()) : []
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Produk tidak ditemukan' });
    }

    res.json(updated); // Biasanya JSON dikirim di sini
  } catch (err) {
    handleError(res, err, 'Gagal update produk');
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
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
