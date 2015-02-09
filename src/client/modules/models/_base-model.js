'use strict';
var Model = require('ampersand-model');
var extend = require('lodash.assign');
var Promise = require('ractive/ractive.runtime').Promise;

var setBearer = require('../ajax-config');
var superSerialize = Model.prototype.serialize;
var superSave = Model.prototype.save;
var superDestroy = Model.prototype.destroy;

module.exports = Model.extend({
  ajaxConfig: setBearer,

  constructor: function() {
    Model.apply(this, arguments);

    this.on('change', function() {
      this.set('_isDirty', true, { silent: true });
    });
    this.on('sync', function() {
      this.set('_isDirty', false, { silent: true });
    });
  },

  session: {
    _isDirty: 'bool'
  },

  /**
   * Determine if the model has changes that need to be propagated to the
   * server.
   *
   * This method tracks "dirtiness" via a session attribute that is modified in
   * response to `change` and `sync` events. Because `change` events may be
   * suppressed via the `silent` flag, the method falls back to Ampersand
   * State's `hasChanged` method.
   *
   * @returns {boolean}
   */
  isDirty: function() {
    return this.get('_isDirty') || !!this.hasChanged();
  },

  serialize: function() {
    var type = this.getType();
    var collectionType = this.collection && this.collection.getType();
    var wrapped;

    if (collectionType && collectionType !== type) {
      throw new Error(
        'Model and collection type mismatch ' +
        '(model: "' + type + '", collection: "' + collectionType + '")'
      );
    }

    wrapped = {};
    wrapped[type] = superSerialize.apply(this, arguments);
    return wrapped;
  },

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
