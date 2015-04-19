'use strict';

// --- Dependencies ---
var debug      = require('debug')('arkivo:sufia');
var assert     = require('assert');
var join       = require('path').join;
var inherits   = require('util').inherits;

var HTTPClient = require('./http');
var SufiaItem  = require('./item');

var slice      = Array.prototype.slice;
var properties = Object.defineProperties;

var arkivo = require('arkivo');
var common = arkivo.common;
var config = arkivo.config;
var extend = common.extend;
var pick   = common.pick;

var B      = require('bluebird');
var co     = B.coroutine;


/**
 * @class SufiaClient
 */
function SufiaClient(options, sync) {
  assert(sync);
  assert(sync.subscription);

  var defaults = config.has('sufia')
    ? extend({}, SufiaClient.defaults, config.get('sufia'))
    : SufiaClient.defaults;

  options = options || {};

  options.base = options.base || defaults.base;
  options.mimetypes = defaults.mimetypes.slice();

  extend(options, {
    create: options.base + defaults.create,
    update: options.base + defaults.update,
    delete: options.base + defaults.delete
  });

  this.sync  = sync;

  this.debug('creating new client for %s...', options.base);

  HTTPClient.call(this, options);

  if (!sync.subscription.data.sufia) {
    this.debug('creating new id repository...');
    sync.subscription.data.sufia = {};
  }
}

inherits(SufiaClient, HTTPClient);

SufiaClient.defaults = {
  base: 'http://localhost:3000',

  create: '/api/items',
  update: '/api/items/:id',
  delete: '/api/items/:id',

  mimetypes: [
    'application/pdf'
  ]
};


properties(SufiaClient.prototype, {

  /**
   * @property registry
   * @type Object
   */
  registry: {
    get: function () {
      return this.sync.subscription.data.sufia;
    }
  },

  /**
   * @property deleted
   * @type Object
   */
  deleted: {
    get: function get$deleted() {
      var i, ii, id, key, deleted = {};

      for (i = 0, ii = this.sync.deleted.length; i < ii; ++i) {
        key = this.sync.deleted[i];
        id  = this.lookup(key);

        if (id)
          deleted[key] = id;
        else
          this.debug('cannot lookup deleted item "%s": id missing', key);

      }

      return deleted;
    }
  },

  /**
   * @property created
   * @type Object
   */
  created: {
    get: function get$created() {
      return this.collect(this.sync.created);
    }
  },


  /**
   * @property updated
   * @type Object
   */
  updated: {
    get: function get$updated() {
      return this.collect(this.sync.updated);
    }
  }
});


/**
 * Delete the item with the given Sufia id.
 *
 * @method delete
 * @return {Promise}
 */
SufiaClient.prototype.delete = function (key) {
  var id = this.lookup(key);

  if (!id)
    this.debug('cannot delete "%s": id missing', key);

  return this
    .send('del', this.path('delete', { id: id }), pick(this.options, 'token'))
    .tap(function () {
      delete this.registry[key];
      this.debug('deleted "%s" successfully', key);

    }.bind(this));
};


/**
 * Create the given Sufia item associated to a Zotero key.
 *
 * @method create
 * @return {Promise}
 */
SufiaClient.prototype.create = function (key, item) {
  this.debug('creating item %s...', key);

  return this
    .send('post', this.path('create'), null, item)

    .tap(function (res) {
      var m = (/api\/items\/([^\/]+)/).exec(res.header.location);

      if (m) {
        this.registry[key] = m[1];
        this.debug('created item "%s" with id "%s"', key, m[1]);

      } else {
        this.debug('failed to extract id of created item "%s"', key);
      }

    }.bind(this));
};


/**
 * Update the given Sufai item associated to a Zotero key.
 *
 * @method update
 * @return {Promise}
 */
SufiaClient.prototype.update = function (key, item) {
  var id = this.registry[key];

  if (!id) return this.create(key, item);

  this.debug('updating item %s/%s...', key, id);

  return this
    .send('put', this.path('update', { id: id }), null, item)
    .tap(function () {
      this.debug('updated item "%s" with id "%s"', key, id);
    }.bind(this));
};


/**
 * Downloads the item's attachment.
 * @method download
 * @return {Promise}
 */
SufiaClient.prototype.download = function (key) {
  this.debug('downloading attachment %s...', key);

  return this
    .sync
    .get(this.attachment(key))
    .get('data');
};


/**
 * Returns the item's attachment path.
 *
 * @method attachment
 * @return {String}
 */
SufiaClient.prototype.attachment = function (key) {
  return join(this.sync.subscription.library, 'items', key, 'file', 'view');
};


/**
 * Collect Zotero items which can be uploaded to Sufia/Hydra;
 * this includes only items with a usable single-file attachment.
 *
 * @method collect
 * @param {Array} keys The list of Zotero keys to look at.
 *
 * @return {Promise<Object>}
 *   The collection of Zotero key SufiaItem pairs.
 */
SufiaClient.prototype.collect = co(function* (keys) {
  var i, ii, item, child, data, collection = {};

  for (i = 0, ii = keys.length; i < ii; ++i) {
    try {
      item = this.expand(keys[i]);

      if (!item) {
        this.debug('cannot expand "%s": item missing', keys[i]);
        continue;
      }

      // Duplicate items are possible, because child items are
      // expanded to their parents; therefore, if a sync session
      // includes an item and one or more of its children, we
      // might process the item multiple times!
      if (collection[item.key]) continue;

      // Skip items without attachments!
      if (!item.children) continue;

      child = this.select(item.children);

      if (!child) {
        this.debug('skipping "%s": no suitable attachments found', item.key);
        continue;
      }

      data = yield this.download(child.key);

      collection[item.key] =
        new SufiaItem(this.options.token, item, child, data);

    } catch (error) {
      this.debug('failed to collect item: %s', error.message);
      debug(error.stack);

      continue;
    }
  }

  return collection;
});


/**
 * Selects the first suitable attachment item.
 *
 * @method select
 * @param {Array} items
 * @return {Object}
 */
SufiaClient.prototype.select = function (items) {
  if (!items) return undefined;
  if (!items.length) return undefined;

  var i, ii, item, next;

  for (i = 0, ii = items.length; i < ii; ++i) {
    next = items[i];

    if (next.data.itemType !== 'attachment')
      continue;

    if (next.data.linkMode !== 'imported_file')
      continue;

    if (this.options.mimetypes.indexOf(next.data.contentType) < 0)
      continue;

    if (item) {

      if (item.dateAdded < next.dateAdded) continue;

    }

    item = next;
  }

  return item;
};


/**
 * Returns the Zotero item for key; if the item has
 * a parent, returns parent item instead.
 *
 * @method expand
 * @private
 */
SufiaClient.prototype.expand = function (key) {
  var item = this.sync.items[key];

  if (item && item.data.parentItem)
    return this.expand(item.data.parentItem);

  return item;
};

SufiaClient.prototype.debug = function (message) {
  debug.apply(null, [
    '[%s] ' + message, this.sync.subscription.id
  ].concat(slice.call(arguments, 1)));

  return this;
};


// --- Helpers ---


// --- Exports ---
module.exports = SufiaClient;
