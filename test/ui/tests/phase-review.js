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

    return driver.get('/date/2014-12-21/');
  });

  describe('new review', function() {

    beforeEach(function() {
      return driver.viewWeek(1, 3);
    });

    it('renders as expected', function() {
      return driver.readAll('phaseWeek.dayLabels')
        .then(function(days) {
          assert.deepEqual(
            days,
            [
              'MONDAY (12th)', 'TUESDAY (13th)', 'WEDNESDAY (14th)',
              'THURSDAY (15th)', 'FRIDAY (16th)'
            ]
          );

          return driver.read('phaseWeek.weekStart');
        }).then(function(weekStart) {
          assert.equal(weekStart, '1 / 12 / 2015');

          return driver.count('phaseWeek.verified');
        }).then(function(count) {
          assert.equal(
            count,
            1,
            'Verification information reflects initial utilization state'
          );

          return driver.readAll('phaseWeek.day.front.phase');
        }).then(function(phases) {
          assert.equal(phases[0], 'Make pudding');
          assert.equal(phases[6], 'Extract pudding skin');

          return driver.viewUtilizationForm({
            name: 'Jerry Seinfeld',
            day: 'thursday'
          });
        }).then(function() {
          return driver.readUtilizationForm({
            name: 'Jerry Seinfeld',
            day: 'thursday'
          });
        }).then(function(text) {
          assert.equal(
            text.type,
            'Education',
            'Form renders correctly when initialized with a phaseless project'
          );
          assert.equal(
            text.project,
            'Fundraising Drive',
            'Form renders correctly when initialized with a phaseless project'
          );
          assert.equal(
            text.phase,
            'Select Phase',
            'Form renders correctly when initialized with a phaseless project'
          );
        });
    });

    it('correctly edits an existing single-day utilization', function() {
      var hasDeleted = false;
      function handleDelete(req, res) {
        hasDeleted = true;
        res.end();
      }
      function handlePost(req, res) {
        assert(hasDeleted, 'Deletes old utilization before creating new one.');
        res.end(JSON.stringify({ utilizations: { id: 99 } }));
      }

      return Promise.all([
          middleMan.once('DELETE', '/utilizations/5', handleDelete),
          middleMan.once('POST', '/utilizations', handlePost),
          driver.editUtilization({
            name: 'Jerry Seinfeld',
            day: 'thursday',
            type: 'Education'
          })
        ]).then(function() {
          /**
           * Edit the new utilization to ensure that the application correctly
           * tracks IDs of the utilizations created on its behalf.
           */
          hasDeleted = false;

          return Promise.all([
              middleMan.once('DELETE', '/utilizations/99', handleDelete),
              middleMan.once('POST', '/utilizations', handlePost),
              driver.editUtilization({
                name: 'Jerry Seinfeld',
                day: 'thursday',
                type: 'Vacation'
              })
            ]);
        });
        /**
         * Firefox, Selenium, and/or Leadfoot do not support scripted
         * drag-and-drop interactions.
         * TODO: Find a solution and enable this logic.
         */
        //}).then(function() {
        //  function handlePut(req, res) {
        //    res.end();
        //  }
        //  return Promise.all([
        //      middleMan.once('PUT', '/utilizations/:id', handlePut),
        //      middleMan.once('PUT', '/utilizations/:id', handlePut),
        //      driver.dragUtilization({
        //        source: {
        //          name: 'Jerry Seinfeld',
        //          day: 'thursday'
        //        },
        //        destination: {
        //          name: 'Jerry Seinfeld',
        //          day: 'wednesday'
        //        }
        //      })
        //    ]);
        //});
    });

    /**
     * The application should update existing utilizations *before* creating new
     * utilizations. The reverse order will be rejected by the server because it
     * would require the database temporarily enter an invalid state.
     */
    it('correctly splits an existing multi-day utilization', function() {
      var hasPut = false;
      function handlePut(req, res) {
        assert.equal(req.params.id, 4);
        hasPut = true;
        res.end();
      }
      function handlePost(req, res) {
        assert(hasPut, 'Updates existing models before creaating new models');
        res.end();
      }

      return Promise.all([
          middleMan.once('PUT', '/utilizations/:id', handlePut),
          middleMan.once('POST', '/utilizations', handlePost),
          middleMan.once('POST', '/utilizations', handlePost),
          driver.editUtilization({
            name: 'Jerry Seinfeld',
            day: 'tuesday',
            type: 'Vacation'
          })
        ]);
    });

    it('correctly submits a review', function() {
      this.timeout(8000);
      function handleRequest(req, res) {
        res.end();
      }
      function abort() {
        throw new Error(
          'No requests should be issued until all employees have been verified.'
        );
      }

      return driver.addNote('Everyone did a nice job')
        .then(function() {
          middleMan.on('*', /.*/, abort);
          return driver.submitReview();
        }).then(function() {
          return driver.verify(['Jerry Seinfeld']);
        }).then(function() {
          function handleReviewPost(req, res) {
            res.end(JSON.stringify({ 'project-phase-reviews': { id: 3454 } }));
          }
          function handleUtilizationPost(req, res) {
            res.end(JSON.stringify({ utilizations: { id: 3333 } }));
          }

          middleMan.off('*', abort);

          return Promise.all([
            middleMan.once('POST', '/project-phase-reviews', handleReviewPost),
            middleMan.once('PUT', '/utilizations/4', handleRequest),
            middleMan.once('PUT', '/utilizations/5', handleRequest),
            middleMan.once('PUT', '/utilizations/6', handleRequest),
            middleMan.once('POST', '/utilizations', handleUtilizationPost),
            driver.submitReview()
          ]);
        }).then(function() {
          return driver.count('phaseWeek.verified');
        }).then(function(count) {
          assert.equal(
            count,
            2,
            'Verification information reflects recently-completed operations'
          );
        }).then(function() {

          // Ensure that reviews created by the user in the current browsing
          // session can be updated.
          return driver.addNote('. And Bocoup is great.');
        }).then(function() {
          return Promise.all([
            middleMan.once('PUT', '/project-phase-reviews/3454', handleRequest),
            driver.submitReview()
          ]);
        }).then(function() {
          return driver.cycleReview('next');
        }).then(function() {
          return driver.count('phaseWeek.verified');
        }).then(function(count) {
          assert.equal(
            count, 1, 'Verification information is refreshed after navigation'
          );
        });
    });
  });

  describe('previously-existing review', function() {
    beforeEach(function() {
      return driver.viewWeek(0, 4);
    });

    it('correctly updates review', function() {
      function handleRequest(req, res) {
        res.end();
      }

      return driver.addNote('. And Bocoup is great.')
        .then(function() {
          return Promise.all([
            middleMan.once('PUT', '/project-phase-reviews/1', handleRequest),
            driver.submitReview()
          ]);
        });
    });
  });

  describe('review with utilizations that require "trimming"', function() {
    beforeEach(function() {
      return driver.viewWeek(0, 2);
    });

    it('correctly submits a review', function() {
      this.timeout(8000);

      return driver.addNote('Everyone did a nice job')
        .then(function() {
          return driver.verify(['Jerry Seinfeld']);
        }).then(function() {
          function handleRequest(req, res) {
            res.end();
          }

          return Promise.all([
            middleMan.once('POST', '/project-phase-reviews', handleRequest),
            middleMan.once('PUT', '/utilizations/2', handleRequest),
            middleMan.once('PUT', '/utilizations/3', handleRequest),
            middleMan.once('POST', '/utilizations', handleRequest),
            middleMan.once('POST', '/utilizations', handleRequest),
            driver.submitReview()
          ]);
        });
    });
  });

  it('disallows verification of developer weeks with unset utilizations', function() {
    var initialVerifiedCount;
    return driver.viewWeek(1, 4)
      .then(function() {
        return driver.count('phaseWeek.verified');
      }).then(function(verifiedCount) {
        initialVerifiedCount = verifiedCount;

        return driver.verify(['Cosmo Kramer']);
      }).then(function() {
        return driver.count('notifications.error');
      }).then(function(errorCount) {
        assert.equal(errorCount, 1, 'An error is displayed to the user');
        return driver.count('phaseWeek.verified');
      }).then(function(verifiedCount) {
        assert.equal(
          verifiedCount,
          initialVerifiedCount,
          'Failed verification attempts are not reflected in the DOM'
        );
      });
  });
});
