'use strict';

// --- Dependencies ---
var debug = require('debug')('arkivo:plugins:hydra');

var B     = require('bluebird');
var co    = B.coroutine.bind(B);

var URL_PATTERN = /^https?:\/\//i;

module.exports = {
  name: 'hydra',

  description:
    'Synchronizes data to a Project Hydra service.',

  parameters: {
    host: {
      mandatory: true,
      validate: URL_PATTERN
    }
  },

  process: co(function* (sync) {
    var id = sync.subscription.id;

    debug('[%s] processing subscription...', id);
  })
};
