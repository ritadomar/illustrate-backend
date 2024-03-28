const router = require('express').Router();
const Tag = require('../models/Tag.model');
const mongoose = require('mongoose');

// Read all tags
router.get('/tags', async (req, res, next) => {
  try {
    const allTags = await Tag.find({}).populate(['artwork', 'commissions']);

    res.json(allTags);
  } catch (error) {
    console.log('An error ocurred getting all tags', error);
    next(error);
  }
});

// Read one tag by name
router.get('/tags/:tagName', async (req, res, next) => {
  const { tagName } = req.params;

  try {
    const tag = await Tag.findOne({ tagName });

    // check if id is a valid value in our db
    if (!mongoose.Types.ObjectId.isValid(tag._id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    if (!tag || tag.length === 0) {
      return res.status(404).json({ message: 'No tag found' });
    }
    res.json(tag);
  } catch (error) {
    console.log('An error ocurred getting the tag', error);
    next(error);
  }
});

module.exports = router;
