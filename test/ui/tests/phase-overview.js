'use strict';

var ONE_DAY = 1000 * 60 * 60 * 24;
var Promise = require('bluebird');

describe('phase overview', function() {
  var datePattern = /(\d+)\s*\/\s*(\d+)/;
  var driver, middleMan;

  before(function() {
    middleMan = this.middleMan;
  });

  beforeEach(function() {
    driver = this.driver;
  });

  describe('index page', function() {
    var query;

    beforeEach(function() {
      this.timeout(30 * 1000);
      function handlePhaseRequest(req, res) {
        query = req.query;
        res.end(
          JSON.stringify({})
        );
      }
      return Promise.all([
        middleMan.once('GET', '/project-phases', handlePhaseRequest),
        driver.get('/')
      ]);
    });

    it('displays the current week according to the local system time', function() {
      var today = new Date();
      var prevSunday, fiveWeeks;

      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);

      prevSunday = new Date(today.getTime() - ONE_DAY * today.getDay());
      fiveWeeks = new Date(prevSunday.getTime() + ONE_DAY * 7 * 5);

      assert.equal(
        query.after, prevSunday.toISOString().replace(/T.*/, '')
      );
      assert.equal(
        query.before, fiveWeeks.toISOString().replace(/T.*/, '')
      );

      return driver.read('title')
        .then(function(text) {
          assert.equal(text, 'Weekly Review', 'Application title visible');
        })
        .then(function() {
          return driver.readAll('phaseTable.weekLabels');
        })
        .then(function(labels) {
          var now = new Date();
          var lastSunday = new Date(now.getTime() - now.getDay() * ONE_DAY);
          var match = datePattern.exec(labels[0]);

          assert(match, 'Has a date string in the expected location');
          assert.equal(match[1], lastSunday.getMonth() + 1, 'correct month');
          assert.equal(match[2], lastSunday.getDate(), 'correct day');
        });
    });
  });

  describe('specific date', function() {
    beforeEach(function() {
      this.timeout(30 * 1000);

      return driver.get('/date/2014-12-21/');
    });

    it('displays the active phases at the given date', function() {
      return driver.readAll('phaseTable.weekLabels')
        .then(function(labels) {
          var match;

          match = datePattern.exec(labels[0]);
          assert(match, 'Has a date string in the expected location');
          assert.equal(match[1], 12);
          assert.equal(match[2], 21);

          match = datePattern.exec(labels[1]);
          assert(match, 'Has a date string in the expected location');
          assert.equal(match[1], 12);
          assert.equal(match[2], 28);

          match = datePattern.exec(labels[2]);
          assert(match, 'Has a date string in the expected location');
          assert.equal(match[1], 1);
          assert.equal(match[2], 4);

          match = datePattern.exec(labels[3]);
          assert(match, 'Has a date string in the expected location');
          assert.equal(match[1], 1);
          assert.equal(match[2], 11);

          match = datePattern.exec(labels[4]);
          assert(match, 'Has a date string in the expected location');
          assert.equal(match[1], 1);
          assert.equal(match[2], 18);
        });
    });
  });
});
