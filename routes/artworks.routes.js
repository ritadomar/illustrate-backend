const router = require('express').Router();
const Artwork = require('../models/Artwork.model');
const Artist = require('../models/User.model');
const Commission = require('../models/Commission.model');
const Tag = require('../models/Tag.model');
const mongoose = require('mongoose');
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
      // finding the artist
      const artist = await Artist.findById(artistId, 'rate -_id');

      // calculating artwork cost
      const cost = time * artist.rate;

      // TAGS CREATION
      if (tags.length > 0) {
        // find existing tags
        const findTags = await Tag.find({ tagName: tags });

        // adds all tags as new
        if (findTags.length === 0) {
          const tagName = [...tags].map(tag => {
            return { tagName: tag };
          });
          await Tag.create(tagName);
        } else {
          // filters the ones that are new
          const newTags = [...tags]
            .filter(tag => {
              const oldTags = findTags.map(tag => {
                return tag.tagName;
              });
              return oldTags.indexOf(tag) < 0;
            })
            .map(tag => {
              return { tagName: tag };
            });
          await Tag.create(newTags);
        }
      }

      // creating array to add tags to new artwork
      const artworkTagsArr = await Tag.find({ tagName: tags });
      const artworkTags = artworkTagsArr.map(tag => {
        return tag._id;
      });

      const newArtwork = await Artwork.create({
        title,
        description,
        artworkUrl,
        time,
        cost,
        artist: artistId,
        commissions,
        tags: artworkTags,
      });

      // adding new artwork to artist
      await Artist.findByIdAndUpdate(artistId, {
        $push: { artwork: newArtwork._id },
      });

      // adding new artwork to tags
      if (tags.length > 0) {
        await Tag.updateMany(
          { tagName: { $in: tags } },
          { $addToSet: { artwork: newArtwork._id } }
        );
      }

      // adding new artwork to commissions
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
    const allArtworks = await Artwork.find({}).populate(['artist', 'tags']);

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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const artwork = await Artwork.findById(id).populate([
      'commissions',
      'tags',
      'artist',
    ]);

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
router.put(
  '/artworks/:id',
  isAuthenticated,
  checkArtist,
  async (req, res, next) => {
    const { id } = req.params;
    const { title, description, artworkUrl, tags, time, commissions } =
      req.body;

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Id is not valid' });
      }

      // finding artist and rate
      const artistId = await Artwork.findById(id, 'artist -_id');
      const artist = await Artist.findById(artistId.artist, 'rate -_id');

      // calculating new cost if time was updated
      const cost = time * artist.rate;

      // CREATING TAGS
      if (tags.length > 0) {
        // find existing tags
        const findTags = await Tag.find({ tagName: tags });

        // adds all tags as new
        if (findTags.length === 0) {
          const tagName = [...tags].map(tag => {
            return { tagName: tag };
          });
          await Tag.create(tagName);
        } else {
          // filters the ones that are new
          const newTags = [...tags]
            .filter(tag => {
              const oldTags = findTags.map(tag => {
                return tag.tagName;
              });
              return oldTags.indexOf(tag) < 0;
            })
            .map(tag => {
              return { tagName: tag };
            });
          await Tag.create(newTags);
        }

        // UPDATING TAGS
        const artworkTagsArr = await Tag.find({ tagName: tags });
        const tagsId = artworkTagsArr.map(tag => {
          return tag._id;
        });

        await Tag.updateMany(
          { _id: { $nin: tagsId } },
          { $pull: { artwork: id } }
        );
        await Tag.updateMany(
          { _id: { $in: tagsId } },
          { $addToSet: { artwork: id } }
        );
      }

      // creating new tags array to send to updated artwork
      const artworkTagsArr = await Tag.find({ tagName: tags });
      const artworkTags = artworkTagsArr.map(tag => {
        return tag._id;
      });

      // updating commissions in case commission was added or removed from artwork
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
          tags: artworkTags,
          time,
          cost,
          commissions,
        },
        { new: true }
      ).populate(['commissions', 'tags']);

      // UPDATING COMMISSION COST
      if (time) {
        const artworkCommissions = await Commission.find(
          {
            exampleArtwork: id,
          },
          'exampleArtwork'
        ).populate('exampleArtwork');

        // const commissions
        const newCost = artworkCommissions.map(commission => {
          const artworkCost = commission.exampleArtwork.map(artwork => {
            console.log('cost', artwork.cost, typeof artwork.cost);
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
        // console.log(artworkCommissions);
      }

      if (!updatedArtwork) {
        return res.status(404).json({ message: 'Artwork not found' });
      }

      res.json(updatedArtwork);
    } catch (error) {
      console.log('An error ocurred updating the artwork', error);
      next(error);
    }
  }
);

router.delete(
  '/artworks/:id',
  isAuthenticated,
  checkArtist,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Id is not valid' });
      }
      const artist = await Artwork.findById(id, 'artist -_id');
      const artistId = artist.artist.toString();

      // delete from artist
      await Artist.findByIdAndUpdate(artistId, { $pull: { artwork: id } });

      // delete from commission
      await Commission.updateMany({ $pull: { exampleArtwork: id } });

      // delete from tags
      await Tag.updateMany({ $pull: { artwork: id } });

      // delete artwork
      await Artwork.findByIdAndDelete(id);

      res.json({ message: 'Artwork deleted successfully' });
    } catch (error) {
      console.log('An error occurred deleting the artwork', error);
      next(error);
    }
  }
);

module.exports = router;
