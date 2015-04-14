'use strict';

var chai   = require('chai');
//var nock   = require('nock');
//var sinon  = require('sinon');
//var B      = require('bluebird');

var expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

var SufiaClient  = require('../lib/client');
var HTTPClient   = require('../lib/http');

var arkivo       = require('arkivo');
var Session      = arkivo.Synchronizer.Session;
var Subscription = arkivo.Subscription;


describe('SufiaClient', function () {
  var client;

  beforeEach(function () {
    client = new SufiaClient(null, new Session(new Subscription()));
  });

  it('is a constructor function', function () {
    expect(SufiaClient).to.be.a('function');
    expect(client).to.be.instanceOf(SufiaClient);
  });

  it('inherits from HTTPClient', function () {
    expect(client).to.be.instanceOf(HTTPClient);
  });

  describe('#options', function () {
    it('has CRUD paths', function () {
      expect(client)
        .to.have.property('options')
        .that.has.keys(['create', 'update', 'delete', 'base']);

      expect(client.options.update).to.match(/api\/items\/:id$/);
    });
  });
});
