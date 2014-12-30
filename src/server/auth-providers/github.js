'use strict';

var octonode = require('octonode');

var credentials = require(
    '../../../config/secrets/github.json'
  )['black-phoenix'].production;
var REQUIRED_SCOPES = ['read:org'];
var authUrl = octonode.auth.config({
  id: credentials.clientId,
  secret: credentials.clientSecret
}).login(REQUIRED_SCOPES);
var stateMatch = authUrl.match(/&state=([0-9a-z]{32})/i);
var expectedState;

if (!stateMatch) {
  throw new Error(
    'Unable to parse `state` variable from generated callback URL.'
  );
}

expectedState = stateMatch[1];
exports.url = authUrl;

exports.authorize = function(req, done) {
  // Guard against CSRF attacks
  if (req.query.state !== expectedState) {
    done(new Error('Unrecognized request origin.'));
    return;
  }

  octonode.auth.login(req.query.code, done);
};
