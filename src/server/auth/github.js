'use strict';

var express = require('express');
var octonode = require('octonode');

var setToken = require('../token').set;

var router = module.exports = express.Router();

// TODO: Define this according to `process.env.NODE_ENV`
var githubCreds = require('../../../config/secrets/github.json')['black-phoenix'].production;
var REQUIRED_SCOPES = ['read:org'];
var authUrl = octonode.auth.config({
  id: githubCreds.clientId,
  secret: githubCreds.clientSecret
}).login(REQUIRED_SCOPES);
var stateMatch = authUrl.match(/&state=([0-9a-z]{32})/i);
var expectedState;

if (!stateMatch) {
  throw new Error(
    'Unable to parse `state` variable from generated callback URL.'
  );
}

expectedState = stateMatch[1];

router.get('/login', function(req, res) {
  res.writeHead(301, {
    'Content-Type': 'text/plain',
    'Location': authUrl
  });

  res.end('Redirecting to ' + authUrl);
});

router.get('/authorize', function(req, res) {
  // Guard against CSRF attacks
  if (req.query.state !== expectedState) {
    res.writeHead(403, {'Content-Type': 'text/plain'});
    res.end('');
    return;
  }

  octonode.auth.login(req.query.code, function (err, token) {
    setToken(req, res, token);
    res.writeHead(301, { 'Content-Type': 'text/plain', 'Location': '/' });
    res.end();
  });
});
