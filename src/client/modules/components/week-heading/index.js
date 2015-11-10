'use strict';
var Moment = require('moment');

var Component = require('../../util/component');

module.exports = Component.extend({
  css: require('./style.css'),
  template: require('./template.html'),
  partials: {
    fullDate: require('../../partials/full-date.html')
  },

  computed: {
    monday: function() {
      return new Moment(this.get('date')).add(1, 'day').toDate();
    }
  }
});
