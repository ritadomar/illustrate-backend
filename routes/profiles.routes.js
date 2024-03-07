const router = require('express').Router();
const User = require('../models/User.model');
const Artwork = require('../models/Artwork.model');
const Commission = require('../models/Commission.model');
const Request = require('../models/Request.model');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../middleware/jwt.middleware');

// Read one profile by id
router.get('/profiles/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const user = await User.findById(id).populate([
      'artwork',
      'commissions',
      'ratings',
    ]);

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
router.put('/profiles/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  const { name, avatarUrl, portfolio, isArtist, rate } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const hasUploads = await User.findById(id, 'artwork commissions -_id');
    if (hasUploads.artwork.length > 0) {
      await Artwork.updateMany({ artist: id }, [
        { $set: { cost: { $multiply: [{ $toDecimal: '$time' }, rate] } } },
      ]);
    }

    if (hasUploads.commissions.length > 0) {
      const artistCommissions = await Commission.find({ artist: id }).populate(
        'exampleArtwork'
      );

      const newCost = artistCommissions.map(commission => {
        const artworkCost = commission.exampleArtwork.map(artwork => {
          return artwork.cost;
        });
        const cost =
          artworkCost.reduce((acc, cur) => {
            return acc + cur;
          }) / artworkCost.length;
        return { id: commission._id, cost };
      });

      const updateCost = newCost.map(commission => {
        return Commission.findByIdAndUpdate(commission.id, {
          cost: commission.cost,
        });
      });

      await Promise.all(updateCost);
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

router.delete('/profiles/:id', isAuthenticated, async (req, res, next) => {
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

module.exports = router;
