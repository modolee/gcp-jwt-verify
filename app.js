'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');

/**
 * Get JWT from authorization Header
 * @param authorization
 * @return {*|string}
 */
const getJwt = (authorization) => {
  if (typeof authorization !== 'undefined') {
    let jwt = authorization.split(' ');

    if (jwt.length !== 2) {
      throw 'NO AUTHORIZATION';
    } else {
      return jwt[1];
    }
  } else {
    throw 'NO AUTHORIZATION';
  }
};

/**
 * Verify JWT with Google API
 * @param req
 * @param res
 * @param next
 */
const verifyJwt = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    const jwt = getJwt(authorization);

    axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${jwt}`)
        .then(result => {
          const payload = result.data;
          // I check 'iss' for 2-level security. But, it is not necessary.
          if(payload.iss && payload.iss === 'https://accounts.google.com') {
            req.headers['jwt-payload'] = payload;
            next();
          } else {
            throw 'INVALID TOKEN';
          }
        });

  } catch(err) {
    res.status(401).end();
  }
};

const app = express();
app.use(cors());

app.get('/', verifyJwt, (req, res) => {
  const jwtPayload = req.headers['jwt-payload'];
  res.status(200).json(jwtPayload).end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
