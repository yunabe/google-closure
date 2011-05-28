// Copyright 2010 Yu Watanabe. All Rights Reserved.

/**
 * @fileoverview UI component to ...
 */

goog.provide('yunabe.ui.GroupSizeVisualizer');

/**
 * @constructor
 */
yunabe.ui.Rect = function(left, top, width, height, color_min, color_max) {
  this.left = left;
  this.top = top;
  this.width = width;
  this.height = height;
  this.color_min = color_min;
  this.color_max = color_max;

  this.children = [];
  this.node = null;
  this.parent = null;
  this.div = null;
};

yunabe.ui.Rect.prototype.createSameSize = function() {
  return new yunabe.ui.Rect(this.left, this.top, this.width, this.height,
                  this.color_min, this.color_max);
};

var formatFloat = function(value) {
  if (value >= 100) {
    return String(Math.floor(value));
  } else {
    return value.toFixed(2);
  }
};

var formatSize = function(size) {
  if (size > 1000 * 1000 * 1000) {
    return formatFloat(size / (1000.0 * 1000 * 1000)) + 'GB';
  } else if (size > 1000 * 1000) {
    return formatFloat(size / (1000.0 * 1000)) + 'MB';
  } else if (size > 1000) {
    return formatFloat(size / 1000.0) + 'KB';
  } else {
    return Math.floor(size) + 'B';
  }
};

var showBreadcrumb = function(e, rect) {
  var div = document.getElementById('breadcrumb');
  var names = [];
  var node = rect.node;
  while (node) {
    names.unshift(node.name);
    node = node.parent;
  }
  div.innerHTML = names.join('/') + ' (size = ' +
      formatSize(rect.node.size()) + ')';
  
  var rects = [];
  var r = rect;
  while (r) {
    rects.unshift(r);
    r = r.parent;
  }
  for (var i = 0; i < rects.length; ++i) {
    var style = rects[i].div['style'];
    style['border'] = '2px solid black';
    style['z-index'] = String(i + 1);
  }
};

var hideBreadcrumb = function(e, rect) {
  var rects = [];
  var r = rect;
  while (r) {
    rects.unshift(r);
    r = r.parent;
  }
  for (var i = 0; i < rects.length; ++i) {
    var style = rects[i].div['style'];
    if (i == rects.length - 1) {
      style['border'] = '1px solid gray';
    } else {
      style['border'] = '';
    }
    style['z-index'] = '';
  }
};

/**
 * @param {yunabe.ui.Rect=} opt_parent
 */
yunabe.ui.Rect.prototype.createDiv = function(opt_parent) {
  var div = document.createElement('div');
  var style = div['style'];
  if (opt_parent) {
    style['left'] = Math.floor(this.left - opt_parent.left) + 'px';
    style['top'] = Math.floor(this.top - opt_parent.top) + 'px';
  } else {
    style['left'] = Math.floor(this.left) + 'px';
    style['top'] = Math.floor(this.top) + 'px';
  }
  style['width'] = Math.floor(this.width) + 'px';
  style['height'] = Math.floor(this.height) + 'px';
  style['position'] = 'absolute';
  var color_middle = Math.floor((this.color_max + this.color_min) / 2.0);
  style['background-color'] = 'hsla(' + color_middle + ',100%,60%,1)'

  if (this.children.length == 0) {
    style['border'] = '1px solid gray';
    var rect = this;
    div.addEventListener('mouseover',
                         function(e) {
                           showBreadcrumb(e, rect);
                           e.stopPropagation();
                         }, false);
    div.addEventListener('mouseout',
                         function(e) {
                           hideBreadcrumb(e, rect);
                           e.stopPropagation();
                         }, false);
  }
  for (var i = 0; i < this.children.length; ++i) {
    div.appendChild(this.children[i].createDiv(this));
  }
  this.div = div;
  return div;
};

/**
 * @constructor
 */
yunabe.ui.Node = function(opt_parent) {
  this.size_ = -1;
  this.children = [];
  this.name = '';
  this.parent = opt_parent || null;
};

yunabe.ui.Node.prototype.set_size = function(size) {
  if (this.children.length > 0) {
    show_error('Node should not have size if it has children.');
  } else {
    this.size_ = size;
  }
};

yunabe.ui.Node.prototype.size = function() {
  if (this.size_ < 0) {
    this.size_ = 0;
    for (var i = 0; i < this.children.length; ++i) {
      this.size_ += this.children[i].size();
    }
  }
  return this.size_;
};

/**
 * @param {Object} obj
 * @param {yunabe.ui.Node=} opt_parent_node
 */
yunabe.ui.Node.parseJsonObject = function(obj, opt_parent_node) {
  var node = new yunabe.ui.Node(opt_parent_node);
  node.name = obj['name'];
  if (obj['size']) {
    node.set_size(obj['size']);
  }
  if (obj['children']) {
    for (var i = 0; i < obj['children'].length; ++i) {
      node.children.push(yunabe.ui.Node.parseJsonObject(obj['children'][i],
                                                        node));
    }
  }
  return node;
};

var show_error = function(msg) {
  alert(msg);
};

var splitNodeList = function(nodes, left, right) {
  if (nodes.length <= 1) {
    show_error('nodes.length must be more than 1.');
  }
  var lsize = 0;
  var rsize = 0;
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i].size() <= 0) {
      show_error('The size of node must be positive.');
    }
    if (rsize >= lsize) {
      left.push(nodes[i]);
      lsize += nodes[i].size();
    } else {
      right.push(nodes[i]);
      rsize += nodes[i].size();
    }
  }
  return 1.0 * lsize / (lsize + rsize);
};

var divideRect = function(nodes, rect) {
  if (nodes.length == 0) {
    show_error('divideRect: nodes.length must not be 0.');
    return null;
  }
  if (nodes.length == 1) {
    return [[nodes[0], rect.createSameSize()]];
  }
  var left = [];
  var right = [];
  var lrect, rrect;
  var ratio = splitNodeList(nodes, left, right);
  if (left.length + right.length != nodes.length) {
    show_error('Fatal bug');
  }
  var color_border = rect.color_min + (rect.color_max - rect.color_min) * ratio;
  if (rect.width > rect.height) {
    var lwidth = Math.floor(rect.width * ratio);
    lrect = new yunabe.ui.Rect(rect.left,
                               rect.top,
                               lwidth,
                               rect.height,
                               rect.color_min, color_border);
    rrect = new yunabe.ui.Rect(rect.left + lwidth,
                               rect.top,
                               rect.width - lwidth,
                               rect.height,
                               color_border, rect.color_max);
  } else {
    var lheight = Math.floor(rect.height * ratio);
    lrect = new yunabe.ui.Rect(rect.left,
                               rect.top,
                               rect.width,
                               lheight,
                               rect.color_min,
                               color_border);
    rrect = new yunabe.ui.Rect(rect.left,
                               rect.top + lheight,
                               rect.width,
                               rect.height - lheight,
                               color_border,
                               rect.color_max);
  }
  var left_divided = divideRect(left, lrect);
  var right_divided = divideRect(right, rrect);
  var conc = left_divided.concat(right_divided);
  if (left_divided.length + right_divided.length != conc.length) {
    show_error('Fatal.');
  }
  return conc;
};

/**
 * @param {number=} opt_maxdepth
 */
var constructRectTree = function(node, rect, opt_maxdepth) {
  rect.node = node;
  if (node.children.length == 0 ||
      (rect.width < 10 || rect.height < 10) ||
      opt_maxdepth == 1) {
    return;
  }
  node.children.sort(function(x, y) {return x.size() - y.size()});
  var divided = divideRect(node.children, rect);
  if (node.children.length != divided.length) {
    show_error('Lengths of node.children and divided must be same.' +
               node.children.length + ' v.s. ' + divided.length);
  }
  for (var i = 0; i < divided.length; ++i) {
    constructRectTree(divided[i][0], divided[i][1],
                      opt_maxdepth && opt_maxdepth - 1);
    rect.children.push(divided[i][1]);
    divided[i][1].parent = rect;
  }
};
