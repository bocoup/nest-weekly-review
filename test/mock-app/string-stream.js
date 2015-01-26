'use strict';
var util = require('util');
var ReadStream = require('stream').Readable;

/**
 * A readable stream whose contents are defined entirely at initialization
 * time.
 *
 * @constructor
 *
 * @param {string} src - The contents of the stream
 */
function StringStream(src) {
  ReadStream.call(this);

  this.push(src);
  this.push(null);
}

module.exports = StringStream;

util.inherits(StringStream, ReadStream);

StringStream.prototype._read = StringStream.prototype.write = function() {};
