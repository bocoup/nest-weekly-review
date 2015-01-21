'use strict';
var Cookies = require('cookies');

// Expire in 10 hours
var EXPIRY = 1000 * 60 * 60 * 24 * 10;
var NAME = 'weekly-review-token';

exports.set = function(req, res, value) {
  var cookies = new Cookies(req, res);
  var cookieOptions = {
    expires: new Date(new Date().getTime() + EXPIRY),
    httpOnly: false,
    overwrite: true
  };

  cookies.set(NAME, value, cookieOptions);
};

exports.expire = function(req, res) {
  var cookies = new Cookies(req, res);
  var destroyOptions = {
    expires: 0,
    httpOnly: false,
    overwrite: true
  };

  cookies.set(NAME, null, destroyOptions);
};
