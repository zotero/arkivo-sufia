'use strict';

// --- Dependencies ---
var debug    = require('debug')('arkivo:hydra:client');
var assert   = require('assert');
var B        = require('bluebird');
var join     = require('path').join;
var inherits = require('util').inherits;

var HTTPClient = require('./http');

function HydraClient(host, sync) {
  host = host || HydraClient.DEFAULT_HOST;

  HTTPClient.call(this, {
    create: join(host, '/api/items'),
    update: join(host, '/api/items/:id'),
    delete: join(host, '/api/items/:id')
  });

  this.sync = sync;
}

inherits(HydraClient, HTTPClient);

HydraClient.DEFAULT_HOST = 'http://localhost:3000';


// --- Exports ---
module.exports = HydraClient;
