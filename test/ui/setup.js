'use strict';

var Promise = require('bluebird');
var Server = require('leadfoot/Server');
var Command = require('leadfoot/Command');
var chai = require('chai');
/**
 * The `replay` module will intercept requests to external URLs and substitute
 * cached responses.
 * https://github.com/assaf/node-replay
 */
var replay = require('replay');

var Driver = require('./driver');
var startSelenium = require('./util/start-selenium');
var startApplication = require('./util/start-application');
var MiddleMan = require('./util/middle-man');

var seleniumPort = 4444;
var applicationPort = 8003;
var apiUrl = 'http://api.loc';
var proxyPort = 4023;
var middleMan, quitSelenium, quitApplication, command;

global.assert = chai.assert;
chai.use(require('chai-datetime'));

function handleCors(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}

function handleCorsPreflight(req, res) {
  res.setHeader(
    'Access-Control-Allow-Headers',
    'authorization, authorization, content-type'
  );
  res.setHeader(
    'Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE'
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Vary', 'Origin');

  res.end('');
}

before(function() {
  middleMan = this.middleMan = new MiddleMan();
  this.timeout(20 * 1000);
  replay.allow('ocsp.digicert.com');
  replay.fixtures = __dirname + '/fixtures';

  return middleMan.listen(proxyPort)
    .then(function() {
      return startApplication(applicationPort, apiUrl);
    }).then(function(quit) {
      quitApplication = quit;
      return startSelenium(seleniumPort);
    }).then(function(quit) {
      quitSelenium = quit;
    });
});

beforeEach(function() {
  var server, capabilities;

  this.middleMan.on('*', /.*/, handleCors);
  this.middleMan.on('OPTIONS', /.*/, handleCorsPreflight);
  this.timeout(10 * 1000);

  server = new Server('http://localhost:' + seleniumPort + '/wd/hub');
  capabilities = {
    browserName: 'firefox',
    proxy: {
      proxyType: 'manual',
      httpProxy: 'localhost:' + proxyPort
    }
  };

  return server.createSession(capabilities).then(function(session) {
    command = new Command(session);

    this.driver = new Driver({
      command: command,
      root: 'http://localhost:' + applicationPort
    });
  }.bind(this));
});

afterEach(function() {
  if (command) {
    return command.quit().then(function() {
      command = null;
    });
  }
});

/**
 * Unbind event handlers *after* Selenium session is closed because the browser
 * may still be issuing requests after the test completes.
 */
afterEach(function() {
  this.middleMan.off();
});

after(function() {
  return Promise.resolve()
    .then(function() {
      if (quitSelenium) {
        return quitSelenium();
      }
    }).then(function() {
      if (quitApplication) {
        return quitApplication();
      }
    }).then(function() {
      return middleMan.close();
    });
});

/**
 * Forcibly abort any child processes in case of abupt program termination
 * (e.g.  a SIGTERM event issued by the user).
 */
process.on('exit', function() {
  try {
    quitSelenium();
  } catch(err) {}
  try {
    quitApplication();
  } catch(err) {}
});
