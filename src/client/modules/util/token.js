'use strict';
var cookies = require('cookies-js');

var TOKEN_NAME = 'weekly-review-token';
var cookieStore, memoryStore, activeStore;

cookieStore = {
  get: function() {
    return cookies.get(TOKEN_NAME);
  },
  set: function(value) {
    cookies.set(TOKEN_NAME, value);
  },
  unset: function() {
    cookies.expire(TOKEN_NAME);
  }
};

memoryStore = {
  get: function() {
    return memoryStore._value;
  },
  set: function(value) {
    memoryStore._value = value;
  },
  unset: function() {
    memoryStore._value = null;
  }
};

activeStore = cookies.enabled ? cookieStore : memoryStore;

exports.get = function() {
  var value = activeStore.get();
  var pairs;

  if (value) {
    return value;
  }

  pairs = location.search.slice(1).split('&');

  pairs.forEach(function(pair) {
    pair = pair.split('=');

    if (pair[0] === 'access_token') {
      value = pair[1];
      activeStore.set(pair[1]);

      // Hide the token from the URL now.
      history.replaceState('', {}, location.pathname);
    }
  });

  return value || null;
};

exports.unset = activeStore.unset;
