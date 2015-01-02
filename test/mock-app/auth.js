/**
 * @file - An Express.js router intended to serve as a mock for the production
 * version. This immediately "authenticates" all requests by setting a dummy
 * value for the client's session token. Token management logic is
 * intentionally duplicated from the application itself in order to minimize
 * shared code between production and testing environments.
 */
'use strict';

var express = require('express');
var Cookies = require('cookies');

// Expire in 10 hours
var EXPIRY = 1000 * 60 * 60 * 24 * 10;
var NAME = 'black-phoenix-token';

var router = module.exports = express.Router();

router.get('/login', function(req, res) {
  var cookies = new Cookies(req, res);
  var cookieOptions = {
    expires: new Date(new Date().getTime() + EXPIRY),
    httpOnly: false,
    overwrite: true
  };

  cookies.set(NAME, 'fake token value for testing', cookieOptions);

  res.writeHead(301, { 'Content-Type': 'text/plain', 'Location': '/' });
  res.end();
});

router.get('/logout', function(req, res) {
  var cookies = new Cookies(req, res);
  var destroyOptions = {
    expires: 0,
    httpOnly: false,
    overwrite: true
  };

  cookies.set(NAME, null, destroyOptions);

  res.writeHead(301, { 'Content-Type': 'text/plain', 'Location': '/' });
  res.end();
});
