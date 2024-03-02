const router = require('express').Router();
const User = require('../models/User.model');
const Rating = require('../models/Rating.model');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../middleware/jwt.middleware');

// Create a new rating
router.post('/ratings', isAuthenticated, async (req, res, next) => {
  const { giverId, receiverId, rating, comment } = req.body;

  try {
    // check if rating already exists
    const ratingExists = await Rating.find({
      $and: [{ giver: giverId }, { receiver: receiverId }],
    });

    if (ratingExists.length > 0) {
      return res.status(400).json({
        message: 'You have rated this user already',
      });
    }
    // if it doesnt exist, create rating
    const newRating = await Rating.create({
      giver: giverId,
      receiver: receiverId,
      rating,
      comment,
    });

    // get the receiver
    const receiverUser = await User.findById(receiverId).populate('ratings');
    const receiverRatings = receiverUser.ratings;
    const avgRating =
      receiverRatings.reduce((acc, cur) => {
        return acc + cur.rating;
      }, rating) /
      (receiverRatings.length + 1);

    // push rating to ratings & update avg

    await User.findByIdAndUpdate(receiverId, {
      // Mongo syntax to .push()
      // $push: {name of property we are pushing to: what we are pushing}
      $push: { ratings: newRating._id },
      avgRating,
    });

    // console.log('New rating', newRating);
    res.status(201).json(newRating);
  } catch (error) {
    console.log('An error ocurred rating this user', error);
    next(error);
  }
});

// Read one rating by id
router.get('/ratings/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // check if id is a valid value in our db
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const rating = await Rating.findById(id).populate(['giver', 'receiver']);

    if (!rating) {
      return res.status(404).json({ message: 'No rating found' });
    }
    res.json(rating);
  } catch (error) {
    console.log('An error ocurred getting the rating', error);
    next(error);
  }
});

module.exports = router;
