'use strict';
var DAY_MS = 1000 * 60 * 60 * 24;
var WEEK_MS = 7 * DAY_MS;

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
    weekBegin.getTime() - weekBegin.getDay() * DAY_MS
  );
  var dayOffset;

  // If the week began on a date in the previous year, the week offset should
  // be calculated in terms of that year.
  if (weekBegin.getTime() < yearBegin.getTime()) {
    yearBegin.setFullYear(yearBegin.getFullYear() - 1);
  }

  // This value must be rounded to account for dates where daylight savings
  // time is in effect.
  dayOffset = Math.round((weekBegin.getTime() - yearBegin.getTime()) / DAY_MS);

  if (dayOffset < yearBegin.getDay()) {
    return 0;
  }

  return Math.floor((dayOffset - (7 - yearBegin.getDay())) / 7);
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

  return new Date(weekBegin.getTime() + week * WEEK_MS);
};
