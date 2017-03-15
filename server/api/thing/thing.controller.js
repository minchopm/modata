/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/things              ->  index
 * POST    /api/things              ->  create
 * GET     /api/things/:id          ->  show
 * PUT     /api/things/:id          ->  update
 * DELETE  /api/things/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Thing from './thing.model';

/*var ps = require('ps-node');

 // A simple pid lookup
 ps.lookup({
 command: 'node',
 psargs: 'ux'
 }, function(err, resultList ) {
 if (err) {
 throw new Error( err );
 }

 resultList.forEach(function( process ){
 if( process ){
 console.log(process );
 // console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
 }
 });
 });*/



function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

var maximum = 300;
var $scope = {data: [[]]};


setInterval(function () {
  Thing.create({info: getLiveChartData()})
}, 1000);

function getLiveChartData() {
  let value;
  if ($scope.data[0].length) {
    // $scope.labels = $scope.labels.slice(1);
    $scope.data[0] = $scope.data[0].slice(1);
  }

  while ($scope.data[0].length < maximum) {
    // $scope.labels.push('');
    value = getRandomValue($scope.data[0]);
    $scope.data[0].push(value);
  }
  // console.log(value)
  return value;
}

function getRandomValue(data) {
  var l = data.length, previous = l ? data[l - 1] : 50;
  var y = previous + Math.random() * 10 - 5;
  return y < 0 ? 0 : y > 100 ? 100 : y;
}

function saveUpdates(updates) {
  return function (entity) {
    if (entity) {
      var updated = _.merge(entity, updates);
      return updated.save()
        .then(updated => {
          return updated;
        });
    }
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Things
export function index(req, res) {
  return Thing.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Thing from the DB
export function show(req, res) {
  return Thing.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Thing in the DB
export function create(req, res) {
  return Thing.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Thing in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Thing.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Thing from the DB
export function destroy(req, res) {
  return Thing.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
