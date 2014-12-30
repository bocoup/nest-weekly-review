'use strict';
var Component = require('../../util/component');
var NotificationList = require('../notification-list/index');
var PhaseTable = require('../phase-table/index');
var Review = require('../review/index');
var LoginPrompt = require('../login-prompt/index');
var getToken = require('../../util/get-token');

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),
  components: {
    'bp-notification-list': NotificationList,
    'bp-phase-table': PhaseTable,
    'bp-review': Review,
    'bp-login-prompt': LoginPrompt
  },

  computed: {
    loggedIn: function() {
      return !!getToken();
    }
  },

  onconstruct: function() {
    this.on('*.error', this.addError);
  },

  addError: function(error) {
    this.findComponent('bp-notification-list').addError(error);
  }
});
