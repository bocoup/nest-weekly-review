'use strict';
var Component = require('../../util/component');
var PhaseTable = require('../phase-table/index');
var Review = require('../review/index');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  components: {
    'bp-phase-table': PhaseTable,
    'bp-review': Review
  }
});
