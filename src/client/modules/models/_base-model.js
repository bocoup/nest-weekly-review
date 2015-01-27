'use strict';
var Model = require('ampersand-model');
var extend = require('lodash.assign');
var Promise = require('ractive/ractive.runtime').Promise;

var setBearer = require('../ajax-config');
var superSave = Model.prototype.save;
var superDestroy = Model.prototype.destroy;

module.exports = Model.extend({
  ajaxConfig: setBearer,

  destroy: function(options) {
    var onSuccess = options && options.success;
    var onError = options && options.error;
    options = extend({}, options);

    return new Promise(function(resolve, reject) {
      options.success = function() {
        resolve();

        if (onSuccess) {
          onSuccess.apply(this, arguments);
        }
      };
      options.error = function(model, response) {
        reject(response.responseText);

        if (onError) {
          onError.apply(this, arguments);
        }
      };

      superDestroy.call(this, options);
    }.bind(this));
  },

  save: function(attrs, options) {
    var onSuccess = options && options.success;
    var onError = options && options.error;
    options = extend({}, options);

    return new Promise(function(resolve, reject) {
      options.success = function() {
        resolve();

        if (onSuccess) {
          onSuccess.apply(this, arguments);
        }
      };
      options.error = function(model, response) {
        reject(response.responseText);

        if (onError) {
          onError.apply(this, arguments);
        }
      };

      superSave.call(this, attrs, options);
    }.bind(this));
  }
});
