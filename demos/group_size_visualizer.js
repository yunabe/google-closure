goog.require('yunabe.ui.GroupSizeVisualizer');

goog.require('goog.debug.ErrorHandler');  // Needed to supress compile error.
goog.require('goog.dom');
goog.require('goog.ui.TabBar');

/**
 * @param {yunabe.ui.Rect} rect
 * @param {goog.events.Event} e Select event to handle.
 */
var handleTabSelect = function(rect, e) {
  var tab = /** @type {goog.ui.Tab} */ (e.target);
  var div = tab.getElement();
  var id = div.id;
  var container = goog.dom.getElement('container');
  if (!container) {
    return;
  }
  goog.dom.removeChildren(container);
  var start = Date.now();
  if (id == 'tab-svg') {
    var svg = rect.renderInSvg();
    container.appendChild(svg);
  } else if (id == 'tab-canvas') {
    var canvas = rect.renderInCanvas();
    container.appendChild(canvas);
  } else {
    // id == 'tab-div'
    var root = rect.renderInDiv();
    container.appendChild(root);
  }
  var end = Date.now();
  goog.dom.setTextContent(goog.dom.getElement('rendering-time'),
                          'Render: ' + (end - start) + 'ms');
};

var visualize = function(nodeObj) {
  var node = yunabe.ui.Node.parseJsonObject(nodeObj);
  var rect = new yunabe.ui.Rect(0, 0, 400, 400, 0, 360.0, 60);
  constructRectTree(node, rect);

  var tabbar = new goog.ui.TabBar();
  tabbar.decorate(goog.dom.getElement('tabbar'));
  goog.events.listen(tabbar, goog.ui.Component.EventType.SELECT,
                     goog.partial(handleTabSelect, rect));

  // Selects the first tab.
  tabbar.setSelectedTabIndex(0);

  createTreeControl(node, goog.dom.getElement('tree-container'));
};

goog.exportSymbol('visualize', visualize);
