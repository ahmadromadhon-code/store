const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { upload } = require('../config/cloudinary');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator'); // Tambah: express-validator
const logger = require('../config/logger'); // Tambah: logging

// Helper untuk error handling
const handleError = (res, err, defaultMessage = 'Terjadi kesalahan') => {
    console.error('❌ Error:', err);
    logger.error({ message: defaultMessage, error: err }); // Tambah: logging

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

// GET all products (dengan paginasi)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .lean()
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            products,
            totalProducts,
            currentPage: page,
            totalPages,
            limit
        });

    } catch (err) {
        handleError(res, err, 'Gagal mengambil produk');
    }
});

// Validator untuk produk
const productValidator = [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi').isLength({ max: 255 }).withMessage('Nama maksimal 255 karakter').escape(), // Sanitasi & Validasi
    body('price').isFloat({ min: 0 }).withMessage('Harga harus lebih besar dari atau sama dengan 0').toFloat(), // Convert to float
    body('description').trim().escape(), // Sanitasi
    body('sizes').optional().isArray().withMessage('Ukuran harus berupa array') // Opsional & validasi array
];

// POST new product dengan image upload
router.post('/', upload.single('image'), productValidator, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, price, description, sizes = [] } = req.body;

        const newProduct = new Product({
            name,
            price,
            description,
            image: req.file ? req.file.path : null, // Perbaikan: Cek eksistensi file
            sizes: sizes.map(size => String(size).trim())
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (err) {
        handleError(res, err, 'Gagal menambah produk');
    }
});

// PUT update product
router.put('/:id', upload.single('image'), productValidator, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, price, description, sizes = [] } = req.body;

        const updateData = {
            name,
            price,
            description,
            sizes: sizes.map(size => String(size).trim())
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

        res.json(updated);

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
