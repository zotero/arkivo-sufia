'use strict';

var chai   = require('chai');
var sinon  = require('sinon');
var B      = require('bluebird');
var nock   = require('nock');

var expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

var SufiaClient  = require('../lib/client');
var SufiaItem    = require('../lib/item');
var HTTPClient   = require('../lib/http');

var arkivo       = require('arkivo');
var common       = arkivo.common;
var extend       = common.extend;
var base64       = common.base64;
var Session      = arkivo.Synchronizer.Session;
var Subscription = arkivo.Subscription;

var F = require('./fixtures.json').zotero;

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

  describe('.path()', function () {
    it('returns path for given action', function () {
      expect(client.path('create')).to.eql(client.options.create);
      expect(client.path('update')).to.eql(client.options.update);
    });

    it('replaces given parameters', function () {
      expect(client.path('create', { id: 'abc' }))
        .to.eql(client.options.create);

      expect(client.path('update', { id: 'abc' }))
        .to.eql('http://localhost:3000/api/items/abc');
    });
  });

  describe('given a sync session with an item', function () {
    beforeEach(function () {
      session.items[F.derrida.key] =
        extend({}, F.derrida, { children: [F['derrida-child']] });

      sinon.stub(client, 'download', function (item) {
        return (item.key === F['derrida-child'].key) ?
          B.resolve(F['derrida-data']) :
          B.reject();
      });
    });

    describe('.collect()', function () {
      it('returns an empty object for an empty list', function () {
        return expect(client.collect([])).to.eventually.eql({});
      });

      it('converts and returns all items for the given keys', function () {
        return expect(client.collect([F.derrida.key]))
          .to.eventually.have.property(F.derrida.key)
          .and.to.have.keys(['metadata', 'file', 'token'])
          .and.to.have.property('file')
          .and.to.have.property('base64', base64(F['derrida-data']));
      });
    });

    describe('.create()', function () {
      var item, token = 'badc0de';

      beforeEach(function () {
        item = new SufiaItem(
          token, F.derrida, F['derrida-child'], F['derrida-data']);
      });

      it('sends the item to sufia', function () {
        var mhttp = nock('http://localhost:3000')
          .post('/api/items', function (body) {

            expect(body).to.have.keys(['token', 'metadata', 'file']);
            expect(body.token).to.eql(token);

            expect(body.metadata.tags).to.contain(F.derrida.data.tags[0].tag);

            return true;

          }).reply(201);

        return client.create(F.derrida.key, item)
          .finally(function () { expect(mhttp.isDone()).to.be.true; });
      });

      it('registers the id returned by sufia', function () {
        nock('http://localhost:3000')
          .post('/api/items')
          .reply(201, '', {
            Location: 'http://localhost:3000/api/items/12345'
          });

        return client.create(F.derrida.key, item)
          .finally(function () {
            expect(client.registry).to.have.property(F.derrida.key, '12345');
          });
      });
    });

    describe('.update()', function () {
      var item, token = 'badc0de', id = 'sid';

      beforeEach(function () {
        client.registry[F.derrida.key] = id;

        item = new SufiaItem(
          token, F.derrida, F['derrida-child'], F['derrida-data']);
      });

      afterEach(function () {
        delete client.registry[F.derrida.key];
      });

      it('sends the item to sufia', function () {
        var mhttp = nock('http://localhost:3000')
          .put('/api/items/' + id, function (body) {

            expect(body).to.have.keys(['token', 'metadata', 'file']);
            expect(body.token).to.eql(token);

            expect(body.metadata.tags).to.contain(F.derrida.data.tags[0].tag);

            return true;

          }).reply(204);

        return client.update(F.derrida.key, item)
          .finally(function () { expect(mhttp.isDone()).to.be.true; });
      });

      it('tries to create on 404', function () {
        var mhttp = nock('http://localhost:3000')
          .put('/api/items/' + id)
          .reply(404)
          .post('/api/items')
          .reply(201, '', {
            Location: 'http://localhost:3000/api/items/12345'
          });

        return client.update(F.derrida.key, item)
          .finally(function () {
            expect(client.registry).to.have.property(F.derrida.key, '12345');
            expect(mhttp.isDone()).to.be.true;
          });
      });
    });
  });
});
