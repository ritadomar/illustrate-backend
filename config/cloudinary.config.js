const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// we get this from the cloudinary website.
// we will store them on .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    allowed_formats: ['jpg', 'png', 'gif', 'tiff', 'jpeg', 'svg'],
    folder: 'illustrate', // name of folder in cloudinary
    format: 'auto',
    quality: 'auto',
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' },
      { height: 2000 },
      { width: 2000 },
      { crop: 'limit' },
    ],
  },
});

module.exports = multer({ storage });
