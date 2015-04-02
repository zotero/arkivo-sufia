'use strict';

// --- Dependencies ---
var debug = require('debug')('arkivo:sufia');

var B  = require('bluebird');
var co = B.coroutine.bind(B);

module.exports = {
  name: 'sufia',

  description:
    'Synchronizes data to a Project Hydra service.',

  parameters: {
    host: {
      mandatory: true,
      validate: /^https?:\/\//i
    },

    token: {
      mandatory: true
    }
  },

  process: co(function* (sync) {
    var id = sync.subscription.id;

    debug('[%s] processing subscription...', id);
  })
};
