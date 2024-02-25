const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const artworkSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
    },
    description: String,
    artworkUrl: String,
    tags: [{ type: String }],
    time: Number,
    cost: Number,
    artist: { type: Schema.Types.ObjectId, ref: 'User' },
    commissions: { type: Schema.Types.ObjectId, ref: 'Commission' },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Artwork = model('Artwork', artworkSchema);

module.exports = Artwork;
