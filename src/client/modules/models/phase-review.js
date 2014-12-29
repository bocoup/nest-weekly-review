'use strict';
var Model = require('ampersand-model');

var API_ROOT = require('../api-root');

module.exports = Model.extend({
  urlRoot: API_ROOT + '/project_phase_reviews',
  props: {
    id: 'number',
    project_phase_id: 'number',
    first_day: 'date',
    notes: 'string'
  }
});
