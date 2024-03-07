const router = require('express').Router();
const fileUploader = require('../config/cloudinary.config');

// promise is handled by the middleware, we don't need async
// we're sending a status already, no need for next
router.post('/upload', fileUploader.single('file'), (req, res) => {
  try {
    res.status(200).json({ imgUrl: req.file.path });
  } catch (error) {
    console.log('An error occurred uploading the image', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

module.exports = router;
