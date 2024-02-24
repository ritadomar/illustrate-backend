const { expressjwt: jwt } = require('express-jwt');

// instantiate the JWT token validation middleware
const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'payload', // we will be able to access the decoded JWT in req.payload
  getToken: getTokenFromHeaders, // the function below to extract the jwt
});

// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWNhOGJlOWEyNjRjYjE4OThiYjk1ODYiLCJlbWFpbCI6Imx1Y2lhQGVsbWUuY29tIiwibmFtZSI6Ikx1Y2lhIiwiaWF0IjoxNzA3OTM4NDY1LCJleHAiOjE3MDc5NjAwNjV9.wgpkEHlihg_lAhzWxsMRNBFy5hcGbaWAfVjYbPb4YCI

function getTokenFromHeaders(req) {
  // this checks if the token is available on the request headers
  // format: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    // get the token and return it
    const token = req.headers.authorization.split(' ')[1];
    return token;
  }

  return null;
}

module.exports = { isAuthenticated };
