'use strict';
var isDate = require('lodash.isdate');
var timezoneRE = /Z|[-+]\d\d:\d\d/;
var moment = require('moment');

module.exports = {
  set: function (newVal) {
    var date;

    if (isDate(newVal)) {
      date = newVal;
    } else {
      date = moment.utc(newVal).toDate();
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
