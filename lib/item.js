'use strict';

// --- Dependencies ---
//var debug  = require('debug')('arkivo:sufia');
var assert = require('assert');


/**
 * @class SufiaItem
 */
function SufiaItem(token, z, id) {
  this.token    = token;
  this.file     = {};
  this.metadata = {
    creators: [], tags: []
  };

  if (z) this.parse(z, id);
}

SufiaItem.type = {
  journalArticle: 'Article',
  magazineArticle: 'Article',
  newspaperArticle: 'Article',
  audioRecording: 'Audio',
  radioBroadcast: 'Audio',
  podcast: 'Audio',
  book: 'Book',
  bookSection: 'Part of Book',
  thesis: 'Thesis',
  videoRecording: 'Video',
  film: 'Video',
  tvBroadcast: 'Video',
  conferencePaper: 'Conference Proceeding',
  computerProgram: 'Software or Program Code',
  artwork: 'Image',
  map: 'Map or Cartographic Material',
  presentation: 'Presentation'
};


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
