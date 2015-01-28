'use strict';
var Component = require('../../util/component');

var DAY_MS = 1000 * 60 * 60 * 24;

module.exports = Component.extend({
  css: require('./style.css'),
  template: require('./template.html'),
  partials: {
    fullDate: require('../../partials/full-date.html')
  },

  computed: {
    monday: function() {
      return new Date(this.get('date').getTime() + DAY_MS);
    }
  }
});
