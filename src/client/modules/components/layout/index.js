'use strict';
var Ractive = require('ractive/ractive.runtime');
var PhaseTable = require('../phase-table/index');
var Review = require('../review/index');

module.exports = Ractive.extend({
  template: require('./template.html'),
  components: {
    'bp-phase-table': PhaseTable,
    'bp-review': Review
  }
});
