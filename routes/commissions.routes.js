const router = require('express').Router();
const Artwork = require('../models/Artwork.model');
const Artist = require('../models/User.model');
const Tag = require('../models/Tag.model');
const Commission = require('../models/Commission.model');
const mongoose = require('mongoose');
const { checkArtist } = require('../middleware/artistCheck.middleware');
const { isAuthenticated } = require('../middleware/jwt.middleware');

// Create a new commission
router.post(
  '/commissions',
  isAuthenticated,
  checkArtist,
  async (req, res, next) => {
    const { title, description, tags, exampleArtwork, artistId } = req.body;

    try {
      // calculating commission cost
      const costArray = await Artwork.find(
        { _id: { $in: exampleArtwork } },
        'cost -_id'
      );

      const cost =
        costArray.reduce((acc, cur) => {
          return acc + cur.cost;
        }, 0) / costArray.length;

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

      // creating array to add tags to new commission
      const commissionTagsArr = await Tag.find({ tagName: tags });
      const commissionTags = commissionTagsArr.map(tag => {
        return tag._id;
      });

      const newCommission = await Commission.create({
        title,
        description,
        tags: commissionTags,
        exampleArtwork,
        cost,
        artist: artistId,
      });

      // adding new commission to artist
      await Artist.findByIdAndUpdate(artistId, {
        $push: { commissions: newCommission._id },
      });

      // adding new commission to tags
      if (tags.length > 0) {
        await Tag.updateMany(
          { tagName: { $in: tags } },
          { $addToSet: { commissions: newCommission._id } }
        );
      }

      // adding new commission to artwork
      if (exampleArtwork) {
        await Artwork.updateMany(
          { _id: { $in: exampleArtwork } },
          { $addToSet: { commissions: newCommission._id } }
        );
      }

      console.log('New commission', newCommission);
      //   res.status(201).json({ message: 'Successful' });
      res.status(201).json(newCommission);
    } catch (error) {
      console.log('An error ocurred creating the artwork', error);
      next(error);
    }
  }
);

// Read all commissions
router.get('/commissions', async (req, res, next) => {
  try {
    const allCommissions = await Commission.find({});

    console.log('All commissions', allCommissions);
    res.json(allCommissions);
  } catch (error) {
    console.log('An error ocurred getting all artworks', error);
    next(error);
  }
});

// Read one commission by id
router.get('/commissions/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // check if id is a valid value in our db
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const commission = await Commission.findById(id).populate([
      'exampleArtwork',
      'tags',
      'artist',
    ]);

    if (!commission) {
      return res.status(404).json({ message: 'No commission found' });
    }
    res.json(commission);
  } catch (error) {
    console.log('An error ocurred getting the commission', error);
    next(error);
  }
});

// Update commission by id
router.put(
  '/commissions/:id',
  isAuthenticated,
  checkArtist,
  async (req, res, next) => {
    const { id } = req.params;
    const { title, description, tags, exampleArtwork, artistId } = req.body;

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Id is not valid' });
      }

      // calculating new cost if time was updated
      let cost;
      if (exampleArtwork.length > 0) {
        const costArray = await Artwork.find(
          { _id: { $in: exampleArtwork } },
          'cost -_id'
        );
        cost =
          costArray.reduce((acc, cur) => {
            return acc + cur.cost;
          }, 0) / costArray.length;
      } else {
        cost = 0;
      }
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
        const commissionTagsArr = await Tag.find({ tagName: tags });
        const tagsId = commissionTagsArr.map(tag => {
          return tag._id;
        });

        await Tag.updateMany(
          { _id: { $nin: tagsId } },
          { $pull: { commissions: id } }
        );
        await Tag.updateMany(
          { _id: { $in: tagsId } },
          { $addToSet: { commissions: id } }
        );
      }

      // creating new tags array to send to updated commission
      const commissionTagsArr = await Tag.find({ tagName: tags });
      const commissionTags = commissionTagsArr.map(tag => {
        return tag._id;
      });

      // updating artwork in case artwork was added or removed from commission
      if (exampleArtwork) {
        await Artwork.updateMany(
          { _id: { $nin: exampleArtwork } },
          { $pull: { commissions: id } }
        );
        await Artwork.updateMany(
          { _id: { $in: exampleArtwork } },
          { $addToSet: { commissions: id } }
        );
      }

      const updatedCommission = await Commission.findByIdAndUpdate(
        id,
        {
          title,
          description,
          tags: commissionTags,
          exampleArtwork,
          cost,
          artist: artistId,
        },
        { new: true }
      ).populate(['exampleArtwork', 'tags']);

      if (!updatedCommission) {
        return res.status(404).json({ message: 'Commission not found' });
      }

      res.json(updatedCommission);
    } catch (error) {
      console.log('An error ocurred updating the commission', error);
      next(error);
    }
  }
);

// Delete commission
router.delete(
  '/commissions/:id',
  isAuthenticated,
  checkArtist,
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const artist = await Commission.findById(id, 'artist -_id');
      const artistId = artist.artist.toString();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Id is not valid' });
      }

      // delete from artist
      await Artist.findByIdAndUpdate(artistId, { $pull: { commissions: id } });

      // delete from commission
      await Artwork.updateMany({ $pull: { commissions: id } });

      // delete from tags
      await Tag.updateMany({ $pull: { commissions: id } });

      // delete commission
      await Commission.findByIdAndDelete(id);

      res.json({ message: 'Commission deleted successfully' });
    } catch (error) {
      console.log('An error occurred deleting the commission', error);
      next(error);
    }
  }
);

module.exports = router;
