'use strict';

var http = require('http');
var debug = require('debug')('main');

var server = http.createServer(function(req, res) {
  res.writeHead('200', { 'Content-Type': 'text/plain' });
  res.end('Hello, world!');
});

server.listen(8000, function() {
  debug('Server listening on port ' + server.address().port);
});
