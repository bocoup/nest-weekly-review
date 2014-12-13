'use strict';
var Model = require('ampersand-model');

var CONSULTING_ID = 1;

module.exports = Model.extend({
  props: {
    'id': 'number',
    'name': 'string',
    'color': 'string'
  },
  derived: {
    isConsulting: {
      deps: ['id'],
      fn: function() {
        return this.get('id') === CONSULTING_ID;
      }
    }
  }
});
