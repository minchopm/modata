/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/pids              ->  index
 * POST    /api/pids              ->  create
 * GET     /api/pids/:id          ->  show
 * PUT     /api/pids/:id          ->  update
 * DELETE  /api/pids/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Pid from './pid.model';
var exec = require('child_process').exec;
import {getSocket} from "../../personalData";
var socket;


/*var getTasks = function (err, stdout, stderr) {
  // console.log(stdout)
  // Pid.create({info: stdout});
  if(!(socket && 'emit' in socket)) {
    socket = getSocket();
  } else {
    socket.emit('pid:save', {info: stdout});
  }
}
setInterval(()=> {
  exec('tasklist', getTasks);
}, 1500)*/

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
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

// Gets a list of Pids
export function index(req, res) {
  return Pid.find().sort({$natural:1}).limit(1).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Pid from the DB
export function show(req, res) {
  return Pid.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Pid in the DB
export function create(req, res) {
  return Pid.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Pid in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Pid.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

var psTree = require('ps-tree');

var kill = function (pid, signal, callback) {
  signal   = signal || 'SIGKILL';
  callback = callback || function () {};
  var killTree = true;
  if(killTree) {
    psTree(pid, function (err, children) {
      [pid].concat(
        children.map(function (p) {
          return p.PID;
        })
      ).forEach(function (tpid) {
        try { process.kill(tpid, signal) }
        catch (ex) { }
      });
      callback();
    });
  } else {
    try { process.kill(pid, signal) }
    catch (ex) { }
    callback();
  }
};

// elsewhere in code

// Deletes a Pid from the DB
export function destroy(req, res) {
  kill(req.params.id);
}
