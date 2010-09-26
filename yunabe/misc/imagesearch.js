goog.provide('yunabe.misc.GoogleImageSearch');

/**
 * @see http://closure-library.googlecode.com/svn/trunk/closure/goog/base.js
 * @constructor
 */
yunabe.misc.GoogleImageSearch = function() {
  this.imageSearch_ = new google.search.ImageSearch();
  this.imageSearch_.setResultSetSize(google.search.Search.LARGE_RESULTSET);

  this.imageSearch_.setRestriction(google.search.ImageSearch.RESTRICT_IMAGESIZE,
                                   google.search.ImageSearch.IMAGESIZE_MEDIUM);
  this.imageSearch_.setRestriction(google.search.Search.RESTRICT_SAFESEARCH,
                                   google.search.Search.SAFESEARCH_OFF);

  this.imageSearch_.setSearchCompleteCallback(this, this.searchComplete_);
};

yunabe.misc.GoogleImageSearch.prototype.imageSearch_ = null;

/** @type {string} */
yunabe.misc.GoogleImageSearch.prototype.query_ = '';

/** @type {number} */
yunabe.misc.GoogleImageSearch.prototype.num_ = 0;

/** @type {Array} */
yunabe.misc.GoogleImageSearch.prototype.results_ = null;

/** @type {Function} */
yunabe.misc.GoogleImageSearch.prototype.searchHandler_ = null;

/**
 * @param {string} query
 * @param {number} num
 * @param {function()} handler
 */
yunabe.misc.GoogleImageSearch.prototype.search = function(query, num, handler) {
  this.query_ = query;
  this.num_ = num;
  this.results_ = [];
  this.searchHandler_ = handler;
  this.imageSearch_.execute(this.query_);
};

yunabe.misc.GoogleImageSearch.prototype.searchComplete_ = function() {
  if (!this.imageSearch_.results ||
      this.imageSearch_.results.length == 0) {
    alert('Failed to get search results. API key might be wrong.');
    return;
  }
  var cursor = this.imageSearch_.cursor;
  var page = cursor.pages[cursor.currentPageIndex];
  var i;
  for (i = 0; i < this.imageSearch_.results.length; ++i) {
    var result = this.imageSearch_.results[i];
    this.results_.push(result);
    if (this.results_.length >= this.num_) {
      break;
    }
  }
  if (this.results_.length < this.num_ &&
      cursor.pages.length - 1 > cursor.currentPageIndex) {
    this.imageSearch_.gotoPage(cursor.currentPageIndex + 1);
  } else {
    this.searchHandler_(this.results_);
  }
};
