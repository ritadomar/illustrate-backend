const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const tagSchema = new Schema(
  {
    tagName: { type: String, required: true, lowercase: true },
    artwork: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
    commissions: [{ type: Schema.Types.ObjectId, ref: 'Commission' }],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Tag = model('Tag', tagSchema);

module.exports = Tag;
