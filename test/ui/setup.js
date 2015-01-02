'use strict';

var Promise = require('bluebird');
var Server = require('leadfoot/Server');
var Command = require('leadfoot/Command');
var chai = require('chai');

var Driver = require('./driver');
var API = require('../mock-api/api');
var startSelenium = require('./util/start-selenium');
var startApplication = require('./util/start-application');
var seleniumPort = 4444;
var applicationPort = 8003;
var apiPort = 4023;
var quitSelenium, quitApplication, command, api;

global.assert = chai.assert;
chai.use(require('chai-datetime'));

beforeEach(function() {
  var testCtx = this;

  this.timeout(10 * 1000);

  return startSelenium(seleniumPort).then(function(quit) {
    quitSelenium = quit;
    return startApplication(applicationPort, apiPort);
  }).then(function(quit) {
    var server, capabilities;

    quitApplication = quit;

    server = new Server('http://localhost:' + seleniumPort + '/wd/hub');
    capabilities = {
      browserName: 'firefox'
    };

    return server.createSession(capabilities);
  }).then(function(session) {
    var driver;

    command = new Command(session);
    driver = testCtx.driver = new Driver({
      command: command,
      root: 'http://localhost:' + applicationPort
    });

    api = testCtx.api = new API();

    return api.listen(apiPort);
  });
});

afterEach(function() {
  return Promise.resolve()
    .then(function() {
      if (command) {
        return command.quit();
      }
    }).then(function() {
      if (quitSelenium) {
        return quitSelenium();
      }
    }).then(function() {
      if (quitApplication) {
        return quitApplication();
      }
    }).then(function() {
      if (api) {
        return api.destroy();
      }
    });
});
