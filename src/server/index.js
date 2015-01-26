'use strict';

var debug = require('debug')('main');
var express = require('express');
var port = process.env.NODE_PORT = process.env.NODE_PORT || 8000;

var app = express();

app.use(require('./push-state'));
app.get('/modules/main.js', require('./serve-app'));
app.use(express.static(__dirname + '/../client'));

var server = app.listen(port, function() {
  debug('Server listening on port ' + server.address().port);
});
