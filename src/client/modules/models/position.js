'use strict';
var Model = require('ampersand-model');

module.exports = Model.extend({
  props: {
    id: 'number',
    name: 'string',
    abbr: 'string'
  }
});
