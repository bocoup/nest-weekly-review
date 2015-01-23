'use strict';
var Promise = require('bluebird');

var selectors = require('./selectors.json');
var lookup = require('./util/lookup');
var dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

function Driver(options) {
  this._cmd = options.command;
  this._root = options.root;
}

module.exports = Driver;

Driver.prototype._$ = function(region) {
  var selector = lookup(region, selectors);
  return this._cmd.findAllByCssSelector(selector);
};

Driver.prototype._selectOption = function(element, value) {
  var optionEls;
  return element.findAllByTagName('option')
    .then(function(options) {
      optionEls = options;
      return Promise.all(options.map(function(option) {
        return option.getVisibleText();
      }));
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

Driver.prototype.read = function(region) {
  return this._$(region).getVisibleText();
};

/**
 * Navigate to a specific URL within the application, logging in if necessary.
 *
 * @param {string} path
 */
Driver.prototype.get = function(path) {
  var navigate = function() {
    return this._cmd.get(this._root + path);
  }.bind(this);

  return navigate()
    .then(function() {
      return this._$('session.loginButton');
    }.bind(this))
    .then(function(loginBtn) {
      // If the login button is not present, the current session is already
      // authenticated and the operation is complete.
      if (loginBtn.length === 0) {
        return;
      }
      return loginBtn[0].click()
        .then(navigate);
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
  return this._$('index.phaseWeekLink')
    .then(function(weekLinks) {
      return weekLinks[phaseNumber * 5 + weekNumber].click();
    }).then(function() {
      return this._waitFor('phaseWeek.employee');
    }.bind(this));
};

/**
 * Get a list of all employees visible on a given "week review" page.
 *
 * @returns {Promise} Resolved with an array of strings, each describing the
 *                    full name of a visible employee
 */
Driver.prototype.readEmployees = function() {
  return this._$('phaseWeek.employee')
    .then(function(employees) {
      return Promise.all(employees.map(function(employee) {
        return employee.getVisibleText();
      }));
    });
};

Driver.prototype._waitFor = function(region, timeout) {
  var start = new Date().getTime();
  if (arguments.length < 2) {
    timeout = 1000;
  }

  var poll = function() {
    return this._$(region)
      .then(function(els) {
        if (els.length) {
          return;
        }

        if (new Date().getTime() - start > timeout) {
          throw new Error('Unable to find element at region "' + region + '"');
        }

        return poll();
      });
  }.bind(this);

  return poll();
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
  var offset;

  if (!dayNumber) {
    throw new Error('Unrecognized day: "' + options.day + '".');
  }

  return this.readEmployees()
    .then(function(names) {
      var employeeOffset = names.indexOf(options.name);

      if (employeeOffset === -1) {
        throw new Error('Expected employee not found: "' + options.name + '"');
      }

      offset = employeeOffset * 5 + dayNumber;

      return this._$('phaseWeek.day');
    }.bind(this))
    .then(function(days) {
      return days[offset].click();
    })
    .then(function() {
      return this._$('phaseWeek.typeInput');
    }.bind(this)).then(function(typeInputs) {
      return this._selectOption(typeInputs[offset], options.type);
    }.bind(this))
    .then(function() {
      return this._$('phaseWeek.set');
    }.bind(this))
    .then(function(set) {
      return set[offset].click();
    });
};
