// Copyright 2010 Yu Watanabe. All Rights Reserved.
//
// TODO: Call goog.events.unlisten before elements with listeners are removed.

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
  this.element = null;
  this.renderType = '';
  /** @type {yunabe.ui.Rect} */
  this.selectedDescendant = null;
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
};

var hideBreadcrumb = function(e, rect) {
};

/**
 * Renders rectangles in div.
 * Please note that rendering slows down if root is appended
 * to the document root before this function is called.
 *
 * @param {Element=} opt_div
 */
yunabe.ui.Rect.prototype.renderInDiv = function(opt_div) {
  var div = opt_div;
  var need_clear = true;
  if (!div) {
    need_clear = false;
    var styles = ['position:relative',
                  'width:' + this.width + 'px',
                  'height:' + this.height + 'px'];
    div = goog.dom.createDom('div', {'style': styles.join(';')});
    goog.events.listen(div, 'click',
                       goog.partial(goog.bind(this.handleClick, this), 'div'));
  }
  if (need_clear) {
    goog.dom.removeChildren(div);
  }
  this.renderInDivInternal(div);
  if (this.selectedDescendant) {
    var styles = ['left:' + this.selectedDescendant.left + 'px',
                  'top:' + this.selectedDescendant.top + 'px',
                  'width:' + (this.selectedDescendant.width - 2) + 'px',
                  'height:' + (this.selectedDescendant.height - 2) + 'px',
                  'position:absolute',
                  'border:2px solid black',
                  'z-index:1'];
    var frame = goog.dom.createDom('div', {'style': styles.join(';')});
    div.appendChild(frame);
  }
  // Adds a transparent element to catch a click event easily.
  // TODO: Find more sophisticated way.
  var styles = ['left:0px',
                'top:0px',
                'width:' + this.width + 'px',
                'height:' + this.height + 'px',
                'position:absolute',
                'z-index:2'];
  var clickCatcher = goog.dom.createDom('div', {'style': styles.join(';')});
  div.appendChild(clickCatcher);
  this.element = div;
  this.renderType = 'div';
  return div;
};

/**
 * @param {Element=} root
 */
yunabe.ui.Rect.prototype.renderInDivInternal = function(root) {
  if (this.children.length == 0) {
    var div = document.createElement('div');
    var style = div['style'];
    style['left'] = Math.floor(this.left) + 'px';
    style['top'] = Math.floor(this.top) + 'px';
    style['width'] = Math.floor(this.width) + 'px';
    style['height'] = Math.floor(this.height) + 'px';
    style['position'] = 'absolute';
    var color_middle = Math.floor((this.color_max + this.color_min) / 2.0);
    style['background-color'] = 'hsla(' + color_middle + ',100%,' +
                                Math.floor(this.lightness) + '%,1)';
    style['border'] = '1px solid gray';
    this.div = div;
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
    root.appendChild(div);
  }
  for (var i = 0; i < this.children.length; ++i) {
    this.children[i].renderInDivInternal(root);
  }
};

/**
 * @param {HTMLCanvasElement=} opt_canvas HTMLCanvasElement is defined in
 * externs/html5.js in closure compiler project.
 */
yunabe.ui.Rect.prototype.renderInCanvas = function(opt_canvas) {
  var canvas = opt_canvas;
  var need_clear = true;
  if (!canvas) {
    need_clear = false;
    canvas = goog.dom.createDom('canvas',
                                {'width': String(this.width),
                                 'height': String(this.height)});
    goog.events.listen(canvas, 'click',
                       goog.partial(goog.bind(this.handleClick, this),
                                    'canvas'));
  }
  var context =
    /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  context.strokeStyle = 'gray';
  context.lineWidth = 1;
  if (need_clear) {
    context.clearRect(0, 0, this.width, this.height);
  }
  this.renderInCanvasInternal(context);

  if (this.selectedDescendant) {
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.strokeRect(this.selectedDescendant.left + 0.5,
                       this.selectedDescendant.top + 0.5,
                       this.selectedDescendant.width,
                       this.selectedDescendant.height);
  }

  this.element = canvas;
  this.renderType = 'canvas';
  return canvas;
};

/**
 * @param {CanvasRenderingContext2D} context
 */
yunabe.ui.Rect.prototype.renderInCanvasInternal = function(context) {
  if (this.children.length == 0) {
    // TODO: Understand why it works almost as I expected.
    context.strokeRect(this.left + 0.5, this.top + 0.5,
                       this.width, this.height);
    if (this.width > 1 && this.height > 1) {
      var color_middle = Math.floor((this.color_max + this.color_min) / 2.0);
      context.fillStyle = 'hsla(' + color_middle + ',100%,' +
        Math.floor(this.lightness) + '%,1)';
      context.fillRect(this.left + 1, this.top + 1,
                       this.width - 1, this.height -1);
    }
  }
  for (var i = 0; i < this.children.length; ++i) {
    this.children[i].renderInCanvasInternal(context);
  }
};

/**
 * @param {Element=} opt_svg Actually, the type of svg is SVGSVGElement but
 *    it is not defined in closure compiler so far.
 */
yunabe.ui.Rect.prototype.renderInSvg = function(opt_svg) {
  var svg = opt_svg;
  var need_clear = true;
  if (!svg) {
    need_clear = false;
    // namespace is mandatory in JavaScript.
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewbox', '0 0 ' + this.width + ' ' + this.height);
    svg.setAttribute('width', this.width + 'px');
    svg.setAttribute('height', this.height + 'px');
    goog.events.listen(svg, 'click',
                       goog.partial(goog.bind(this.handleClick, this), 'svg'));
  }
  if (need_clear) {
    goog.dom.removeChildren(svg); 
  }
  this.renderInSvgInternal(svg);
  if (this.selectedDescendant) {
    var frame = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    frame.setAttribute('x', this.selectedDescendant.left + 0.5);
    frame.setAttribute('y', this.selectedDescendant.top + 0.5);
    frame.setAttribute('width', this.selectedDescendant.width);
    frame.setAttribute('height', this.selectedDescendant.height);
    frame.setAttribute('style',
                       'fill:hsla(0,0%,0%,0);stroke:black;stroke-width:2');
    svg.appendChild(frame);
  }
  this.element = svg;
  this.renderType = 'svg';
  return svg;
};

/**
 * @param {Element} svg
 */
yunabe.ui.Rect.prototype.renderInSvgInternal = function(svg) {
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
    this.children[i].renderInSvgInternal(svg);
  }
};

yunabe.ui.Rect.prototype.redraw = function() {
  if (this.renderType == 'div') {
    this.renderInDiv(this.element);
  } else if (this.renderType == 'canvas') {
    this.renderInCanvas(/** @type {HTMLCanvasElement} */ (this.element));
  } else if (this.renderType == 'svg') {
    this.renderInSvg(this.element);
  }
};

/**
 * @param {string} type one of 'canvas', 'svg' and 'div'.
 * @param {goog.events.Event} e Click event
 */
yunabe.ui.Rect.prototype.handleClick = function(type, e) {
  var x = e.offsetX;
  var y = e.offsetY;
  var clicked = this.getClicked(x, y);
  if (!clicked) {
    return;
  }
  this.selectedDescendant = clicked;
  this.redraw();

  var bc = document.getElementById('breadcrumb');
  var b = new yunabe.ui.Breadcrumb();
  b.decorate(clicked, bc);
};

/**
 * @param {number} left
 * @param {number} top
 * @return {yunabe.ui.Rect}
 */
yunabe.ui.Rect.prototype.getClicked = function(left, top) {
  if (this.children.length == 0 &&
      this.left <= left  && left <= this.left + this.width &&
      this.top <= top  && top <= this.top + this.height) {
    return this;
  }
  for (var i = 0; i < this.children.length; ++i) {
    var clicked = this.children[i].getClicked(left, top);
    if (clicked) {
      return clicked;
    }
  }
  return null;
};

/**
 * @constructor
 */
yunabe.ui.Node = function(opt_parent) {
  this.size_ = -1;
  this.children = [];
  this.name = '';
  this.parent = opt_parent || null;
  this.rectNode = null;
  this.treeNode = null;
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
  node.rectNode = rect;
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
 * @param {string} html
 * @param {Object=} opt_config
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.tree.TreeControl}
 */
yunabe.ui.GroupTreeControl = function(html, opt_config, opt_domHelper) {
  goog.ui.tree.TreeControl.call(this, html, opt_config, opt_domHelper);
  this.node = null;
};
goog.inherits(yunabe.ui.GroupTreeControl, goog.ui.tree.TreeControl);

/** @override */
yunabe.ui.GroupTreeControl.prototype.createNode = function(html) {
  return new yunabe.ui.GroupTreeNode(html || '', this.getConfig(),
      this.getDomHelper());
};

/**
 * @param {string} html
 * @param {Object=} opt_config
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.tree.TreeNode}
 */
yunabe.ui.GroupTreeNode = function(html, opt_config, opt_domHelper) {
  goog.ui.tree.TreeNode.call(this, html, opt_config, opt_domHelper);
  this.node = null;
};
goog.inherits(yunabe.ui.GroupTreeNode, goog.ui.tree.TreeNode);

/**
 * Handles a double click event.
 * @param {!goog.events.BrowserEvent} e The browser event.
 * @protected
 * @suppress {underscore}
 */
yunabe.ui.GroupTreeNode.prototype.onClick_ = function(e) {
  var el = e.target;
  var type = el.getAttribute('type');
  if (type != 'expand') {
    // el is not expand icon.
    // c.f. goog/ui/tree/basenode.js onMouseDown.
    var rect = this.node.rectNode;
    var root = rect;
    while (root.parent) {
      root = root.parent;
    }
    root.selectedDescendant = rect;
    root.redraw();    
  }
  // Do we really need this?
  goog.events.Event.preventDefault.call(this, e);
};

/**
 * @param {yunabe.ui.Node} node
 * @param {Element} container
 */
var createTreeControl = function(node, container) {
  var treeConfig = goog.ui.tree.TreeControl.defaultConfig;
  treeConfig.cleardotPath = 'images/tree/cleardot.gif';
  var tree = new yunabe.ui.GroupTreeControl('', treeConfig);
  constructTreeControl(node, tree);
  tree.render(container);
};

/**
 * @param {yunabe.ui.Node} node
 * @param {yunabe.ui.GroupTreeControl} tree
 */
var constructTreeControl = function(node, tree) {
  node.treeNode = tree;
  tree.node = node;
  tree.setHtml(node.name);
  tree.setIsUserCollapsible(true);
  for (var i = 0; i < node.children.length; ++i) {
    var childNode = tree.getTree().createNode('');
    tree.add(childNode);
    constructTreeControl(node.children[i], childNode);
  }
};

/**
 * @constructor
 */
yunabe.ui.Breadcrumb = function() {
};

/**
 * @param {yunabe.ui.Rect} leaf
 * @param {Element} element
 */
yunabe.ui.Breadcrumb.prototype.decorate = function(leaf, element) {
  var rect = leaf;
  var rects = [];
  while (rect) {
    rects.unshift(rect);
    rect = rect.parent;
  }
  goog.dom.removeChildren(element);
  for (var i = 0; i < rects.length; ++i) {
    var span = goog.dom.createDom('span');
    goog.dom.setTextContent(span, rects[i].node.name);
    goog.events.listen(span, 'click',
                       goog.partial(goog.bind(this.handleSelect, this),
                                    rects[i]));
    goog.dom.appendChild(element, span);
    if (i != rects.length - 1) {
      goog.dom.appendChild(element, goog.dom.createTextNode(' \u203a '));
    }
  }
};

/**
 * @param {yunabe.ui.Rect} rect
 * @param {goog.events.Event} e
 */
yunabe.ui.Breadcrumb.prototype.handleSelect = function(rect, e) {
  var root = rect;
  while (root.parent) {
    root = root.parent;
  }
  root.selectedDescendant = rect;
  root.redraw();
};
