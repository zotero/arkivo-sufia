'use strict';

var chai   = require('chai');
//var nock   = require('nock');
//var sinon  = require('sinon');
//var B      = require('bluebird');

var expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

var HydraClient = require('../lib/client');
var HTTPClient  = require('../lib/http');

//var Session      = require('arkivo/lib/sync').Session;
//var Subscription = arkivo.Subscription;


describe('HydraClient', function () {
  var client;

  beforeEach(function () { client = new HydraClient(); });

  it('is a constructor function', function () {
    expect(HydraClient).to.be.a('function');
    expect(client).to.be.instanceOf(HydraClient);
  });

  it('inherits from HTTPClient', function () {
    expect(client).to.be.instanceOf(HTTPClient);
  });

  describe('#options', function () {
    it('has CRUD paths', function () {
      expect(client)
        .to.have.property('options')
        .that.has.keys(['create', 'update', 'delete']);

      expect(client.options.update).to.match(/api\/items\/:id$/);
    });
  });
});
