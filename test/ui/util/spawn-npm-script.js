'use strict';

var spawn = require('child_process').spawn;

/**
 * Create a new process using `child_process.spawn` according to the script
 * specified by an npm `package.json` file.
 *
 * @param {string} packageFile - path to the `package.json` file
 * @param {string} name - script to run
 * @param {object} [options] - options forwarded to `child_process.spawn`
 *
 * @returns {process} - the spawned child process
 */
module.exports = function(packageFile, name, options) {
  var pkg = require(packageFile);
  var command;

  if (!pkg.scripts || !pkg.scripts[name]) {
    throw new Error(
      'The provided `package.json` file does not define a "' + name +
      '" script.'
    );
  }

  command = pkg.scripts[name].split(/\s+/);

  return spawn(command[0], command.slice(1), options);
};
