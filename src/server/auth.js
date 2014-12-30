'use strict';

var express = require('express');

var token = require('./token');

var router = module.exports = express.Router();

router.get('/logout', function(req, res) {
  token.expire(req, res);
  res.writeHead(301, { 'Content-Type': 'text/plain', 'Location': '/' });
  res.end();
});

router.use('/github', require('./auth/github'));
