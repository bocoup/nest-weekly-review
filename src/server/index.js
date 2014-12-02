'use strict';

var http = require('http');

var debug = require('debug')('main');
var express = require('express');

var app = express();

app.use(express.static(__dirname + '/../client'));

var server = app.listen(8000, function() {
  debug('Server listening on port ' + server.address().port);
});
