// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: 'dcza1lxj0',
  api_key: '171896374985787',
  api_secret: 'S8dlDn7Wg_C4QbYLC2vsYUGTaKk'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce-products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
