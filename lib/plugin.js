'use strict';

// --- Dependencies ---
var debug = require('debug')('arkivo:sufia');

var B  = require('bluebird');
var co = B.coroutine.bind(B);


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
    var id = sync.subscription.id;
    //var sufia = new SufiaClient(this.options.base, sync);

    debug('[%s] processing subscription...', id);
  })
};
