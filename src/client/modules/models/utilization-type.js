'use strict';
var Model = require('ampersand-model');

var parse = require('../util/parse-json-api-resp')('type');
var CONSULTING_ID = 1;

module.exports = Model.extend({
  props: {
    'id': 'number',
    'name': 'string',
    'color': 'string'
  },
  parse: parse,
  derived: {
    isConsulting: {
      deps: ['id'],
      fn: function() {
        return this.get('id') === CONSULTING_ID;
      }
    }
  }
});
