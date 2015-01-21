'use strict';
var cookies = require('cookies-js');

var TOKEN_NAME = 'weekly-review-token';

module.exports = function() {
  return cookies.get(TOKEN_NAME) || null;
};
