'use strict';
var Model = require('ampersand-model');

var setBearer = require('../ajax-config');

var API_ROOT = require('../api-root');

module.exports = Model.extend({
  urlRoot: API_ROOT + '/project-phase-reviews',
  ajaxConfig: setBearer,

  props: {
    id: 'number',
    project_phase_id: 'number',
    first_day: 'date',
    notes: 'string'
  }
});
