'use strict';

// --- Dependencies ---
//var debug  = require('debug')('arkivo:sufia');
var assert = require('assert');


/**
 * @class SufiaItem
 */
function SufiaItem(token, z, id) {
  this.token = token;
  this.metadata = {};
  this.file = {};

  if (z) this.parse(z, id);
}

/**
 * Parse a Zotero item.
 * @convert
 */
SufiaItem.prototype.parse = function (z, id) {
  assert(z);
  assert(z.data, 'Zotero item has no data');
};

// --- Exports ---
module.exports = SufiaItem;
