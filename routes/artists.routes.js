const router = require('express').Router();
const Artist = require('../models/User.model');

// Read all artists
router.get('/artists', async (req, res, next) => {
  console.log(req.headers);
  try {
    const allArtists = await Artist.find({ isArtist: true });

    console.log('All artists', allArtists);
    res.json(allArtists);
  } catch (error) {
    console.log('An error ocurred getting all artists', error);
    next(error);
  }
});

module.exports = router;
