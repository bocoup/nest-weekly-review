'use strict';
var JsonApiModel = require('./abstract/nest-api-model');

module.exports = JsonApiModel.extend({
  modelType: 'leave-request-types',

  props: {
    'id': 'number',
    'name': 'string',
    'description': 'string',
    'color': 'string',
    'is_unpaid': 'boolean',
    'display_name': 'string'
  },

  derived: {
    displayName: {
      deps: ['name', 'display_name'],
      fn: function() {
        return this.get('display_name') || this.get('name');
      }
    }
  }
});
