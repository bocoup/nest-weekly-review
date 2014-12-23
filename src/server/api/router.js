/**
 * @file - Temporary set of endpoints for fetching fixture data.
 */
'use strict';
var express = require('express');

var projectDataWithPhases = require('./fixture-data/projects.json');
var projectData = projectDataWithPhases.map(function(project) {
  var p = {};
  var attr;

  for (attr in project) {
    p[attr] = project[attr];
  }

  delete p.phases;

  return p;
});

var phaseData = require('./fixture-data/phases.json');
var positionData = require('./fixture-data/positions.json');
var utilizationData = require('./fixture-data/utilizations.json');
var utilizationTypeData = require('./fixture-data/utilization-types.json');

var router = module.exports = express.Router();

router.get('/projects/:id?', function(req, res) {
  var data = 'with_phases' in req.query ? projectDataWithPhases : projectData;
  var id = parseInt(req.params.id, 10);
  var found;

  // This check will fail when `id` is NaN
  if (id === id) {
    found = data.some(function(project) {
      if (project.id === id) {
        data = project;
        return true;
      }
    });

    if (!found) {
      res.sendStatus(404);
      return;
    }
  }

  res.json(data);
});

router.get('/project_phases/:id?', function(req, res) {
  var data = phaseData;
  var id = parseInt(req.params.id, 10);
  var projectId = parseInt(req.query.project_id, 10);
  var found;

  if (id === id) {
    found = phaseData.some(function(phase) {
      if (phase.id === id) {
        data = phase;
        return true;
      }
    });

    if (!found) {
      res.sendStatus(404);
      return;
    }
  } else if (projectId) {
    data = data.filter(function(phase) {
      return phase.project_id === projectId;
    });
  }

  res.json(data);
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
  var data = utilizationData;
  var ids = req.query.ids;

  if (ids) {
    ids = ids.split(',').map(function(id) { return parseInt(id, 10); });

    data = data.filter(function(employee) {
      return ids.indexOf(employee.id) > -1;
    });
  }

  res.json(data);
});

router.get('/utilization_types', function(req, res) {
  res.json(utilizationTypeData);
});
