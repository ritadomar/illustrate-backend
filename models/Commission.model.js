const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const commissionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
    },
    description: String,
    tags: [{ type: String }],
    exampleArtwork: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    artist: { type: Schema.Types.ObjectId, ref: 'User' },
    cost: Number,
    requests: [{ type: Schema.Types.ObjectId, ref: 'Requests' }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Commission = model('Commission', commissionSchema);

module.exports = Commission;
