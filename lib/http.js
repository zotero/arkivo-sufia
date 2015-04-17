'use strict';

// --- Dependencies ---
var debug = require('debug')('arkivo:sufia:http');

var assert  = require('assert');
var B       = require('bluebird');

var request = require('superagent');

function HTTPClient(options) {
  this.options = options;
}

HTTPClient.prototype.path = function (action, options) {
  var path = this.options[action];

  assert(typeof path === 'string');

  if (!options) return path;

  return path.replace(/:(\w+)/, function (_, name) {
    return options[name] || '';
  });
};


HTTPClient.prototype.send = function (method, path, options, data) {
  debug('%s %s', method, path);

  return new B(function (resolve, reject) {
    request[method](path)
      .query(options)
      .send(data)

      .end(function (error, result) {
        if (error) return reject(error);
        resolve(result);
      });
  });
};


// --- Exports ---
module.exports = HTTPClient;
