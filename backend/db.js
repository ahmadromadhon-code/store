const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Validasi connection string
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    // Options tambahan untuk koneksi yang lebih robust
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,  // Timeout lebih panjang (10 detik)
      socketTimeoutMS: 45000,
      maxPoolSize: 50,                 // Pool lebih besar untuk production
      retryWrites: true,
      w: 'majority'
    };

    console.log('⌛ Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}`);
    
    // Debugging info
    if (process.env.NODE_ENV === 'development') {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log('📂 Available Collections:', collections.map(c => c.name));
      console.log('🔗 Connection State:', mongoose.connection.readyState);
    }
    
    // Return connection untuk digunakan di tempat lain jika diperlukan
    return conn;
    
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    
    // Error detail untuk debugging
    console.error('Error Details:', {
      name: err.name,
      code: err.code,
      reason: err.reason?.message || err.reason,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    
    // Exit dengan error code
    process.exit(1);
  }
};

// Event listeners untuk monitoring koneksi
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose default connection is open');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ Mongoose default connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose default connection disconnected');
});

// Handle shutdown graceful
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}, closing MongoDB connection...`);
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err);
    process.exit(1);
  }
};

// Handle berbagai sinyal shutdown
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Untuk nodemon

module.exports = connectDB;