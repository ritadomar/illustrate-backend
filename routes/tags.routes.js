// const router = require('express').Router();
// const User = require('../models/User.model');
// const Rating = require('../models/Rating.model');
// const mongoose = require('mongoose');
// const { isAuthenticated } = require('../middleware/jwt.middleware');

// // Create a new tag
// router.post('/tags', isAuthenticated, async (req, res, next) => {
//   const { tagName } = req.body;

//   try {
//     const newTag = await Tag.create({ tagName });

//     // console.log('New rating', newRating);
//     res.status(201).json(newTag);
//   } catch (error) {
//     console.log('An error ocurred rating this tag', error);
//     next(error);
//   }
// });

// module.exports = router;
