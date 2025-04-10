const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama produk wajib diisi'],
    trim: true,
    maxlength: [100, 'Nama produk maksimal 100 karakter']
  },
  price: {
    type: Number,
    required: [true, 'Harga produk wajib diisi'],
    min: [1000, 'Harga minimal Rp 1.000'],
    max: [100000000, 'Harga maksimal Rp 100.000.000']
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Deskripsi maksimal 1000 karakter']
  },
 image: {
  type: String,
  validate: {
    validator: function (v) {
      // Izinkan kosong/null, tapi validasi jika ada nilai
      if (!v) return true;
      return /^(https?:\/\/).+\.(jpg|jpeg|png|webp)$/i.test(v);
    },
    message: props => `${props.value} bukan URL gambar yang valid!`
  }
}

  },
  imageDeleteHash: {
    type: String,
    select: false // Tidak ditampilkan di response default
  },
  sizes: {
    type: [String],
    enum: {
      values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      message: 'Ukuran {VALUE} tidak valid'
    },
    default: ['M']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Auto manage createdAt/updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index untuk pencarian lebih cepat
productSchema.index({ name: 'text', description: 'text' });

// Middleware sebelum save
productSchema.pre('save', function(next) {
  console.log(`Menyimpan produk: ${this.name}`);
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
