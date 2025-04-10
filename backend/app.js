require('dotenv').config();
console.log('Direktori Kerja:', __dirname);
console.log('Jalur ke app.js:', __filename);

// Tambahkan import yang diperlukan
const express = require('express');
const helmet = require('helmet'); // Tambahkan ini
const morgan = require('morgan'); // Tambahkan ini
const connectDB = require('./db');
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');
const path = require('path');

const app = express();

// 1. Koneksi Database
connectDB()
  .then(() => console.log('✅ Database Connected'))
  .catch(err => {
    console.error('❌ Database Connection Failed:', err);
    process.exit(1);
  });

// 2. Middleware
app.use(cors({
  origin: [
    'https://store-three-blond.vercel.app',
    'http://localhost:5000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());
app.use(helmet()); // Sekarang sudah terdefinisi
app.use(morgan('dev'));

// 3. API Routes
app.use('/api/products', productRoutes);

// 4. Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

// 5. Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 6. Error Handling
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Server Error'
  });
});

// 7. Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('🔥 Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});