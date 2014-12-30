'use strict';
var cookies = require('cookies-js');

var TOKEN_NAME = 'black-phoenix-token';

module.exports = function() {
  return cookies.get(TOKEN_NAME) || null;
};
