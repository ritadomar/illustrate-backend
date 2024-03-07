const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { isAuthenticated } = require('../middleware/jwt.middleware');

const saltRounds = 10;

router.post('/signup', async (req, res, next) => {
  const {
    email,
    password,
    name,
    username,
    avatarUrl,
    portfolio,
    isArtist,
    rate,
  } = req.body;

  try {
    if (email === '' || password === '' || name === '' || username === '') {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    // use regex to validate the email format
    const emailRegex = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Provide valid email address' });
    }

    // use regex to validate the password
    const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,64})/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must have at least 6 characters, and contain one number, one lowercase, one uppercase and one special character',
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: 'The provided email is already registered',
      });
    }

    // Encrypt the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
      username,
      avatarUrl,
      portfolio,
      isArtist,
      rate,
      artwork: [],
      commissions: [],
      requests: [],
    });

    // sending the new user without the hashedPassword
    res.json({
      email: newUser.email,
      username: newUser.username,
      _id: newUser._id,
    });
  } catch (error) {
    console.log('Error creating the user', error);
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { credential, password } = req.body;

  try {
    if (credential === '' || password === '') {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const user = await User.findOne({
      $or: [{ email: credential }, { username: credential }],
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Provided email/username is not registered' });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (isPasswordCorrect) {
      // create a payload for the JWT with the user info
      // DO NOT SEND THE HASHED PASSWORD
      const payload = {
        _id: user._id,
        email: user.email,
        username: user.username,
        isArtist: user.isArtist,
      };

      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: 'HS256', // algorithm we want to encrypt the token with
        expiresIn: '72h', // time to live of the JWT
      });

      res.status(200).json({ authToken });
    } else {
      return res
        .status(401)
        .json({ message: 'Unable to authenticate the user' });
    }
  } catch (error) {
    console.log('An error occurred login in the user', error);
    next(error);
  }
});

router.get('/verify', isAuthenticated, async (req, res, next) => {
  // if the jwt is valid, the payload gets decoded by the middleware
  // and is made available in req.payload
  console.log('req.payload', req.payload);

  // send it back with the user data from the token
  res.json(req.payload);
});

module.exports = router;
