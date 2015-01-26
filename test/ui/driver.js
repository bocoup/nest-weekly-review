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

function readAll(els) {
  return Promise.all(els.map(function(el) {
    return el.getVisibleText();
  }));
}

Driver.prototype._$ = function(region) {
  var selector = lookup(region, selectors);
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

Driver.prototype.read = function(region) {
  return this._$(region).getVisibleText();
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
      return this._waitFor('session.logoutButton');
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
      return readAll(employees);
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

Driver.prototype.readDays = function() {
  return this._$('phaseWeek.dayLabels').then(function(labels) {
    return readAll(labels.slice(1));
  });
};

Driver.prototype.readWeekStart = function() {
  return this._$('phaseWeek.weekStart').then(function(weekStart) {
    return weekStart[0].getVisibleText();
  });
};
