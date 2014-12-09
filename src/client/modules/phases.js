'use strict';
var Collection = require('ampersand-rest-collection');

module.exports = Collection.extend({
  model: require('./phase'),
  url: '/api/phases'
});
