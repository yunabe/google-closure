// Copyright 2010 Yu Watanabe. All Rights Reserved.

/**
 * @fileoverview UI component to ...
 */

goog.provide('yunabe.ui.GroupSizeVisualizer');

goog.require('goog.ui.tree.TreeControl');

/**
 * @constructor
 */
yunabe.ui.Rect = function(left, top, width, height,
                          color_min, color_max, lightness) {
  this.left = left;
  this.top = top;
  this.width = width;
  this.height = height;
  this.color_min = color_min;
  this.color_max = color_max;
  this.lightness = lightness;

  this.children = [];
  this.node = null;
  this.parent = null;
  this.div = null;
};

yunabe.ui.Rect.prototype.createSameSize = function() {
  return new yunabe.ui.Rect(this.left, this.top, this.width, this.height,
                            this.color_min, this.color_max, this.lightness);
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
  style['background-color'] = 'hsla(' + color_middle + ',100%,' +
                              Math.floor(this.lightness) + '%,1)';

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
 * @param {HTMLCanvasElement} canvas HTMLCanvasElement is defined in
 * externs/html5.js in closure compiler project.
 */
yunabe.ui.Rect.prototype.renderInCanvas = function(canvas) {
  var context =
    /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  context.strokeStyle = 'gray';
  // TODO: Canvas does not render 1px line as we expect. Fix this.
  // http://code.anjanesh.net/2009/05/1-pixel-wide-line-parallel-to-axis-in.html
  context.lineWidth = 1;
  this.renderInCanvasInternal(context);
};

/**
 * @param {CanvasRenderingContext2D} context
 */
yunabe.ui.Rect.prototype.renderInCanvasInternal = function(context) {
  if (this.children.length == 0) {
    context.strokeRect(this.left, this.top, this.width, this.height);
    if (this.width > 1 && this.height > 1) {
      var color_middle = Math.floor((this.color_max + this.color_min) / 2.0);
      context.fillStyle = 'hsla(' + color_middle + ',100%,' +
        Math.floor(this.lightness) + '%,1)';
      context.fillRect(this.left + 1, this.top + 1,
                       this.width - 1, this.height - 1);
    }
  }
  for (var i = 0; i < this.children.length; ++i) {
    this.children[i].renderInCanvasInternal(context);
  }
};

yunabe.ui.Rect.prototype.renderSvg = function() {
  // namespace is mandatory in JavaScript.
  var svg = document.createElementNS('http://www.w3.org/2000/svg',
                                     'svg');
  alert(svg);
  svg.setAttribute('viewbox', '0 0 ' + this.width + ' ' + this.height);
  svg.setAttribute('width', this.width + 'px');
  svg.setAttribute('height', this.height + 'px');
  this.renderSvgInternal(svg);
  return svg;
};


yunabe.ui.Rect.prototype.renderSvgInternal = function(svg) {
  if (this.children.length == 0) {
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', this.left + 0.5);
    rect.setAttribute('y', this.top + 0.5);
    rect.setAttribute('width', this.width);
    rect.setAttribute('height', this.height);
    var color_middle = Math.floor((this.color_max + this.color_min) / 2.0);
    var color = 'hsla(' + color_middle + ',100%,' +
        Math.floor(this.lightness) + '%,1)';
    rect.setAttribute('style',
                      'fill:' + color + ';stroke:gray;stroke-width:1');
    svg.appendChild(rect);
  }
  for (var i = 0; i < this.children.length; ++i) {
    this.children[i].renderSvgInternal(svg);
  }
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

/**
 * @param {number=} opt_direction
 */
var divideRect = function(nodes, rect, opt_direction) {
  opt_direction = opt_direction || 0;
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

  if ((rect.width > rect.height && (opt_direction & 1) == 0) ||
      (rect.width <= rect.height && (opt_direction & 2) == 0)) {
    var color_border = rect.color_min + (rect.color_max - rect.color_min) * ratio;
    var lcolor_min = rect.color_min;
    var lcolor_max = color_border;
    var rcolor_min = color_border;
    var rcolor_max = rect.color_max;
  } else {
    var color_border = rect.color_min + (rect.color_max - rect.color_min) * (1 - ratio);
    var lcolor_min = color_border;
    var lcolor_max = rect.color_max;
    var rcolor_min = rect.color_min;
    var rcolor_max = color_border;
  }
  if (rect.width > rect.height) {
    var lwidth = Math.floor(rect.width * ratio);
    lrect = new yunabe.ui.Rect(rect.left,
                               rect.top,
                               lwidth,
                               rect.height,
                               lcolor_min, lcolor_max,
                               rect.lightness);
    rrect = new yunabe.ui.Rect(rect.left + lwidth,
                               rect.top,
                               rect.width - lwidth,
                               rect.height,
                               rcolor_min, rcolor_max,
                               rect.lightness);
    opt_direction = opt_direction ^ 1;
  } else {
    var lheight = Math.floor(rect.height * ratio);
    lrect = new yunabe.ui.Rect(rect.left,
                               rect.top,
                               rect.width,
                               lheight,
                               lcolor_min, lcolor_max,
                               rect.lightness);
    rrect = new yunabe.ui.Rect(rect.left,
                               rect.top + lheight,
                               rect.width,
                               rect.height - lheight,
                               rcolor_min, rcolor_max,
                               rect.lightness);
    opt_direction = opt_direction ^ 2;
  }
  var left_divided = divideRect(left, lrect, opt_direction);
  var right_divided = divideRect(right, rrect, opt_direction);
  var conc = left_divided.concat(right_divided);
  if (left_divided.length + right_divided.length != conc.length) {
    show_error('Fatal.');
  }
  return conc;
};

/**
 * @param {number=} opt_maxdepth
 * @param {number=} opt_depth
 */
var constructRectTree = function(node, rect, opt_maxdepth, opt_depth) {
  opt_depth = opt_depth || 1;
  rect.node = node;
  if (node.children.length == 0 ||
      (rect.width < 10 || rect.height < 10) ||
      (opt_maxdepth && opt_maxdepth == opt_depth)) {
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
                      opt_maxdepth, opt_depth + 1);
    rect.children.push(divided[i][1]);
    divided[i][1].parent = rect;
  }
};

/**
 * @param {yunabe.ui.Node} node
 * @param {Element} container
 */
var createTreeControl = function(node, container) {
  var treeConfig = goog.ui.tree.TreeControl.defaultConfig;
  treeConfig.cleardotPath = 'images/tree/cleardot.gif';
  var tree = new goog.ui.tree.TreeControl(node.name, treeConfig);
  constructTreeControl(node, tree);
  tree.render(container);
};

/**
 * @param {yunabe.ui.Node} node
 * @param {goog.ui.tree.TreeControl} tree
 */
var constructTreeControl = function(node, tree) {
  tree.setHtml(node.name);
  tree.setIsUserCollapsible(true);
  for (var i = 0; i < node.children.length; ++i) {
    var childNode = tree.getTree().createNode('');
    tree.add(childNode);
    constructTreeControl(node.children[i], childNode);
  }
};
