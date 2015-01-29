'use strict';
var Promise = require('bluebird');

var selectors = require('./selectors.json');
var buildSelector = require('./util/build-selector');
var dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

function Driver(options) {
  this._cmd = options.command;
  this._root = options.root;
}

module.exports = Driver;

function readAll(els) {
  return Promise.all(els.map(function(el) {
    return el.getVisibleText();
  }));
}

function waitFor(conditionFn, options) {
  var start = new Date().getTime();
  var timeout, errorMsg;

  if (!options) {
    options = {};
  }

  timeout = options.timeout || 1000;
  errorMsg = options.errorMsg || 'Timeout';

  return conditionFn()
    .then(function(result) {
      var delay, remaining;

      if (result) {
        return;
      }

      delay = new Date().getTime() - start;
      remaining = timeout - delay;

      if (delay < 0) {
        throw new Error(errorMsg);
      }

      return waitFor(conditionFn, remaining);
    });
}

Driver.prototype._$ = function(path) {
  var selector = buildSelector(path, selectors);
  return this._cmd.findAllByCssSelector(selector);
};

Driver.prototype._selectOption = function(element, value) {
  var optionEls;
  return element.findAllByTagName('option')
    .then(function(options) {
      optionEls = options;
      return readAll(options);
    })
    .then(function(text) {
      var index = text.indexOf(value);

      if (index === -1) {
        throw new Error('Could not find option value "' + value + '".');
      }

      return this._cmd.execute(function(el) {
        /* jshint browser: true */
        var evt;

        el.selected = true;

        if ('createEvent' in document) {
          evt = document.createEvent('HTMLEvents');
          evt.initEvent('change', false, true);
          el.parentNode.dispatchEvent(evt);
        } else {
          element.fireEvent('onchange');
        }
      }, [optionEls[index]]);
    }.bind(this));
};

/**
 * Get the visible text within the element found at the given region
 *
 * @param {string} region The name of the region from which the text should be
 *                        read.
 *
 * @returns {string}
 */
Driver.prototype.read = function(region) {
  return this._$(region).then(function(els) {
      return els[0].getVisibleText();
    });
};

/**
 * Get the visible text within the elements found in the given region
 *
 * @param {string} region The name of the region from which the text should be
 *                        read.
 *
 * @returns {Array<string>}
 */
Driver.prototype.readAll = function(region) {
  return this._$(region).then(function(els) {
      return Promise.all(els.map(function(el) {
        return el.getVisibleText();
      }));
    });
};

/**
 * Navigate to a specific URL within the application.
 *
 * @param {string} path
 */
Driver.prototype.get = function(path) {
  return this._cmd.get(this._root + path);
};

/**
 * Submit the application "log in" form. This method does not input user
 * credentials; it is designed to work only when the login functionality has
 * been stubbed out.
 */
Driver.prototype.login = function() {
  return this._$('session.loginButton')
    .then(function(loginBtn) {
      return loginBtn[0].click();
    }).then(function() {
      return this._waitForRegion('session.logoutButton');
    }.bind(this));
};

/**
 * Navigate from the "overview" page to a specific "week review" page.
 *
 * @param {number} phaseNumber The zero-indexed offset of the phase in the
 *                             current phase table
 * @param {number} weekNumber The zero-indexed offset of the week in the
 *                            current phase table
 */
Driver.prototype.viewWeek = function(phaseNumber, weekNumber) {
  return this._$('phaseTable.week.link')
    .then(function(weekLinks) {
      return weekLinks[phaseNumber * 5 + weekNumber].click();
    }).then(function() {
      return this._waitForRegion('phaseWeek.employee');
    }.bind(this));
};

Driver.prototype._waitForRegion = function(region, timeout) {
  var options = {
    timeout: timeout,
    errorMsg: 'Unable to find element at region "' + region + '"'
  };

  return waitFor(function() {
      return this._$(region)
        .then(function(els) {
          return els.length > 0;
        });
    }.bind(this), options);
};

Driver.prototype._getEmployeeOffset = function(name) {
  return this.readAll('phaseWeek.employee')
    .then(function(names) {
      var employeeOffset = names.indexOf(name);

      if (employeeOffset === -1) {
        throw new Error('Expected employee not found: "' + name + '"');
      }

      return employeeOffset;
    });
};

/**
 * Change a utilization for a given day. This method assumes the driver is
 * currently viewing a "week review" page.
 *
 * @param {object} options
 * @param {string} options.name the full name of the employee whose utilization
 *                              should be modified
 * @param {string} options.day  the name of the weekday to modify
 * @param {string} options.type the new utilization type
 */
Driver.prototype.editUtilization = function(options) {
  var dayNumber = dayNames.indexOf(options.day);
  var driver = this;
  var offset;

  if (!dayNumber) {
    throw new Error('Unrecognized day: "' + options.day + '".');
  }

  return this._getEmployeeOffset(options.name)
    .then(function(employeeOffset) {
      offset = employeeOffset * 5 + dayNumber;

      return driver._$('phaseWeek.day.front');
    }).then(function(days) {
      return days[offset].click();
    }).then(function() {
      return driver._$('phaseWeek.day.typeInput');
    }).then(function(typeInputs) {
      return driver._selectOption(typeInputs[offset], options.type);
    }).then(function() {
      return driver._$('phaseWeek.day.set');
    }).then(function(set) {
      return set[offset].click();
    });
};

/**
 * Verify the utilizations for one or more employees.
 *
 * @param {string|Array<string>} name The full name of the employee or an array
 *                                    of multiple employees whose current
 *                                    utilizations should be marked as
 *                                    "verified".
 *
 * @returns {Promise}
 */
Driver.prototype.verify = function(name) {
  var driver = this;
  var offset;

  if (Array.isArray(name)) {
    return Promise.all(name.map(this.verify.bind(this)));
  }

  return driver._getEmployeeOffset(name)
    .then(function(_offset) {
      offset = _offset;

      return driver._$('phaseWeek.verifyBtns');
    }).then(function(btns) {
      return btns[offset].click();
    });
};

Driver.prototype.addNote = function(keys) {
  return this._$('phaseWeek.notes')
    .then(function(notes) {
      return notes[0].type(keys);
    });
};

/**
 * Submit the current review form and wait for some feedback from the server.
 */
Driver.prototype.submitReview = function() {
  var driver = this;
  var initialNotificationCount;

  return this._$('notifications.item')
    .then(function(notifications) {
      initialNotificationCount = notifications.length;

      return driver._$('phaseWeek.submit');
    }).then(function(submit) {
      return submit[0].click();
    }).then(function() {
      return waitFor(function() {
        return driver._$('notifications.item')
          .then(function(notifications) {
            return notifications.length !== initialNotificationCount;
          });
      });
    });
};
