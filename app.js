// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv').config();

// ℹ️ Connects to the database
require('./db');

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express');

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require('./config')(app);

const { isAuthenticated } = require('./middleware/jwt.middleware');

// 👇 Start handling routes here
const indexRoutes = require('./routes/index.routes');
app.use('/api', indexRoutes);
const artistsRoutes = require('./routes/artists.routes');
app.use('/api', artistsRoutes);
const profilesRoutes = require('./routes/profiles.routes');
app.use('/api', profilesRoutes);
const artworksRoutes = require('./routes/artworks.routes');
app.use('/api', artworksRoutes);
const commissionsRoutes = require('./routes/commissions.routes');
app.use('/api', commissionsRoutes);
const requestsRoutes = require('./routes/requests.routes');
app.use('/api', isAuthenticated, requestsRoutes);
const ratingsRoutes = require('./routes/ratings.routes');
app.use('/api', ratingsRoutes);

// auth routes
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

module.exports = app;
