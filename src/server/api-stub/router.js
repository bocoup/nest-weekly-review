/**
 * @file - Temporary set of endpoints for fetching fixture data.
 */
'use strict';
var express = require('express');
var bodyParser = require('body-parser');

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

router.use(bodyParser.json());

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

router.get('/project-phases/:id?', function(req, res) {
  var data = phaseData;
  var id = parseInt(req.params.id, 10);
  var projectId = parseInt(req.query.project_id, 10);
  var timeBounds = [req.query.before, req.query.after].map(function(dateStr) {
    if (!dateStr) {
      return null;
    }

    var parts = dateStr.split('-').map(Number);

    return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
  });
  var found;

  if (id) {
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
  } else if (timeBounds[0] || timeBounds[1]) {
    data = data.filter(function(phase) {
      var start = new Date(phase.first_day).getTime();
      var end = start + phase.calendar_weeks * 1000 * 60 * 60 * 24 * 7;

      if (timeBounds[0] && timeBounds[0] > end) {
        return false;
      }

      if (timeBounds[1] && timeBounds[1] < start) {
        return false;
      }

      return true;
    });
  }

  res.json(data);
});

router.get('/project-phases/:id', function(req, res) {
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

router.get('/utilization-types', function(req, res) {
  res.json(utilizationTypeData);
});

/**
 * Stub out the API for modifying utilization data on the server.
 */
router.use(/\/(utilizations|project-phase-reviews)/, function(req, res, next) {
  if (req.method === 'POST') {
    req.body.id = Math.round(Math.random() * 10000 + 1000);
  } else if (req.method !== 'PUT' && req.method !== 'DELETE') {
    next();
    return;
  }

  res.json(req.body);
});
