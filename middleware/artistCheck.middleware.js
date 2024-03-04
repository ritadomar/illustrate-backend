const checkArtist = (req, res, next) => {
  if (req.payload.isArtist) {
    return next();
  }

  res.status(403).json({ message: 'Artist access required' });
};

module.exports = { checkArtist };
