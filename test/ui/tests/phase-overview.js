'use strict';

var ONE_DAY = 1000 * 60 * 60 * 24;

describe('phase overview', function() {
  var datePattern = /(\d+)\s*\/\s*(\d+)/;
  var driver;

  beforeEach(function() {
    driver = this.driver;
  });

  describe('index page', function() {
    beforeEach(function() {
      this.timeout(5 * 1000);
      return driver.get('/');
    });

    it('renders the application title', function() {
      return driver.read('index.title')
        .then(function(text) {
          assert.equal(text, 'Black Phoenix');
        });
    });

    it('displays the current week according to the current system time', function() {
      var now = new Date();
      var lastSunday = new Date(now.getTime() - now.getDay() * ONE_DAY);

      return driver.read('index.weekLabels')
        .then(function(labels) {
          var match = datePattern.exec(labels[0]);

          assert(match, 'Has a date string in the expected location');
          assert.equal(match[1], lastSunday.getMonth() + 1, 'correct month');
          assert.equal(match[2], lastSunday.getDate(), 'correct day');
        });
    });
  });

  describe('specific phase', function() {
    beforeEach(function() {
      this.timeout(5 * 1000);
      return driver.get('/year/2014/week/50/');
    });

    it('displays the correct weeks for a given URL', function() {
      return driver.read('index.weekLabels')
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
