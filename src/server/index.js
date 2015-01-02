'use strict';
var url = require('url');

var debug = require('debug')('main');
var express = require('express');
var browserifyMiddleware = require('browserify-middleware');
var port = process.env.NODE_PORT || 8000;

var buildApplication = browserifyMiddleware(
    __dirname + '/../client/modules/main.js',
    {
      transform: [
        require('./transforms/css'),
        require('./transforms/ractive'),
        require('envify')
      ]
    }
  );
var app = express();

if (process.env.NODE_ENV === 'production') {
  debug('Serving optimized application.');

  app.use('/modules/main.js', function(req, res) {
    res.sendFile('./app-production.js', { root: '.' });
  });
} else {
  app.use('/modules/main.js', buildApplication);
}

app.use('/auth', require('./auth'));

// Re-write directory requests to the project root. The client-side code served
// from the index is capable of rendering the correct page based on the initial
// URL. This enables direct access (via external link) to specific application
// pages.
app.use(function(req, res, next) {
  var parts;
  if (/\/$/.test(req.path)) {
    parts = url.parse(req.url);
    parts.pathname = '/';
    req.url = url.format(parts);
  }
  next();
});

app.use(express.static(__dirname + '/../client'));

var server = app.listen(port, function() {
  debug('Server listening on port ' + server.address().port);
});
