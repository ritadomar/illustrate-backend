const router = require('express').Router();
const User = require('../models/User.model');
const Artwork = require('../models/Artwork.model');
const Commission = require('../models/Commission.model');
const Request = require('../models/Request.model');
const mongoose = require('mongoose');
const fileUploader = require('../config/cloudinary.config');
const { isAuthenticated } = require('../middleware/jwt.middleware');

// Read one profile by id
router.get('/profile/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const user = await User.findById(id).populate(['artwork', 'commissions']);

    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'No user found' });
    }

    res.json(user);
  } catch (error) {
    console.log('An error ocurred getting the user', error);
    next(error);
  }
});

// Update profile by id
router.put('/profile/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const { name, avatarUrl, portfolio, isArtist, rate } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const updatedProfile = await User.findByIdAndUpdate(
      id,
      { name, avatarUrl, portfolio, isArtist, rate },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.json(updatedProfile);
  } catch (error) {
    console.log('An error ocurred updating the profile', error);
    next(error);
  }
});

router.delete('/profile/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    await User.findByIdAndDelete(id);

    await Commission.deleteMany({ artist: id });
    await Artwork.deleteMany({ artist: id });
    await Request.deleteMany({ artist: id });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.log('An error occurred deleting the account', error);
    next(error);
  }
});

// promise is handled by the middleware, we don't need async
// we're sending a status already, no need for next
router.post('/upload', fileUploader.single('file'), (req, res) => {
  try {
    res.status(200).json({ avatarUrl: req.file.path });
  } catch (error) {
    console.log('An error occurred uploading the image', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

module.exports = router;
