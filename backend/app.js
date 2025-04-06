require('dotenv').config();

const express = require('express');
const app = express();
const connectDB = require('./db');
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');
const path = require('path');

// Koneksi Database
connectDB(process.env.MONGODB_URI);  // Pastikan nama variabel sesuai

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://store-three-blond.vercel.app' 
    : 'http://localhost:3000'
}));
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));