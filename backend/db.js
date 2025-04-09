const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Gunakan environment variable untuk connection string
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/baju', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,  // Timeout setelah 5 detik
      socketTimeoutMS: 45000,         // Socket timeout 45 detik
      maxPoolSize: 10                 // Connection pool maksimal
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Debugging: Tampilkan daftar collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📂 Available Collections:', collections.map(c => c.name));
    
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    
    // Log error detail di development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full Error Stack:', err.stack);
      console.error('Connection URI:', process.env.MONGODB_URI);
    }
    
    process.exit(1); // Exit dengan error code
  }
};

// Handle shutdown graceful
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;