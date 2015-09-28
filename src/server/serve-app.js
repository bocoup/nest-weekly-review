'use strict';

var fs = require('fs');
var src;

try {
  src = fs.readFileSync('./app-production.js', { encoding: 'utf-8' });
} catch(err) {
  throw new Error(
    'Unable to read production build of application. Please run `npm run ' +
    'build`.'
  );
}

module.exports = function(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(src);
};
