'use strict';
var Promise = require('bluebird');

var selectors = require('../selectors.json');
var buildSelector = require('./build-selector');
var readAll = require('./read-all');
var readEl = require('./read-el');
var waitFor = require('./wait-for');
var dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

function Driver(options) {
  this._cmd = options.command;
  this._root = options.root;
}

module.exports = Driver;

/**
 * Select an element at a given path as described by the `selectors.json` file.
 *
 * @param {string|Array} path - As a string: a dot-separated set of keys in the
 *                              `selectors.json` file for use in building a CSS
 *                              selector. As an array, a combination of such
 *                              dot-separated keys and integers, where integers
 *                              will be used to limit the returned elements at
 *                              the appropriate point in the selection
 *                              operation.
 *
 * Examples:
 *
 *     driver._$('home.menu.tabs.links')
 *
 * Selects all "links" appearing within any tab on the home page's menu.
 *
 *     driver._$(['home.menu.tabs', 2, 'links'])
 *
 * Selects all "links" appearing within the third tab on the home page's menu.
 */
Driver.prototype._$ = function(path, context, pathContext) {
  var selector;

  context = context || this._cmd;

  if (!Array.isArray(path)) {
    selector = buildSelector(selectors, pathContext, path);

    return context.findAllByCssSelector(selector);
  }
  var firstPart = path[0];
  var index = path[1];
  var rest = path.slice(2);

  return this._$(firstPart, context, pathContext)
    .then(function(els) {
      var el;

      if (!index) {
        return els;
      }

      el = els[index];

      if (pathContext) {
        pathContext += '.' + firstPart;
      } else {
        pathContext = firstPart;
      }

      if (!el) {
        throw new Error(
          'Expected at least ' + (index + 1) + ' elements at region "' +
          pathContext + '", but only found ' + els.length + '.'
        );
      }

      if (!rest.length) {
        return el;
      }

      return this._$(rest, el, pathContext);
    }.bind(this));
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
      return readEl(els[0]);
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
        return readEl(el);
      }));
    });
};

/**
 * Get the number of instances of a given region
 *
 * @param {string} region The name of the region that should be counted
 *
 * @returns {number}
 */
Driver.prototype.count = function(region) {
  return this._$(region).then(function(els) {
      return els.length;
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
 * Give focus to a week in the phase table.
 *
 * @param {number} phaseNumber The zero-indexed offset of the phase in the
 *                             current phase table
 * @param {number} weekNumber The zero-indexed offset of the week in the
 *                            current phase table
 */
Driver.prototype.brushWeek = function(phaseNumber, weekNumber) {
  var driver= this;
  return this._cmd.findByCssSelector('body')
    .then(function(body) {
      return driver._cmd.moveMouseTo(body, 0, 0);
    }).then(function() {
      return driver._$(['phaseTable.week', phaseNumber * 5 + weekNumber]);
    }).then(function(weekEl) {
      return driver._cmd.moveMouseTo(weekEl);
    });
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
  return this._$(['phaseTable.week', phaseNumber * 5 + weekNumber, 'link'])
    .then(function(weekLink) {
      return weekLink[0].click();
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

Driver.prototype._getUtilizationOffset = function(options) {
  var dayNumber = dayNames.indexOf(options.day);

  if (dayNumber < 0) {
    throw new Error('Unrecognized day: "' + options.day + '".');
  }

  return this._getEmployeeOffset(options.name)
    .then(function(employeeOffset) {
      return employeeOffset * 5 + dayNumber;
    });
};

/**
 * Open the utilization data entry form for a given day. This method assumes
 * the driver is currently viewing a "week review" page.
 *
 * @param {Object} options
 * @param {string} options.name the full name of the employee whose utilization
 *                              form should be viewed
 * @param {string} options.day  the name of the weekday to view
 *
 * @returns {number} offset of the form being viewed
 */
Driver.prototype.viewUtilizationForm = function(options) {
  var driver = this;
  var offset;

  return this._getUtilizationOffset(options)
    .then(function(_offset) {
      offset = _offset;

      return driver._$('phaseWeek.day.front');
    }).then(function(days) {
      return days[offset].click();
    }).then(function() {
      return offset;
    });
};

/**
 * Read the utilization data entry form for a given day. This method assumes
 * the driver is currently viewing a "week review" page.
 *
 * @param {Object} options
 * @param {string} options.name the full name of the employee whose utilization
 *                              form should be read
 * @param {string} options.day  the name of the weekday to read
 */
Driver.prototype.readUtilizationForm = function(options) {
  var driver = this;
  var offset;

  return this._getUtilizationOffset(options)
    .then(function(_offset) {
      offset = _offset;

      return Promise.all([
          driver._$(['phaseWeek.day', offset, 'typeInput']),
          driver._$(['phaseWeek.day', offset, 'projectInput']),
          driver._$(['phaseWeek.day', offset, 'phaseInput'])
        ]);
    }).then(function(els) {
      return Promise.all(els.map(function(el) {
          return readEl(el[0]);
        }));
    }).then(function(texts) {
      return {
        type: texts[0],
        project: texts[1],
        phase: texts[2]
      };
    });
};

/**
 * Change a utilization for a given day. This method assumes the driver is
 * currently viewing a "week review" page.
 *
 * @param {Object} options
 * @param {string} options.name the full name of the employee whose utilization
 *                              should be modified
 * @param {string} options.day  the name of the weekday to modify
 * @param {string} options.type the new utilization type
 */
Driver.prototype.editUtilization = function(options) {
  var driver = this;
  var offset;

  function whenSaved() {
    return waitFor(function() {
        return driver._$('phaseWeek.day.saving')
          .then(function(savingEls) {
            return savingEls[offset].isDisplayed();
          }).then(function(isDisplayed) {
            return !isDisplayed;
          });
      });
  }

  return this.viewUtilizationForm(options).then(function(_offset) {
      offset = _offset;

      return driver._$('phaseWeek.day.typeInput');
    }).then(function(typeInputs) {
      return driver._selectOption(typeInputs[offset], options.type);
    }).then(function() {
      return driver._$('phaseWeek.day.set');
    }).then(function(set) {
      return set[offset].click();
    }).then(whenSaved);
};

/**
 * Select a utilization for a given day and drag it to another utilization.
 *
 * Firefox, Selenium, and/or Leadfoot do not support scripted drag-and-drop
 * interactions.
 * TODO: Find a solution and enable this method.
 *
 * @param {Object} options
 * @param {Object} options.source the utilization to select
 * @param {string} options.source.name the full name of the employee whose
 *                                     utilization should be selected
 * @param {string} options.source.day  the name of the weekday to select
 * @param {Object} options.destination the utilization to which the selected
 *                                     utilization should be dragged
 * @param {string} options.destination.name the full name of the employee whose
 *                                          utilization should be selected
 * @param {string} options.destination.day  the name of the weekday to select
 */
//Driver.prototype.dragUtilization = function(options) {
//  var driver = this;
//  var offset;
//
//  throw new Error('Not implemented.');
//
//  return this._getUtilizationOffset(options.source)
//    .then(function(_offset) {
//      offset = _offset;
//
//      return driver._$('phaseWeek.day.front');
//    }).then(function(days) {
//      return driver._cmd.moveMouseTo(days[offset]);
//    }).then(function() {
//      return driver._cmd.pressMouseButton(0);
//    }).then(function() {
//      return driver._getUtilizationOffset(options.destination);
//    }).then(function(_offset) {
//      offset = _offset;
//
//      return driver._$('phaseWeek.day.front');
//    }).then(function(days) {
//      return driver._cmd.moveMouseTo(days[offset]);
//    }).then(function() {
//      return driver._cmd.moveMouseTo(null, 5, 5);
//    }).then(function() {
//      return driver._cmd.releaseMouseButton(0);
//    });
//};

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

/**
 * Navigate to an adjacent review.
 *
 * @param {string} direction Either "next" or "prev"
 */
Driver.prototype.cycleReview = function(direction) {
  var driver = this;
  var initialWeekStart;

  if (direction !== 'next' && direction !== 'prev') {
    throw new Error('Unrecognized direction: "' + direction + '".');
  }

  return this.read('phaseWeek.weekStart')
    .then(function(text) {
      initialWeekStart = text;

      return driver._$('phaseWeek.nav.' + direction);
    }).then(function(els) {
      var el = els[0];

      if (!el) {
        throw new Error('Cannot navigate to ' + direction + ' review.');
      }

      return el.click();
    }).then(function() {
      return waitFor(function() {
        return driver.read('phaseWeek.weekStart')
          .then(function(newText) {
            return newText && newText !== initialWeekStart;
          });
      });
    });
};
