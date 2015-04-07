'use strict';

var chai   = require('chai');
//var nock   = require('nock');
//var sinon  = require('sinon');
//var B      = require('bluebird');

var expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

var SufiaItem = require('../lib/item');

describe('SufiaItem', function () {

  it('is a constructor function', function () {
    expect(SufiaItem).to.be.a('function');
  });
});
