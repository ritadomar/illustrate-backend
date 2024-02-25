const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    name: {
      type: String,
      required: [true, 'Name is required.'],
    },
    username: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
    },
    avatarUrl: String,
    portfolio: String,
    isArtist: Boolean,
    rate: Number,
    artwork: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    commissions: [{ type: Schema.Types.ObjectId, ref: 'Commission' }],
    requests: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model('User', userSchema);

module.exports = User;
