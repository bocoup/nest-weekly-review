/**
 * @file Ractive.js "adapter" for Ampersand Models. Based on the Backbone.js
 * adapter maintained by the Ractive project:
 * https://github.com/ractivejs/ractive-adaptors-backbone
 */
'use strict';

var Model = require('ampersand-model');
var lockProperty = '_ractiveAdaptorsAmpersandModelLock';
var ModelWrapper;

function acquireLock( key ) {
  key[lockProperty] = ( key[lockProperty] || 0 ) + 1;
  return function release() {
    key[lockProperty] -= 1;
    if ( !key[lockProperty] ) {
      delete key[lockProperty];
    }
  };
}

function isLocked( key ) {
  return !!key[lockProperty];
}

ModelWrapper = function(ractive, model, keypath, prefix) {
  this.value = model;

  model.on( 'change', this.modelChangeHandler = function () {
    var release = acquireLock(model);
    ractive.set(prefix(model.changedAttributes()));
    release();
  });
};

ModelWrapper.prototype = {
  teardown: function() {
    this.value.off('change', this.modelChangeHandler);
  },
  get: function() {
    return this.value;
  },
  set: function(keypath, value) {
    // Only set if the model didn't originate the change itself, and only if
    // it's an immediate child property
    if (!isLocked(this.value) && keypath.indexOf('.') === -1) {

      // If the attribute value is a Collection that has not actually changed,
      // setting it with `Model#set` will translate to an eventual
      // `Collection#set`, which will trigger unecessary `add` and `remove`
      // events.
      if (this.value.get(keypath) === value) {
        return;
      }

      this.value.set(keypath, value);
    }
  },
  reset: function (object) {
    // If the new object is an Ampersand model, assume this one is being
    // retired. Ditto if it's not a model at all
    if (object instanceof Model || !(object instanceof Object)) {
      return false;
    }

    // Otherwise if this is a POJO, reset the model
    this.value.set(object);
  }
};

module.exports = {
  filter: function(object) {
    return object && object instanceof Model;
  },
  wrap: function (ractive, object, keypath, prefix) {
    return new ModelWrapper(ractive, object, keypath, prefix);
  }
};
