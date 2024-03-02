const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const ratingSchema = new Schema(
  {
    giver: { type: Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: {
      type: Number,
      max: 5,
      required: [true, 'You need to submit a rating'],
    },
    comment: String,
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Rating = model('Rating', ratingSchema);

module.exports = Rating;
