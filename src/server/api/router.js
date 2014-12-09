/**
 * @file - Temporary set of endpoints for fetching fixture data.
 */
'use strict';
var express = require('express');

var phaseData = require('./fixture-data/phases.json');

var router = module.exports = express.Router();

router.get('/phases', function(req, res) {
  res.json(phaseData);
});

router.get('/phase/:id', function(req, res) {
  var id = parseInt(req.params.id, 10);
  var phase = null;

  phaseData.some(function(_phase) {
    if (_phase.id === id) {
      phase = _phase;
      return true;
    }
  });

  res.json(phase);
});
