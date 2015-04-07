'use strict';

// --- Dependencies ---
var debug = require('debug')('arkivo:sufia');

var assert  = require('assert');
var B       = require('bluebird');

var request = require('superagent');

function HTTPClient(options) {
  this.options = options;
}

HTTPClient.prototype.path = function (action, item) {
  var path = this.options[action];

  assert(typeof path === 'string');

  if (!item) return path;

  return path.replace(/:(\w+)/, function (_, name) {
    return item[name] || '';
  });
};

HTTPClient.prototype.transform = function (item) {
  return B.fulfilled(item);
};

HTTPClient.prototype.send = function (method, path, item) {
  debug('%s %s', method, path);

  return this
    .transform(item)

    .then(function (data) {
      return new B(function (resolve, reject) {
        request[method](path)
          .send(data)

          .end(function (error, result) {
            if (error) return reject(error);
            resolve(result);
          });
      });
    });
};

HTTPClient.prototype.create = function (item) {
  return this.send('post', this.path('create', item), item);
};

HTTPClient.prototype.update = function (item) {
  return this.send('put', this.path('update', item), item);
};

HTTPClient.prototype.delete = function (item) {
  return this.send('del', this.path('delete', item));
};

// --- Exports ---
module.exports = HTTPClient;
