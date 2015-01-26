'use strict';
var Component = require('../../util/component');
var API_ROOT = require('../../api-root');
var authProviders = require('../../auth-providers.json');

authProviders.forEach(function(provider) {
  if (!provider.url) {
    provider.url = API_ROOT + '/auth/authenticate?provider=' + provider.id +
      '&referer=' + location.origin;
  }
});

module.exports = Component.extend({
  template: require('./template.html'),
  css: require('./style.css'),

  computed: {
    authMethods: function() {
      return authProviders;
    }
  }
});
