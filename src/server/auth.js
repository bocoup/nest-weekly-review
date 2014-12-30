'use strict';

var express = require('express');

var token = require('./token');
var debug = require('debug')('auth');

var router = module.exports = express.Router();
var providers = Object.create(null);
providers.github = require('./auth-providers/github');

router.get('/login', function(req, res) {
  var providerName = req.query.provider;
  var provider = providers[providerName];

  if (!providerName) {
    res.status(404).send('Authentication provider not specified.');
    debug('Failed login attempt: no provider');
    return;
  }

  if (!provider) {
    res.status(404).send('Unrecognized provider: "' + providerName +'".');
    debug(
      'Failed login attempt: unrecognized provider (' + providerName + ')'
    );
    return;
  }

  res.writeHead(301, {
    'Content-Type': 'text/plain',
    'Location': provider.url
  });

  res.end('Redirecting to ' + provider.url);
});

router.get('/authorize', function(req, res) {
  var providerName = req.query.provider;
  var provider = providers[providerName];

  if (!providerName) {
    res.status(404).send('Authentication provider not specified.');
    debug('Failed authorization attempt: unspecified provider');
    return;
  }

  if (!provider) {
    res.status(404).send('Unrecognized provider: "' + providerName +'".');
    debug(
      'Failed authorization attempt: unrecognized provider (' + providerName +
      ')'
    );
    return;
  }

  provider.authorize(req, function(err, tokenValue) {
    if (err) {
      res.status(500).send(err.message || err);
      return;
    }

    token.set(req, res, tokenValue);
    res.writeHead(301, { 'Content-Type': 'text/plain', 'Location': '/' });
    res.end();
  });
});

router.get('/logout', function(req, res) {
  token.expire(req, res);
  res.writeHead(301, { 'Content-Type': 'text/plain', 'Location': '/' });
  res.end();
});
