// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
const express = require('express');
const cors = require('cors');
const axios = require('axios');

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

const verifyJwt = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    const jwt = getJwt(authorization);

    axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${jwt}`)
        .then(result => {
          const payload = result.data;
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
