const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    };

    console.log('⌛ Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    // Perbaikan logging
    console.log(`✅ MongoDB Connected to: ${conn.connection.host || 'localhost'}`);
    console.log(`📦 Database Name: ${conn.connection.name || 'default'}`);

    return conn;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('Error Code:', err.code);
    console.error('Error Stack:', err.stack);
    process.exit(1);
  }
};

// Event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = connectDB;