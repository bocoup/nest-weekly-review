'use strict';
var Promise = require('bluebird');

describe('phase review', function() {
  var middleMan, driver;

  before(function() {
    middleMan = this.middleMan;
  });

  beforeEach(function() {
    driver = this.driver;

    this.timeout(30 * 1000);

    return driver.get('/date/2014-12-21/')
      .then(function() {
        return driver.viewWeek(0, 3);
      });
  });

  it('renders as expected', function() {
    return driver.readDays()
      .then(function(days) {
        assert.deepEqual(
          days,
          [
            'MONDAY (12th)', 'TUESDAY (13th)', 'WEDNESDAY (14th)',
            'THURSDAY (15th)', 'FRIDAY (16th)'
          ]
        );
      });
  });

  it('correctly edits an existing single-day utilization', function() {
    function handleDelete(req, res) {
      var id = parseInt(req.params.id, 10);
      assert.equal(id, 5);
      res.end(JSON.stringify({ id: id }));
    }
    function handlePost(req, res) {
      res.end(JSON.stringify({ id: 6 }));
    }
    function handlePut(req, res) {
      res.end();
    }

    return Promise.all([
      middleMan.once('DELETE', '/utilizations/:id', handleDelete),
      middleMan.once('POST', '/utilizations', handlePost),
      // TODO: No PUT requests should be issued in this case. Fix the bug
      // and remove this.
      middleMan.once('PUT', '/utilizations/:id', handlePut),
      driver.editUtilization({
        name: 'Jerry Seinfeld',
        day: 'thursday',
        type: 'Education'
      })
    ]);
  });
});
