'use strict';

/**
 * Calculate the week number described by the given date.
 *
 * @param {Date} date
 *
 * @returns {number}
 */
exports.fromDate = function(date) {
  var yearBegin = new Date(date.getFullYear(), 0, 1);
  var weekBegin = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  weekBegin.setTime(
    weekBegin.getTime() - weekBegin.getDay() * 24 * 60 * 60 * 1000
  );
  var dayCount = (weekBegin.getTime() - yearBegin.getTime()) / (24 * 60 * 60 * 1000);

  return Math.floor((dayCount - yearBegin.getDay()) / 7);
};

/**
 * Generate a Date object describing the day of a given year.
 *
 * @param {number} year
 * @param {number} week
 *
 * @returns {Date}
 */
exports.toDate = function(year, week) {
  var yearBegin = new Date(year, 0, 1);
  var firstDay = yearBegin.getDay();
  var firstSunday = firstDay === 0 ? 0 : (7 - firstDay);
  var weekBegin = new Date(year, 0, 1 + firstSunday);

  return new Date(
    weekBegin.getTime() + week * 7 * 24 * 60 * 60 * 1000
  );
};
