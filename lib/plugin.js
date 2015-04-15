'use strict';

// --- Dependencies ---
//var debug = require('debug')('arkivo:sufia');

var B  = require('bluebird');
var co = B.coroutine.bind(B);

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
    });

    //var created = yield sufia.created;
    //var updated = yield sufia.updated;
  })
};
