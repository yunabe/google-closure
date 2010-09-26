// Copyright 2010 Yu Watanabe. All Rights Reserved.

/**
 * @fileoverview UI component to switch 2 types of views with images smoothly.
 */

goog.provide('yunabe.ui.GridListSwitcher');

goog.require('goog.events');
goog.require('goog.dom');
goog.require('goog.style');

// To suppress unknown type warnings.
goog.require('goog.debug.ErrorHandler');

/**
 * @constructor
 * @param {Element} gridview
 * @param {Element} listview
 * @param {Element} harbor
 * @param {string} thumbnailClassName
 * @param {boolean} isGrid
 */
yunabe.ui.GridListSwitcher = function(gridview, listview, harbor,
                                      thumbnailClassName, isGrid) {
  this.gridview_ = gridview;
  this.listview_ = listview;
  this.harbor_ = harbor;
  this.thumbnailClassName_ = thumbnailClassName;
  this.isGrid_ = isGrid;
  this.thumbnails_ = [];
  this.initThumbnails();
};

yunabe.ui.GridListSwitcher.prototype.initThumbnails = goog.abstractMethod;

/** @enum */
yunabe.ui.GridListSwitcher.State = {
 DONE: 0,
 INIT: 1,
 SWITCHING: 2
};

/** @type {Element} */
yunabe.ui.GridListSwitcher.prototype.gridview_ = null;

/** @type {Element} */
yunabe.ui.GridListSwitcher.prototype.listview_ = null;

/** @type {boolean} */
yunabe.ui.GridListSwitcher.prototype.isGrid_ = true;

/** @type {Array.<Element>} */
yunabe.ui.GridListSwitcher.prototype.thumbnails_ = null;

/** @type {yunabe.ui.GridListSwitcher.State} */
yunabe.ui.GridListSwitcher.prototype.state_ =
  yunabe.ui.GridListSwitcher.State.DONE;

/** @type {number} */
yunabe.ui.GridListSwitcher.prototype.animationCount_ = 0;

/** @type {number} */
yunabe.ui.GridListSwitcher.prototype.duration_ = 700;

yunabe.ui.GridListSwitcher.prototype.initialize = function() {
  if (this.isGrid_) {
    this.listview_.style['display'] = 'none';
  } else {
    this.gridview_.style['display'] = 'none';
  }
  var view = this.isGrid_ ? this.gridview_ : this.listview_;
  var nodes = view.getElementsByClassName(this.thumbnailClassName_);
  if (nodes.length != this.thumbnails_.length) {
    return;
  }
  var i;
  for (i = 0; i < nodes.length; ++i) {
    nodes[i].appendChild(this.thumbnails_[i]);
  }
};

/**
 * @param {Array.<Element>} originalParents
 * @param {string} duration
 */
yunabe.ui.GridListSwitcher.prototype.adjustPosition =
    function(originalParents, duration) {
  if (originalParents.length == 0) {
    return;
  }
  var parentNode = /** @type {Element} */ this.thumbnails_[0].parentNode;
  var thumbnailOffset = goog.style.getPageOffset(parentNode);
  for (var i = 0; i < originalParents.length; ++i) {
    var offset = goog.style.getPageOffset(originalParents[i]);
    var left = (offset.x - thumbnailOffset.x) + 'px';
    var top = (offset.y - thumbnailOffset.y) + 'px';
    this.thumbnails_[i].style['-webkit-transform'] = 'translate(' + left + ',' + top + ')';
    this.thumbnails_[i].style['-webkit-transition-duration'] = duration;
  }
};

yunabe.ui.GridListSwitcher.prototype.switchViewInit_ = function() {
  this.state_ = yunabe.ui.GridListSwitcher.State.INIT;
  var view = this.isGrid_ ? this.gridview_ : this.listview_;
  var srcNodes = view.getElementsByClassName(this.thumbnailClassName_);
  var i;
  for (i = 0; i < srcNodes.length; ++i) {
    this.harbor_.appendChild(this.thumbnails_[i]);
  }
  this.adjustPosition(srcNodes, '');
  if (this.isGrid_) {
    this.listview_.style['display'] = '';    
  } else {
    this.gridview_.style['display'] = '';
  }
  this.isGrid_ = !this.isGrid_;
};

yunabe.ui.GridListSwitcher.prototype.switchViewStart_ = function() {
  this.state_ = yunabe.ui.GridListSwitcher.State.SWITCHING;
  var view = this.isGrid_ ? this.gridview_ : this.listview_;
  var dstNodes = view.getElementsByClassName(this.thumbnailClassName_);
  this.adjustPosition(dstNodes, this.duration_ + 'ms');

  if (this.isGrid_) {
    this.gridview_.style['opacity'] = '1.0';
    this.listview_.style['opacity'] = '0.0';
  } else {
    this.gridview_.style['opacity'] = '0.0';
    this.listview_.style['opacity'] = '1.0';
  }
  this.gridview_.style['-webkit-transition-duration'] = this.duration_ + 'ms';
  this.listview_.style['-webkit-transition-duration'] = this.duration_ + 'ms';
  this.animationCount_ += 1;
  return this.animationCount_;
};

/**
 * @param {number} animationCount
 */
yunabe.ui.GridListSwitcher.prototype.switchViewFinalize_ =
    function(animationCount) {
  if (this.animationCount_ != animationCount) {
    return;
  }
  this.state_ = yunabe.ui.GridListSwitcher.State.DONE;
  var view = this.isGrid_ ? this.gridview_ : this.listview_;
  var dstNodes = view.getElementsByClassName(this.thumbnailClassName_);
  var i;
  for (i = 0; i < dstNodes.length; ++i) {
    dstNodes[i].appendChild(this.thumbnails_[i]);
    this.thumbnails_[i].style['-webkit-transform'] = '';
  }
  if (this.isGrid_) {
    this.listview_.style['display'] = 'none';
  } else {
    this.gridview_.style['display'] = 'none';
  }
};

yunabe.ui.GridListSwitcher.prototype.switchView = function() {
  var self = this;
  if (this.state_ == yunabe.ui.GridListSwitcher.State.INIT) {
    this.isGrid_ = !this.isGrid_;
  } else if (this.state_ == yunabe.ui.GridListSwitcher.State.SWITCHING) {
    this.isGrid_ = !this.isGrid_;
    var animationCount = self.switchViewStart_();
    setTimeout(function() {
        self.switchViewFinalize_(animationCount);
      }, self.duration_);
  } else {
    self.switchViewInit_();
    setTimeout(function() {
        var animationCount = self.switchViewStart_();
        setTimeout(function() {
            self.switchViewFinalize_(animationCount);
          }, self.duration_);
      }, 0);
  }
};
