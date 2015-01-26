'use strict';

var chai   = require('chai');
//var nock   = require('nock');
//var sinon  = require('sinon');
//var B      = require('bluebird');

var expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

var HydraClient = require('../lib/client');

//var Session      = require('arkivo/lib/sync').Session;
//var Subscription = arkivo.Subscription;


describe('HydraClient', function () {

  it('is a constructor function', function () {
    expect(HydraClient).to.be.a('function');
  });
});
