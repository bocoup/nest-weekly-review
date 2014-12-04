'use strict';
var Ractive = require('ractive/ractive.runtime');
var PhaseList = require('../phase-list/index');
var Review = require('../review/index');

module.exports = Ractive.extend({
  template: require('./template.html'),
  components: {
    'bp-phase-list': PhaseList,
    'bp-review': Review
  }
});
