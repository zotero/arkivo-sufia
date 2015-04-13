'use strict';

var chai   = require('chai');
//var nock   = require('nock');
//var sinon  = require('sinon');
//var B      = require('bluebird');

var expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

var arkivo = require('arkivo');
var common = arkivo.common;
var base64 = common.base64;

var SufiaItem = require('../lib/item');
var fixtures  = require('./fixtures.json');

describe('SufiaItem', function () {
  var item;

  beforeEach(function () { item = new SufiaItem(); });

  it('is a constructor function', function () {
    expect(SufiaItem).to.be.a('function');
  });

  describe('.parse', function () {
    it('fails unless given a useful zotero item', function () {
      expect(item.parse.bind(item, null)).to.throw();
      expect(item.parse.bind(item, {})).to.throw();
    });

    it('parses zotero items', function () {
      var z = fixtures.zotero.derrida;

      item.parse(z);

      expect(item.metadata.title).to.eql(z.data.title);
      expect(item.metadata.resourceType).to.eql('Article');
      expect(item.metadata.description).to.eql(z.data.abstractNote);
      expect(item.metadata.rights).to.eql(z.data.rights);

      expect(item.metadata.identifier).to.be.undefined;

      expect(item.metadata.creators).to.have.length(4);
      expect(item.metadata.tags).to.have.length(1);

      expect(item.metadata.tags[0]).to.eql(z.data.tags[0].tag);
      expect(item.metadata.creators[1]).to.eql(z.data.creators[1]);
    });
  });

  describe('.attach', function () {
    it('adds zotero attachment items', function () {
      var child = fixtures.zotero['derrida-child'];
      var data  = fixtures.zotero['derrida-data'];

      item.attach(child, data);

      expect(item.file.filename).to.eql(child.data.filename);
      expect(item.file.md5).to.eql(child.data.md5);

      expect(item.file.base64).to.eql(base64(data));
    });
  });
});
