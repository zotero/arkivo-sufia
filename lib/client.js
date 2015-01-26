'use strict';

// --- Dependencies ---
var debug    = require('debug')('arkivo:hydra:client');
var assert   = require('assert');
var B        = require('bluebird');
var joins    = require('path').joins;
var inherits = require('util').inherits;

var HTTPClient = require('./http');

function HydraClient(sync, host) {
  host = host || HydraClient.DEFAULT_HOST;

  HTTPClient.call(this, {
    create: joins(host, '/api/items'),
    update: joins(host, '/api/items/:id'),
    delete: joins(host, '/api/items/:id')
  });

  this.sync    = sync;
}

inherits(HydraClient, HTTPClient);

HydraClient.DEFAULT_HOST = 'http://localhost:3000';


// --- Exports ---
module.exports = HydraClient;
