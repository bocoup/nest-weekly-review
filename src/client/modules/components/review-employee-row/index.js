'use strict';
var Component = require('../../util/component');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  components: {
    'bp-employee-row-day': require('../review-employee-row-day/index')
  }
});
