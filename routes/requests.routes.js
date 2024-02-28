const router = require('express').Router();
const User = require('../models/User.model');
const Commission = require('../models/Commission.model');
const Request = require('../models/Request.model');
const mongoose = require('mongoose');

// Create a new request
router.post('/requests', async (req, res, next) => {
  const { buyer, commission, description } = req.body;

  try {
    const artistId = await Commission.findById(commission, 'artist -_id');
    const artist = artistId.artist.toString();
    console.log('artist', artist);
    const newRequest = await Request.create({
      artist,
      buyer,
      commission,
      description,
    });

    await User.findByIdAndUpdate(artist, {
      $push: { requests: newRequest._id },
    });

    await User.findByIdAndUpdate(buyer, {
      $push: { requests: newRequest._id },
    });

    await Commission.findByIdAndUpdate(commission, {
      $push: { requests: newRequest._id },
    });

    console.log('New request', newRequest);
    //   res.status(201).json({ message: 'Successful' });
    res.status(201).json(newRequest);
  } catch (error) {
    console.log('An error ocurred creating the request', error);
    next(error);
  }
});

// Read all requests
router.get('/requests', async (req, res, next) => {
  const { userId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }
    const allRequests = await Request.find({
      $or: [{ artist: userId }, { buyer: userId }],
    });

    console.log('All requests', allRequests);
    res.json(allRequests);
  } catch (error) {
    console.log('An error ocurred getting all requests', error);
    next(error);
  }
});

// Read one request by id
router.get('/requests/:id', async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    // check if id is a valid value in our db
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const request = await Request.findById(id).populate(
      'artist buyer commission'
    );
    console.log(request);

    if (!request) {
      return res.status(404).json({ message: 'No request found' });
    }

    if (
      request.artist._id.toString() !== userId &&
      request.buyer._id.toString() !== userId
    ) {
      return res
        .status(401)
        .json({ message: 'You do not have access to this request' });
    }
    res.json(request);
  } catch (error) {
    console.log('An error ocurred getting the request', error);
    next(error);
  }
});

// Update request by id
router.put('/requests/:id', async (req, res, next) => {
  const { id } = req.params;
  const { status, userId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    const request = await Request.findById(id).populate(
      'artist buyer commission'
    );

    if (
      request.artist._id.toString() !== userId &&
      request.buyer._id.toString() !== userId
    ) {
      return res
        .status(401)
        .json({ message: 'You do not have access to this request' });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      {
        status,
      },
      { new: true }
    ).populate('artist buyer commission');

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(updatedRequest);
  } catch (error) {
    console.log('An error ocurred updating the request', error);
    next(error);
  }
});

// Delete commission
router.delete('/requests/:id', async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Id is not valid' });
    }

    // delete from artist
    const artist = await Request.findById(id, 'artist -_id');
    const artistId = artist.artist.toString();
    await User.findByIdAndUpdate(artistId, { $pull: { requests: id } });

    const buyer = await Request.findById(id, 'buyer -_id');
    const buyerId = buyer.buyer.toString();
    await User.findByIdAndUpdate(buyerId, { $pull: { requests: id } });

    if (artistId !== userId && buyerId !== userId) {
      return res
        .status(401)
        .json({ message: 'You do not have access to this request' });
    }
    // delete from commission
    await Commission.updateMany({ $pull: { requests: id } });

    await Request.findByIdAndDelete(id);

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.log('An error occurred deleting the request', error);
    next(error);
  }
});

module.exports = router;
