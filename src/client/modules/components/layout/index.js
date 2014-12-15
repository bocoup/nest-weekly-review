'use strict';
var Component = require('../../util/component');
var NotificationList = require('../notification-list/index');
var PhaseTable = require('../phase-table/index');
var Review = require('../review/index');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  components: {
    'bp-notification-list': NotificationList,
    'bp-phase-table': PhaseTable,
    'bp-review': Review
  },

  onconstruct: function() {
    this.on('*.error', this.addError);
  },

  addError: function(error) {
    this.findComponent('bp-notification-list').addError(error);
  }
});
