const express = require('express');
const app = express();
const connectDB = require('./db');
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');
const path = require('path');

// Koneksi ke MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Penting untuk bisa baca body JSON!

// Routing API
app.use('/api/products', productRoutes);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// Redirect / ke index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
