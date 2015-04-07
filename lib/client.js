'use strict';

// --- Dependencies ---
var debug      = require('debug')('arkivo:sufia:client');
var assert     = require('assert');
//var B          = require('bluebird');
var join       = require('path').join;
var inherits   = require('util').inherits;

var HTTPClient = require('./http');

var slice      = Array.prototype.slice;
var properties = Object.defineProperties;


/**
 * @class SufiaClient
 */
function SufiaClient(base, sync) {
  base = base || SufiaClient.DEFAULT_HOST;

  assert(sync);
  assert(sync.subscription);

  this.sync = sync;

  this.debug('creating new client for %s...', base);

  HTTPClient.call(this, {
    create: join(base, '/api/items'),
    update: join(base, '/api/items/:id'),
    delete: join(base, '/api/items/:id')
  });

  if (!sync.subscription.data.sufia) {
    this.debug('creating new id repository...');
    sync.subscription.data.sufia = {};
  }
}

inherits(SufiaClient, HTTPClient);

SufiaClient.DEFAULT_HOST = 'http://localhost:3000';


properties(SufiaClient.prototype, {

  /**
   * @property deleted
   * @type {Array<String>}
   */
  deleted: {
    get: function () {
      var i, ii, id, key, deleted = [];

      for (i = 0, ii = this.sync.deleted.length; i < ii; ++i) {
        key = this.sync.deleted[i];
        id  = this.resolve(key);

        if (id)
          deleted.push(id);
        else this.debug('cannot resolve deleted "%s": id missing', key);

      }

      return deleted;
    }
  }

});

/**
 * Converts Zotero item key to Sufia id.
 * @method resolve
 */
SufiaClient.prototype.resolve = function (key) {
  return this.sync.subscription.data.sufia[key];
};

SufiaClient.prototype.debug = function (message) {
  debug.apply(null, [
    '[%s] ' + message, this.sync.subscription.id
  ].concat(slice.call(arguments, 1)));

  return this;
};

// --- Exports ---
module.exports = SufiaClient;
