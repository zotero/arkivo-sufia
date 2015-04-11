'use strict';

// --- Dependencies ---
//var debug  = require('debug')('arkivo:sufia');
var assert = require('assert');
var common = require('arkivo').common;

var extend = common.extend;
var pick   = common.pick;
var md5    = common.md5;
var base64 = common.base64;


/**
 * @class SufiaItem
 */
function SufiaItem(token, zotero) {
  this.token    = token;
  this.file     = {};
  this.metadata = {
    creators: [], tags: [], rights: 'All rights reserved'
  };

  if (zotero) this.parse(zotero);
}

// Zotero item type to Sufia resource type
SufiaItem.TYPE = {
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

// Zotero data fields to copy as is
SufiaItem.FIELDS = [
  'title', 'rights', 'publisher', 'url', 'language'
];

/**
 * Parse a Zotero item.
 * @convert
 */
SufiaItem.prototype.parse = function (z) {
  assert(z);
  assert(z.data, 'Zotero item has no data');

  this.metadata.resourceType =
    SufiaItem.TYPE[z.data.itemType] || 'Other';

  extend(this.metadata, pick(z.data, SufiaItem.FIELDS));

  this.metadata.basedNear   = z.data.place;
  this.metadata.description = z.data.abstractNote;

  this.metadata.identifier =
    z.data.DOI || z.data.ISBN || z.data.PMID || z.data.arXiv;

  copy(this.metadata.creators, z.data.creators);
  copy(this.metadata.tags, z.data.tags, tag);

};

SufiaItem.prototype.attach = function (z, data) {
  assert(z);
  assert(z.data, 'Zotero item has no data');
  assert.equal(z.data.md5, md5(data), 'md5 checksum mismatch');

  extend(this.file, pick(z.data, ['filename', 'contentType', 'md5']));

  this.file.base64 = base64(data);
};

// --- Helpers ---

function copy(target, source, converter) {
  var i, ii;

  target.length = 0;

  if (source && source.length) {
    converter = converter || id;

    for (i = 0, ii = source.length; i < ii; ++i)
      target.push(converter(source[i], i, ii));

  }

  return target;
}

function id(x)  { return x; }
function tag(x) { return x.tag; }


// --- Exports ---
module.exports = SufiaItem;
