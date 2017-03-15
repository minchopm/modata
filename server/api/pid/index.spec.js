'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var pidCtrlStub = {
  index: 'pidCtrl.index',
  show: 'pidCtrl.show',
  create: 'pidCtrl.create',
  update: 'pidCtrl.update',
  destroy: 'pidCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var pidIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './pid.controller': pidCtrlStub
});

describe('Pid API Router:', function() {

  it('should return an express router instance', function() {
    expect(pidIndex).to.equal(routerStub);
  });

  describe('GET /api/pids', function() {

    it('should route to pid.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'pidCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/pids/:id', function() {

    it('should route to pid.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'pidCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/pids', function() {

    it('should route to pid.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'pidCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/pids/:id', function() {

    it('should route to pid.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'pidCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/pids/:id', function() {

    it('should route to pid.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'pidCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/pids/:id', function() {

    it('should route to pid.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'pidCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
