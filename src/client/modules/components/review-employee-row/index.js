'use strict';
var Ractive = require('ractive/ractive.runtime');

module.exports = Ractive.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  components: {
    'bp-employee-row-day': require('../review-employee-row-day/index')
  }
});
