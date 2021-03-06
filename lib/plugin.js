'use strict';

// --- Dependencies ---
var debug = require('debug')('arkivo:sufia');

var B  = require('bluebird');
var co = B.coroutine.bind(B);

var SufiaClient = require('./client');
var common      = require('arkivo/lib/common');
var extend      = common.extend;

var keys = Object.keys;


module.exports = {
  name: 'sufia',

  description:
    'Synchronizes data to a Sufia host.',

  parameters: {
    base: {
      mandatory: false,
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
    var sufia  = new SufiaClient(this.options, sync);

    // Delete all items which have been removed
    // on Zotero since the last update.
    yield B.map(sufia.deleted, function (key) {
      return sufia.delete(key);

    }, { concurrency: 3 })

      .tap(function (items) {
        if (items.length)
          debug('[%s] deleted %d items successfully', sync.id, items.length);
        else
          debug('[%s] no items to delete', sync.id);
      })

      // Swallow deletion errors; we do not want the synchronization
      // to fail because of a failed delete.
      .catch(function (error) {
        debug('[%s] failed to delete items: %s', sync.id, error.message);
      });


    // Get all created/updated items. We do not differentiate
    // between them, because the SufiaClient will create items
    // instead of updating them, if it cannot map the item's
    // Zotero key to a Sufia id!
    var updated = extend(yield sufia.updated, yield sufia.created);

    yield B.map(keys(updated), function (key) {
      return sufia.update(key, updated[key]);

    }, { concurrency: 1 }).tap(function (items) {
      if (items.length)
        debug('[%s] uploaded %d items successfully', sync.id, items.length);
      else
        debug('[%s] no items to upload', sync.id);
    });
  })
};
