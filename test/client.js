'use strict';

var chai   = require('chai');
var sinon  = require('sinon');
var B      = require('bluebird');

var expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

var SufiaClient  = require('../lib/client');
var HTTPClient   = require('../lib/http');

var arkivo       = require('arkivo');
var common       = arkivo.common;
var extend       = common.extend;
var base64       = common.base64;
var Session      = arkivo.Synchronizer.Session;
var Subscription = arkivo.Subscription;

var F = require('./fixtures.json');

describe('SufiaClient', function () {
  var client, session;

  beforeEach(function () {
    session = new Session(new Subscription());
    client  = new SufiaClient(null, session);
  });

  it('is a constructor function', function () {
    expect(SufiaClient).to.be.a('function');
    expect(client).to.be.instanceOf(SufiaClient);
  });

  it('inherits from HTTPClient', function () {
    expect(client).to.be.instanceOf(HTTPClient);
  });

  describe('.options', function () {
    it('has CRUD paths', function () {
      expect(client)
        .to.have.property('options')
        .that.has.keys(['create', 'update', 'delete', 'base', 'mimetypes']);

      expect(client.options.update).to.match(/api\/items\/:id$/);
    });
  });

  describe('.collect()', function () {
    beforeEach(function () {
      session.items[F.zotero.derrida.key] =
        extend({}, F.zotero.derrida, { children: [F.zotero['derrida-child']] });

      sinon.stub(client, 'download', function () {
        return B.resolve(F.zotero['derrida-data']);
      });
    });

    it('returns an empty object for an empty list', function () {
      return expect(client.collect([])).to.eventually.eql({});
    });

    it('converts and returns all items for the given keys', function () {
      return expect(client.collect([F.zotero.derrida.key]))
        .to.eventually.have.property(F.zotero.derrida.key)
        .and.to.have.keys(['metadata', 'file', 'token'])
        .and.to.have.property('file')
        .and.to.have.property('base64', base64(F.zotero['derrida-data']));

    });
  });
});
