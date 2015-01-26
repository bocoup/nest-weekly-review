'use strict';
var cookies = require('cookies-js');

var TOKEN_NAME = 'weekly-review-token';

exports.get = function() {
  var value = cookies.get(TOKEN_NAME);
  var pairs;

  if (value) {
    return value;
  }

  pairs = location.search.slice(1).split('&');

  pairs.forEach(function(pair) {
    pair = pair.split('=');

    if (pair[0] === 'access_token') {
      value = pair[1];
      cookies.set(TOKEN_NAME, pair[1]);
    }
  });

  return value || null;
};

exports.unset = function() {
  cookies.expire(TOKEN_NAME);
};
