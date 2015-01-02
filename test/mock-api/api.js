/**
 * @file - Temporary set of endpoints for fetching fixture data.
 */
'use strict';
var fs = require('fs');
var Promise = require('bluebird');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

/**
 * api.set('projects', './fixture-data/projects.json');
 *
 * api.when('GET /some-url')
 *   .then(function() {
 *     done();
 *   });
 *
 * api.destroy();
*/

function API() {
  var app = this._app = express();

  this._data = Object.create(null);
  this._data.projects = [];
  this._data.phases = [];
  this._data.positions = [];
  this._data.utilizations = [];
  this._data.utilizationTypes = [];

  app.use(cors());
  app.use(bodyParser.json());
  app.get('/projects/:id?', this._getProjects.bind(this));
  app.get('/project-phases/:id?', this._getPhases.bind(this));
  app.get('/positions', this._getPositions.bind(this));
  app.get('/employees/utilizations', this._getUtilizations.bind(this));
  app.get('/utilization-types', this._getUtilizationTypes.bind(this));
  app.use(/\/(utilizations|project-phase-reviews)/, this._simplePut);

  this._set('phases', './fixture-data/phases.json');
  this._set('positions', './fixture-data/positions.json');
  this._set('projects', './fixture-data/projects.json');
  this._set('utilizations', './fixture-data/utilizations.json');
  this._set('utilizationTypes', './fixture-data/utilization-types.json');
}

module.exports = API;

API.prototype.listen = function(port) {
  return new Promise(function(resolve, reject) {
    this._server = this._app.listen(port, function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  }.bind(this));
};

/**
 * Loading JSON via the `require` function would cause the data to be cached
 * and shared between server instances. Use the `fs` module instead to avoid
 * this.
 */
API.prototype._loadJSON = function(filePath) {
  return JSON.parse(fs.readFileSync(filePath));
};

API.prototype._set = function(identifier, representation) {
  if (!(identifier in this._data)) {
    throw new Error(
      'Unrecognized resource identifier: "' + identifier + "'. " +
      'Valid identifiers: ' + Object.keys(this._data).join(', ')
    );
  }

  if (typeof representation === 'string') {
    representation = this._loadJSON(__dirname + '/' + representation);
  }

  this._data[identifier] = representation;
};

API.prototype.destroy = function() {
  return new Promise(function(resolve, reject) {
    if (!this._server) {
      resolve();
      return;
    }

    this._server.close(function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  }.bind(this));
};

API.prototype._getProjects = function(req, res) {
  var data = this._data.projects;
  var id = parseInt(req.params.id, 10);
  var found;

  if (!('with_phases' in req.query)) {
    data = data.map(function(phase) {
      var copy = {};
      var key;

      for (key in phase) {
        copy[key] = phase[key];
      }
      delete copy.phases;

      return copy;
    });
  }

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
};

API.prototype._getPositions = function(req, res) {
  res.json(this._data.positions);
};

API.prototype._getPhases = function(req, res) {
  var data = this._data.phases;
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
    found = data.some(function(phase) {
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
};

API.prototype._getUtilizations = function(req, res) {
  var data = this._data.utilizations;
  var ids = req.query.ids;

  if (ids) {
    ids = ids.split(',').map(function(id) { return parseInt(id, 10); });

    data = data.filter(function(employee) {
      return ids.indexOf(employee.id) > -1;
    });
  }

  res.json(data);
};

API.prototype._getUtilizationTypes = function(req, res) {
  res.json(this._data.utilizationTypes);
};

/**
 * Stub out the API for modifying utilization data on the server.
 */
API.prototype._simplePut = function(req, res, next) {
  if (req.method === 'POST') {
    req.body.id = Math.round(Math.random() * 10000 + 1000);
  } else if (req.method !== 'PUT' && req.method !== 'DELETE') {
    next();
    return;
  }

  res.json(req.body);
};
