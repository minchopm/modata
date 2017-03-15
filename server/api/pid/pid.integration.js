'use strict';

var app = require('../..');
import request from 'supertest';

var newPid;

describe('Pid API:', function() {

  describe('GET /api/pids', function() {
    var pids;

    beforeEach(function(done) {
      request(app)
        .get('/api/pids')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          pids = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(pids).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/pids', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/pids')
        .send({
          name: 'New Pid',
          info: 'This is the brand new pid!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newPid = res.body;
          done();
        });
    });

    it('should respond with the newly created pid', function() {
      expect(newPid.name).to.equal('New Pid');
      expect(newPid.info).to.equal('This is the brand new pid!!!');
    });

  });

  describe('GET /api/pids/:id', function() {
    var pid;

    beforeEach(function(done) {
      request(app)
        .get('/api/pids/' + newPid._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          pid = res.body;
          done();
        });
    });

    afterEach(function() {
      pid = {};
    });

    it('should respond with the requested pid', function() {
      expect(pid.name).to.equal('New Pid');
      expect(pid.info).to.equal('This is the brand new pid!!!');
    });

  });

  describe('PUT /api/pids/:id', function() {
    var updatedPid;

    beforeEach(function(done) {
      request(app)
        .put('/api/pids/' + newPid._id)
        .send({
          name: 'Updated Pid',
          info: 'This is the updated pid!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedPid = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPid = {};
    });

    it('should respond with the updated pid', function() {
      expect(updatedPid.name).to.equal('Updated Pid');
      expect(updatedPid.info).to.equal('This is the updated pid!!!');
    });

  });

  describe('DELETE /api/pids/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/pids/' + newPid._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when pid does not exist', function(done) {
      request(app)
        .delete('/api/pids/' + newPid._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
