const router = require('express').Router();
const User = require('../models/User.model');
const Artwork = require('../models/Artwork.model');
const Commission = require('../models/Commission.model');
const Request = require('../models/Request.model');
const Tag = require('../models/Tag.model');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../middleware/jwt.middleware');

// USING USE
// Read one profile by id
router.get('/profiles/:username', async (req, res, next) => {
  const { username } = req.params;

  try {
    const user = await User.find({ username }).populate([
      'artwork',
      'commissions',
      'ratings',
    ]);

    if (!mongoose.Types.ObjectId.isValid(user._id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

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
router.put('/profiles/:username', isAuthenticated, async (req, res, next) => {
  const { username } = req.params;
  const { name, avatarUrl, portfolio, isArtist, rate } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!mongoose.Types.ObjectId.isValid(user._id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const hasUploads = await User.findById(
      user._id,
      'artwork commissions -_id'
    );
    if (hasUploads.artwork.length > 0) {
      await Artwork.updateMany({ artist: user._id }, [
        { $set: { cost: { $multiply: [{ $toDecimal: '$time' }, rate] } } },
      ]);
    }

    if (hasUploads.commissions.length > 0) {
      const artistCommissions = await Commission.find({
        artist: user._id,
      }).populate('exampleArtwork');

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
      user._id,
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

router.delete(
  '/profiles/:username',
  isAuthenticated,
  async (req, res, next) => {
    const { username } = req.params;

    try {
      const user = await User.findOne({ username });

      if (!mongoose.Types.ObjectId.isValid(user._id)) {
        return res.status(400).json({ message: 'Id is not valid' });
      }

      const usersArtwork = await Artwork.find({ artist: user._id }, 'tags');
      const usersCommission = await Commission.find({
        artist: user._id,
      });

      await User.findByIdAndDelete(user._id);

      if (usersArtwork.length > 0) {
        const deleteArtwork = usersArtwork.map(artwork => {
          const tagsToDelete = artwork.tags.map(tag => {
            return Tag.findByIdAndUpdate(tag, {
              $pull: { artwork: artwork._id },
            });
          });
          return tagsToDelete.flat();
        });
        const deleteFromArtwork = deleteArtwork.flat();
        await Promise.all(deleteFromArtwork);
      }
      if (usersCommission.length > 0) {
        const deleteCommission = usersCommission.map(artwork => {
          const tagsToDelete = artwork.tags.map(tag => {
            return Tag.findByIdAndUpdate(tag, {
              $pull: { artwork: artwork._id },
            });
          });
          return tagsToDelete.flat();
        });
        const deleteFromCommission = deleteCommission.flat();
        await Promise.all(deleteFromCommission);
      }

      await Commission.deleteMany({ artist: user._id });
      await Artwork.deleteMany({ artist: user._id });
      await Request.deleteMany({ artist: user._id });

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.log('An error occurred deleting the account', error);
      next(error);
    }
  }
);

module.exports = router;

// USING ID
// // Read one profile by id
// router.get('/profiles/:id', async (req, res, next) => {
//   const { id } = req.params;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Id is not valid' });
//     }

//     const user = await User.findById(id).populate([
//       'artwork',
//       'commissions',
//       'ratings',
//     ]);

//     if (!user || user.length === 0) {
//       return res.status(404).json({ message: 'No user found' });
//     }

//     res.json(user);
//   } catch (error) {
//     console.log('An error ocurred getting the user', error);
//     next(error);
//   }
// });

// // Update profile by id
// router.put('/profiles/:id', isAuthenticated, async (req, res, next) => {
//   const { id } = req.params;
//   const { name, avatarUrl, portfolio, isArtist, rate } = req.body;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Id is not valid' });
//     }

//     const hasUploads = await User.findById(id, 'artwork commissions -_id');
//     if (hasUploads.artwork.length > 0) {
//       await Artwork.updateMany({ artist: id }, [
//         { $set: { cost: { $multiply: [{ $toDecimal: '$time' }, rate] } } },
//       ]);
//     }

//     if (hasUploads.commissions.length > 0) {
//       const artistCommissions = await Commission.find({ artist: id }).populate(
//         'exampleArtwork'
//       );

//       const newCost = artistCommissions.map(commission => {
//         const artworkCost = commission.exampleArtwork.map(artwork => {
//           return artwork.cost;
//         });
//         const cost =
//           artworkCost.reduce((acc, cur) => {
//             return acc + cur;
//           }) / artworkCost.length;
//         return { id: commission._id, cost };
//       });

//       const updateCost = newCost.map(commission => {
//         return Commission.findByIdAndUpdate(commission.id, {
//           cost: commission.cost,
//         });
//       });

//       await Promise.all(updateCost);
//     }

//     const updatedProfile = await User.findByIdAndUpdate(
//       id,
//       { name, avatarUrl, portfolio, isArtist, rate },
//       { new: true }
//     );
//     if (!updatedProfile) {
//       return res.status(404).json({ message: 'Artist not found' });
//     }

//     res.json(updatedProfile);
//   } catch (error) {
//     console.log('An error ocurred updating the profile', error);
//     next(error);
//   }
// });

// router.delete('/profiles/:id', isAuthenticated, async (req, res, next) => {
//   const { id } = req.params;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Id is not valid' });
//     }

//     const usersArtwork = await Artwork.find({ artist: id }, 'tags');
//     const usersCommission = await Commission.find({
//       artist: id,
//     });

//     await User.findByIdAndDelete(id);

//     if (usersArtwork.length > 0) {
//       const deleteArtwork = usersArtwork.map(artwork => {
//         const tagsToDelete = artwork.tags.map(tag => {
//           return Tag.findByIdAndUpdate(tag, {
//             $pull: { artwork: artwork._id },
//           });
//         });
//         return tagsToDelete.flat();
//       });
//       const deleteFromArtwork = deleteArtwork.flat();
//       await Promise.all(deleteFromArtwork);
//     }
//     if (usersCommission.length > 0) {
//       const deleteCommission = usersCommission.map(artwork => {
//         const tagsToDelete = artwork.tags.map(tag => {
//           return Tag.findByIdAndUpdate(tag, {
//             $pull: { artwork: artwork._id },
//           });
//         });
//         return tagsToDelete.flat();
//       });
//       const deleteFromCommission = deleteCommission.flat();
//       await Promise.all(deleteFromCommission);
//     }

//     await Commission.deleteMany({ artist: id });
//     await Artwork.deleteMany({ artist: id });
//     await Request.deleteMany({ artist: id });

//     res.json({ message: 'Account deleted successfully' });
//   } catch (error) {
//     console.log('An error occurred deleting the account', error);
//     next(error);
//   }
// });

// module.exports = router;
