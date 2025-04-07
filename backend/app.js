require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./db');
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');
const path = require('path');

// 1. Koneksi Database
connectDB(process.env.MONGODB_URI).catch(err => {
  console.error('Database connection failed:', err);
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

// 3. API Routes (SEBELUM static files)
app.use('/api', productRoutes);

// 4. Static Files
app.use(express.static(path.join(__dirname, '../../frontend')));

// 5. Fallback (SETELAH static)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// 6. Error Handling
app.use((err, req, res, next) => {
  console.error('⚠️ Error:', err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Server Error' 
  });
});

// 7. Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => 
  console.log(`🚀 Server running on port ${PORT}`)
);

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});