'use strict';
var DAY_MS = 1000 * 60 * 60 * 24;
var WEEK_MS = 7 * DAY_MS;

/**
 * Calculate the zero-indexed week number described by the given date. The
 * first Sunday of a year marks that year's first week--some dates may belong
 * to a week in the previous year (i.e. January 1, 2014).
 *
 * @param {Date} date
 *
 * @returns {object} Object with numeric `week` and `year` properties
 *                   describing the given date
 */
exports.fromDate = function(date) {
  var yearBegin = new Date(date.getFullYear(), 0, 1);
  var weekBegin = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  weekBegin.setTime(
    weekBegin.getTime() - weekBegin.getDay() * DAY_MS
  );
  var dayOffset, week;

  // If the week began on a date in the previous year, the week offset should
  // be calculated in terms of that year.
  if (weekBegin.getTime() < yearBegin.getTime()) {
    yearBegin.setFullYear(yearBegin.getFullYear() - 1);
  }

  // This value must be rounded to account for dates where daylight savings
  // time is in effect.
  dayOffset = Math.round((weekBegin.getTime() - yearBegin.getTime()) / DAY_MS);

  if (dayOffset < yearBegin.getDay()) {
    week = 0;
  } else {
    week = Math.floor((dayOffset - (7 - yearBegin.getDay())) / 7);
  }

  return {
    year: yearBegin.getFullYear(),
    week: week
  };
};

/**
 * Generate a Date object describing the first day of a given week (as defined
 * by a year and the week's zero-indexed offset within that year).
 *
 * @param {number} year
 * @param {number} week - zero-indexed offset
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

/**
 * Calculate the number of weeks between two dates.
 *
 * @param {Date} first
 * @param {Date} second
 *
 * @returns {number}
 */
exports.between = function(first, second) {
  return (second.getTime() - first.getTime()) / WEEK_MS;
};
