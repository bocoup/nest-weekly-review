/**
 * @file - Temporary set of endpoints for fetching fixture data.
 */
'use strict';
var express = require('express');

var phaseData = require('./fixture-data/phases.json');
var positionData = require('./fixture-data/positions.json');
var utilizationData = require('./fixture-data/utilizations.json');
var utilizationTypeData = require('./fixture-data/utilization-types.json');

var router = module.exports = express.Router();

router.get('/project_phases', function(req, res) {
  res.json(phaseData);
});

router.get('/project_phases/:id', function(req, res) {
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

router.get('/positions', function(req, res) {
  res.json(positionData);
});

router.get('/employees/utilizations', function(req, res) {
  res.json(utilizationData);
});

router.get('/utilization_types', function(req, res) {
  res.json(utilizationTypeData);
});
