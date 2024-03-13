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

// Read one tag by id
router.get('/tags/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // check if id is a valid value in our db
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const tag = await Tag.findById(id).populate(['commissions', 'artwork']);

    if (!tag) {
      return res.status(404).json({ message: 'No tag found' });
    }
    res.json(tag);
  } catch (error) {
    console.log('An error ocurred getting the tag', error);
    next(error);
  }
});

module.exports = router;
