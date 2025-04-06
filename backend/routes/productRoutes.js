const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { upload } = require('../config/cloudinary');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil produk' });
  }
});

// POST new product with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, sizes } = req.body;
    const image = req.file?.path || '';

    const newProduct = new Product({
      name,
      price,
      description,
      image,
      sizes: sizes.split(',').map(size => size.trim())
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambah produk' });
  }
});

// PUT update product (with optional image)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, sizes } = req.body;

    const updateData = {
      name,
      price,
      description,
      sizes: sizes.split(',').map(size => size.trim())
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal update produk' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus produk' });
  }
});

module.exports = router;
