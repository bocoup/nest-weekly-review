'use strict';
var Model = require('ampersand-model');

var Utilizations = require('./utilizations');

module.exports = Model.extend({
  props: {
    id: 'number',
    first: 'string',
    last: 'string',
    github_user: 'string'
  },
  collections: {
    utilizations: Utilizations
  }
});
