const router = require('express').Router();
const Artwork = require('../models/Artwork.model');
const Artist = require('../models/User.model');
const Commission = require('../models/Commission.model');
const mongoose = require('mongoose');
const fileUploader = require('../config/cloudinary.config');
const { checkArtist } = require('../middleware/artistCheck.middleware');
const { isAuthenticated } = require('../middleware/jwt.middleware');

// Create a new artwork
router.post(
  '/artworks',
  isAuthenticated,
  checkArtist,
  async (req, res, next) => {
    const {
      title,
      description,
      artworkUrl,
      tags,
      time,
      artistId,
      commissions,
    } = req.body;

    try {
      const artist = await Artist.findById(artistId, 'rate -_id');

      console.log(artist, artist.rate);
      const cost = time * artist.rate;

      const newArtwork = await Artwork.create({
        title,
        description,
        artworkUrl,
        tags,
        time,
        cost,
        artist: artistId,
        commissions,
      });

      await Artist.findByIdAndUpdate(artistId, {
        // Mongo syntax to .push()
        // $push: {name of property we are pushing to: what we are pushing}
        $push: { artwork: newArtwork._id },
      });

      if (commissions) {
        await Commission.updateMany(
          { _id: { $in: commissions } },
          { $addToSet: { exampleArtwork: newArtwork._id } }
        );
      }

      console.log('New artwork', newArtwork);
      res.status(201).json(newArtwork);
    } catch (error) {
      console.log('An error ocurred creating the artwork', error);
      next(error);
    }
  }
);

// Read all artworks
router.get('/artworks', async (req, res, next) => {
  try {
    const allArtworks = await Artwork.find({});

    console.log('All artworks', allArtworks);
    res.json(allArtworks);
  } catch (error) {
    console.log('An error ocurred getting all artworks', error);
    next(error);
  }
});

// Read one artwork by id
router.get('/artworks/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // check if id is a valid value in our db
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const artwork = await Artwork.findById(id).populate('commissions');

    if (!artwork) {
      return res.status(404).json({ message: 'No artwork found' });
    }
    res.json(artwork);
  } catch (error) {
    console.log('An error ocurred getting the artwork', error);
    next(error);
  }
});

// Update artwork by id
router.put('/artworks/:id', async (req, res, next) => {
  const { id } = req.params;
  const { title, description, artworkUrl, tags, time, commissions } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const artistId = await Artwork.findById(id, 'artist -_id');
    const artist = await Artist.findById(artistId.artist, 'rate -_id');

    const cost = time * artist.rate;

    if (commissions) {
      await Commission.updateMany(
        { _id: { $nin: commissions } },
        { $pull: { exampleArtwork: id } }
      );
      await Commission.updateMany(
        { _id: { $in: commissions } },
        { $addToSet: { exampleArtwork: id } }
      );
    }

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      id,
      {
        title,
        description,
        artworkUrl,
        tags,
        time,
        cost,
        commissions,
      },
      { new: true }
    ).populate('commissions');

    if (!updatedArtwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }

    res.json(updatedArtwork);
  } catch (error) {
    console.log('An error ocurred updating the artwork', error);
    next(error);
  }
});

router.delete('/artworks/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    // delete from artist
    const artist = await Artwork.findById(id, 'artist -_id');
    const artistId = artist.artist.toString();
    await Artist.findByIdAndUpdate(artistId, { $pull: { artwork: id } });

    // delete from commission
    await Commission.updateMany({ $pull: { exampleArtwork: id } });

    await Artwork.findByIdAndDelete(id);

    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.log('An error occurred deleting the artwork', error);
    next(error);
  }
});

// promise is handled by the middleware, we don't need async
// we're sending a status already, no need for next
router.post('/upload', fileUploader.single('file'), (req, res) => {
  try {
    res.status(200).json({ artworkUrl: req.file.path });
  } catch (error) {
    console.log('An error occurred uploading the image', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

module.exports = router;
