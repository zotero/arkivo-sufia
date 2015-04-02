'use strict';

var chai   = require('chai');
//var nock   = require('nock');
//var sinon  = require('sinon');
//var B      = require('bluebird');

var expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

//var arkivo       = require('arkivo');
var sufia        = require('../lib/plugin');

var Session      = require('arkivo/lib/sync').Session;

var plugins      = require('arkivo/lib/plugins');
//var plugins      = arkivo.plugins;
//var Subscription = arkivo.Subscription;


describe('Hydra Plugin', function () {

  before(function () { plugins.add(sufia); });
  after(function () { plugins.reset(); });

  it('is available', function () {
    expect(plugins.available.sufia).to.be.an('object');
  });

  it('can be used', function () {
    expect(plugins.use('sufia')).to.be.instanceof(plugins.Plugin);
  });

  it('is configurable', function () {
    expect(plugins.use('sufia').configurable).to.be.true;
  });

  it('has a summary', function () {
    expect(plugins.use('sufia')).to.have.property('summary');
  });

  it('must be configured with a host and a token', function () {
    var config = {};

    expect(plugins.use.bind(plugins, 'sufia', config)).to.throw(Error);

    config.host = 'http://example.com:8181';

    expect(plugins.use.bind(plugins, 'sufia', config)).to.throw(Error);

    config.token = 'abcdefg';

    expect(plugins.use.bind(plugins, 'sufia', config)).to.not.throw(Error);
  });
});
