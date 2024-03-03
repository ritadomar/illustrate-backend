const checkArtist = (req, res, next) => {
  if (Object.keys(req.body).length > 0) {
    if (req.payload.isArtist && req.payload._id === req.body.artistId) {
      return next();
    }
  } else if (Object.keys(req.body).length === 0) {
    if (req.payload.isArtist) {
      return next();
    }
  }
  res.status(403).json({ message: 'Artist access required' });
};

module.exports = { checkArtist };
