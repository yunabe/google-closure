// Copyright 2010 Yu Watanabe. All Rights Reserved.

/**
 * @fileoverview Definitions for Google AJAX Search API
 * @see http://code.google.com/intl/ja/apis/ajaxsearch/documentation/reference.html
 */

/**
 * @param {function()} callback
 */
google.setOnLoadCallback = function(callback) {};

/**
 * @param {string} moduleName
 * @param {string} moduleVersion
 * @param {Object.<string,*>=} optionalSettings
 */
google.load = function(moduleName, moduleVersion, optionalSettings) {};

/**
 * @constructor
 */
google.search.ImageSearch = function() {};

/**
 * @param {string} switchTo
 */
google.search.ImageSearch.prototype.setResultSetSize = function(switchTo) {};

/**
 * @param {string} type
 * @param {Object=} opt_value
 */
google.search.ImageSearch.prototype.setRestriction = function(type, opt_value) {};

/**
 * @param {Object} object
 * @param {function()} method
 */
google.search.ImageSearch.prototype.setSearchCompleteCallback = function(object, method) {};

/**
 * @param {number} page
 */
google.search.ImageSearch.prototype.gotoPage = function(page) {};

// Why we don't need this?
// some kind of names (e.g. execute, search, start, label, width, etc...) are whitelisted?

/**
 * @param {string=} opt_query
 */
google.search.ImageSearch.prototype.execute = function(opt_query) {};

/** @type {Array.<google.search.GimageResult>} */
google.search.ImageSearch.prototype.results = null;

/** @type {Object} */
google.search.ImageSearch.prototype.cursor = {
  "pages": { "start": "0", "label": 1 },
  "estimatedResultCount": "48758",
  "currentPageIndex": 0,
  "moreResultsUrl": "http://www.google.com/search..."
};

/**
 * @const
 * @type {string}
 */
google.search.Search.LARGE_RESULTSET;

/**
 * @const
 * @type {string}
 */
google.search.ImageSearch.RESTRICT_IMAGESIZE;

/** @type {Object} */
google.search.ImageSearch.IMAGESIZE_MEDIUM;

/** @constructor */
google.search.GimageResult = function() {};

/** @type {string} */
google.search.GimageResult.prototype.title;

/** @type {string} */
google.search.GimageResult.prototype.titleNoFormatting;

/** @type {string} */
google.search.GimageResult.prototype.unescapedUrl;

/** @type {string} */
google.search.GimageResult.prototype.url;

/** @type {string} */
google.search.GimageResult.prototype.visibleUrl;

/** @type {string} */
google.search.GimageResult.prototype.originalContextUrl;

/** @type {string} */
google.search.GimageResult.prototype.width;

/** @type {string} */
google.search.GimageResult.prototype.height;

/** @type {string} */
google.search.GimageResult.prototype.tbWidth;

/** @type {string} */
google.search.GimageResult.prototype.tbHeight;

/** @type {string} */
google.search.GimageResult.prototype.tbUrl;

/** @type {string} */
google.search.GimageResult.prototype.content;

/** @type {string} */
google.search.GimageResult.prototype.contentNoFormatting;
