'use strict';
var http = require('http');
var Promise = require('bluebird');

var retryCount = 5;
var retryPeriod = 300;

function isRunning(port) {
  return new Promise(function(resolve, reject) {
    http.get({ host: 'localhost', port: port }, function() {
      resolve();
    }).on('error', function(err) {
      reject(err);
    });
  });
}

var poll = module.exports = function(port, count) {
  return isRunning(port).then(null, function() {
    count = (count || 0) + 1;
    if (count < retryCount) {

      return new Promise(function(resolve) {
        setTimeout(resolve, retryPeriod);
      }).then(poll.bind(null, port, count));
    } else {
      throw new Error(
        'Could not detect server at port ' + port + ' after ' + retryCount +
        ' attempts.'
      );
    }
  });
};
