'use strict';
var isDate = require('lodash.isdate');
var timezoneRE = /Z|[-+]\d\d:\d\d/;

module.exports = {
  set: function (newVal) {
    var date;

    if (isDate(newVal)) {
      date = newVal;
    } else {
      date = new Date(newVal);
    }

    return {
      val: date.toISOString().replace(/T.*$/, ''),
      type: 'dateStr'
    };
  },
  get: function (val) {
    var date = new Date(val);

    if (isNaN(Number(val)) && !timezoneRE.test(val)) {
      date = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    }

    return date;
  },
  default: function () {
    return new Date();
  }
};
