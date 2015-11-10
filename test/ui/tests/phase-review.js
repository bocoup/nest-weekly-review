'use strict';
var Promise = require('bluebird');

describe('phase review', function() {
  var middleMan, driver;
  this.timeout(8 * 1000);

  before(function() {
    middleMan = this.middleMan;
  });

  beforeEach(function() {
    driver = this.driver;

    this.timeout(30 * 1000);

    return driver.get('/date/2014-12-21/');
  });

  describe('new review', function() {
    describe('rendering', function() {
      it('renders as expected', function() {
        return driver.viewWeek(1, 3)
          .then(function() {
            return driver.readAll('phaseWeek.dayLabels');
          }).then(function(days) {
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

            return driver.readAll('phaseWeek.day.front.leaveRequestType');
          }).then(function(leaveRequestTypes) {
            assert.equal(leaveRequestTypes[0], 'PTO');
            assert.equal(leaveRequestTypes[1], 'PTO');
            assert.equal(leaveRequestTypes[2], 'PTO');
            assert.equal(leaveRequestTypes[3], '');
            assert.equal(leaveRequestTypes[4], '');
            assert.equal(leaveRequestTypes[5], '');
            assert.equal(leaveRequestTypes[6], '');
            assert.equal(leaveRequestTypes[7], '');
            assert.equal(leaveRequestTypes[8], '');
            assert.equal(leaveRequestTypes[9], '');

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
              text.leaveRequestType,
              'Leave Request Type',
              'Form renders correctly when initialized with a phaseless project'
            );
            assert.equal(
              text.initiative,
              'none',
              'Form renders correctly when initialized with a phaseless project'
            );
            assert.equal(
              text.project,
              'The Human Fund - Fundraising Drive',
              'Form renders correctly when initialized with a phaseless project'
            );
            assert.equal(
              text.phase,
              'Select Phase',
              'Form renders correctly when initialized with a phaseless project'
            );
          });
      });

      it('renders as expected', function() {
        return driver.viewWeek(0, 2)
          .then(function() {
            return driver.read('phaseWeek.weekStart');
          }).then(function(weekStart) {
            assert.equal(weekStart, '1 / 5 / 2015');

            return driver.cycleReview('prev');
          }).then(function() {
            return driver.read('phaseWeek.weekStart');
          }).then(function(weekStart) {
            assert.equal(weekStart, '12 / 29 / 2014');

            return driver.readAll('phaseWeek.day.front.phase');
          }).then(function(phases) {
            assert.equal(
              phases.length,
              2,
              'Does not display utilizations from other calendars'
            );
            assert.equal(phases[0], 'Make pudding');
            assert.equal(phases[1], 'Make pudding');
          });
      });
    });

    describe('DST boundary', function() {
      beforeEach(function() {
        return driver.get('/date/2015-11-01/')
          .then(function() {
            return driver.viewWeek(0, 0);
          });
      });

      it('renders as expected', function() {
        return driver.readAll('phaseWeek.dayLabels')
          .then(function(days) {
            assert.deepEqual(
              days,
              [
                'MONDAY (2nd)', 'TUESDAY (3rd)', 'WEDNESDAY (4th)',
                'THURSDAY (5th)', 'FRIDAY (6th)'
              ]
            );
          });
      });

      it('correctly splits an existing multi-day utilization', function() {
        var putCount = 0;
        var postCount = 0;
        function handlePut(req, res) {
          res.end();
          assert.strictEqual(
            postCount, 0, 'Issues all `PUT` requests prior to `POST` requests.'
          );
          putCount += 1;
        }
        function handlePost(req, res) {
          res.end();
          assert.strictEqual(
            putCount, 1, 'Issues all `POST` requests following `PUT` requests.'
          );
          postCount += 1;
        }

        return Promise.all([
            middleMan.once('PUT', '/v1/utilizations/:id', handlePut),
            middleMan.once('POST', '/v1/utilizations', handlePost),
            driver.editUtilization({
              name: 'Jerry Seinfeld',
              day: 'monday',
              type: 'Education'
            })
          ]);
      });
    });

    describe('editing', function() {
      beforeEach(function() {
        return driver.viewWeek(1, 3);
      });

      it('correctly edits an existing single-day utilization', function() {
        var hasDeleted = false;
        function handleDelete(req, res) {
          hasDeleted = true;
          res.end();
        }
        function handlePost(req, res) {
          assert(
            hasDeleted, 'Deletes old utilization before creating new one.'
          );
          res.end(JSON.stringify({ utilizations: { id: 99 } }));
        }

        return Promise.all([
            middleMan.once('DELETE', '/v1/utilizations/5', handleDelete),
            middleMan.once('POST', '/v1/utilizations', handlePost),
            driver.editUtilization({
              name: 'Jerry Seinfeld',
              day: 'thursday',
              type: 'Education'
            })
          ]).then(function() {
            /**
             * Edit the new utilization to ensure that the application
             * correctly tracks IDs of the utilizations created on its behalf.
             */
            hasDeleted = false;

            return Promise.all([
                middleMan.once('DELETE', '/v1/utilizations/99', handleDelete),
                middleMan.once('POST', '/v1/utilizations', handlePost),
                driver.editUtilization({
                  name: 'Jerry Seinfeld',
                  day: 'thursday',
                  type: 'Perch'
                })
              ]);
          });
        /**
         * Firefox, Selenium, and/or Leadfoot do not support scripted
         * drag-and-drop interactions.
         * TODO: Find a solution and enable this logic.
         */
        // }).then(function() {
        //   function handlePut(req, res) {
        //     res.end();
        //   }
        //   return Promise.all([
        //       middleMan.once('PUT', '/utilizations/:id', handlePut),
        //       middleMan.once('PUT', '/utilizations/:id', handlePut),
        //       driver.dragUtilization({
        //         source: {
        //           name: 'Jerry Seinfeld',
        //           day: 'thursday'
        //         },
        //         destination: {
        //           name: 'Jerry Seinfeld',
        //           day: 'wednesday'
        //         }
        //       })
        //     ]);
        // });
      });

      /**
       * The application should update existing utilizations *before* creating
       * new utilizations. The reverse order will be rejected by the server
       * because it would require the database temporarily enter an invalid
       * state.
       */
      it('correctly splits an existing multi-day utilization', function() {
        var hasPut = false;
        function handlePut(req, res) {
          assert.equal(req.params.id, 7);
          hasPut = true;
          res.end();
        }
        function handlePost(req, res) {
          assert(
            hasPut, 'Updates existing models before creaating new models'
          );
          res.end();
        }

        return Promise.all([
            middleMan.once('PUT', '/v1/utilizations/:id', handlePut),
            middleMan.once('POST', '/v1/utilizations', handlePost),
            middleMan.once('POST', '/v1/utilizations', handlePost),
            driver.editUtilization({
              name: 'Cosmo Kramer',
              day: 'tuesday',
              type: 'Perch'
            })
          ]).then(function() {
            return driver.count('phaseWeek.verified');
          }).then(function(count) {
            assert.equal(
              count,
              0,
              'Developer weeks become "unverified" when utilization data is ' +
                'changed'
            );
          });
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
              middleMan.once('POST', '/v1/project-phase-reviews', handleReviewPost),
              middleMan.once('PUT', '/v1/utilizations/4', handleRequest),
              middleMan.once('PUT', '/v1/utilizations/5', handleRequest),
              middleMan.once('PUT', '/v1/utilizations/6', handleRequest),
              middleMan.once('POST', '/v1/utilizations', handleUtilizationPost),
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
              middleMan.once('PUT', '/v1/project-phase-reviews/3454', handleRequest),
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
            middleMan.once('PUT', '/v1/project-phase-reviews/1', handleRequest),
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
            middleMan.once('POST', '/v1/project-phase-reviews', handleRequest),
            middleMan.once('PUT', '/v1/utilizations/2', handleRequest),
            middleMan.once('PUT', '/v1/utilizations/3', handleRequest),
            middleMan.once('POST', '/v1/utilizations', handleRequest),
            middleMan.once('POST', '/v1/utilizations', handleRequest),
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

  it('allows verification of developer weeks that begin on a DST boundary', function() {
    var initialVerifiedCount;

    return driver.get('/date/2015-03-08/')
      .then(function() {
        return driver.viewWeek(0, 0);
      }).then(function() {
        return driver.count('phaseWeek.verified');
      }).then(function(verifiedCount) {
        initialVerifiedCount = verifiedCount;

        return driver.verify(['Jerry Seinfeld']);
      }).then(function() {
        return driver.count('phaseWeek.verified');
      }).then(function(verifiedCount) {
        assert.equal(
          verifiedCount,
          initialVerifiedCount + 1,
          'Employee successfully verified'
        );
      });
  });
});
