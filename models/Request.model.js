const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const requestSchema = new Schema(
  {
    artist: { type: Schema.Types.ObjectId, ref: 'User' },
    buyer: { type: Schema.Types.ObjectId, ref: 'User' },
    commission: { type: Schema.Types.ObjectId, ref: 'Commission' },
    description: {
      type: String,
      required: [
        true,
        'Description is required. Please provide as much useful information about the specs of the project, including size, purpose, media, and deadline',
      ],
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Request = model('Request', requestSchema);

module.exports = Request;
