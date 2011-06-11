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
    var svg = rect.renderSvg();
    container.appendChild(svg);
  } else if (id == 'tab-canvas') {
    var canvas = goog.dom.createDom('canvas',
                                    { 'width': '400',
                                      'height': '400'});
    rect.renderInCanvas(/** @type {HTMLCanvasElement} */ (canvas));
    container.appendChild(canvas);
  } else {
    // id == 'tab-div'
    var root = goog.dom.createDom(
         'div', {'style': 'position:relative;width:400px;height:400px'});

    rect.renderUsingDiv(root);
    // Note that it takes longer time to render if you append root to container
    // before renderUsingDiv.
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
