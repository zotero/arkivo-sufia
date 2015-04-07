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

//var Session      = require('arkivo/lib/sync').Session;

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

  describe('configuration', function () {
    var config = {};

    it('must contain base url and a token', function () {

      expect(plugins.use.bind(plugins, 'sufia', config)).to.throw(Error);

      config.base = 'http://example.com:8181';

      expect(plugins.use.bind(plugins, 'sufia', config)).to.throw(Error);

      config.token = 'abcdefg';

      expect(plugins.use.bind(plugins, 'sufia', config)).to.not.throw(Error);
    });

    it('base url must be a valid HTTP url', function () {
      config.token = 'abcdefg';
      config.base = 'example.com';

      expect(plugins.use.bind(plugins, 'sufia', config)).to.throw(Error);

      config.base = 'example.com:3000';
      expect(plugins.use.bind(plugins, 'sufia', config)).to.throw(Error);

      config.base = 'ftp://example.com:3000';
      expect(plugins.use.bind(plugins, 'sufia', config)).to.throw(Error);

      config.base = 'http://example.com:3000';
      expect(plugins.use.bind(plugins, 'sufia', config)).to.not.throw(Error);

      config.base = 'https://example.com:3000';
      expect(plugins.use.bind(plugins, 'sufia', config)).to.not.throw(Error);

      config.base = 'https://example.com/api';
      expect(plugins.use.bind(plugins, 'sufia', config)).to.not.throw(Error);

      config.base = 'http://example.com:3000/api';
      expect(plugins.use.bind(plugins, 'sufia', config)).to.not.throw(Error);
    });
  });
});
