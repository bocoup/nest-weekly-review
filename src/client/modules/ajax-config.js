/**
 * @file: A function for configuring the behavior of AJAX requests from
 *        network-enabled subclasses of ampersand-state (i.e. ampersand-model
 *        and ampersand-rest-collection)
 */
'use strict';

var getToken = require('./util/get-token');

module.exports = function() {
  var token = getToken();

  if (!token) {
    return;
  }

  return {
    headers: {
      Authorization: 'Bearer ' + token
    }
  };
};
