'use strict';

// --- Dependencies ---
var debug = require('debug')('arkivo:sufia');

var B  = require('bluebird');
var co = B.coroutine.bind(B);

var arkivo = require('arkivo');
var common = arkivo.common;
var extend = common.extend;

var SufiaClient = require('./client');

var keys = Object.keys;


module.exports = {
  name: 'sufia',

  description:
    'Synchronizes data to a Sufia host.',

  parameters: {
    base: {
      mandatory: true,
      description:
        'The base URL to use to connect to the Sufia host',
      validate: /^https?:\/\//i
    },

    token: {
      mandatory: true,
      description:
        'The user access token to use for authentication'
    }
  },

  process: co(function* (sync) {
    var sufia = new SufiaClient(this.options, sync);

    // Delete all items which have been removed
    // on Zotero since the last update.
    var deleted = sufia.deleted;

    yield B.map(keys(deleted), function (key) {
      return sufia.delete(deleted[key]);

    }).tap(function (items) {
      debug('deleted %d items successfully', items.length);
    });

    // Get all created/updated items. We do not differentiate
    // between them, because the SufiaClient will create items
    // instead of updating them, if it cannot map the item's
    // Zotero key to a Sufia id!
    var updated = extend(yield sufia.updated, yield sufia.created);

    yield B.map(keys(updated), function (key) {
      return sufia.update(key, updated[key]);

    }).tap(function (items) {
      debug('created/updated %d items successfully', items.length);
    });
  })
};
