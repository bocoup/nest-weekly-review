'use strict';

var Component = require('../../util/component');

// The amount of time in milliseconds to display a "notice" (non-error)
// notification before automatically dismissing it.
var NOTICE_TIMEOUT = 4 * 1000;

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),

  data: function() {
    return {
      notifications: []
    };
  },

  onconstruct: function() {
    this.on('dismiss', this.dismiss);
  },

  /**
   * Insert an error into the notification list.
   *
   * @param {Object|string} error If a string literal, this will be interpreted
   *                              as the error title
   * @param {string} error.title The error message title
   * @param {string} error.desc  The error message description
   */
  addError: function(error) {
    this.get('notifications').unshift({
      type: 'error',
      title: error.title || error,
      desc: error.desc || null
    });
  },

  addNotice: function(message) {
    var ntfn = {
      type: 'notice',
      title: message
    };
    this.get('notifications').unshift(ntfn);

    setTimeout(this.dismiss.bind(this, ntfn), NOTICE_TIMEOUT);
  },

  toggleDesc: function(event) {
    event = this.event;
    this.toggle(event.keypath + '.showDesc');
  },

  dismiss: function(ntfn) {
    var notifications = this.get('notifications');
    var index = notifications.indexOf(ntfn);

    if (index === -1) {
      return;
    }

    notifications.splice(index, 1);
  }
});
