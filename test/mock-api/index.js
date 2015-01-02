'use strict';

var API = require('./api');
var port = process.env.NODE_PORT || 4000;

var api = new API();

api.listen(port).then(function() {
  console.log('Mock API server listening on port ' + port);
});
