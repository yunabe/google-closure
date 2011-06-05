goog.require('yunabe.ui.GroupSizeVisualizer');

goog.require('goog.debug.ErrorHandler');  // Needed to supress compile error.
goog.require('goog.dom');

var visualize = function(nodeObj, div) {
  var node = yunabe.ui.Node.parseJsonObject(nodeObj);
  var rect = new yunabe.ui.Rect(0, 0, 400, 400, 0, 360.0, 60);
  constructRectTree(node, rect);
  div.appendChild(rect.createDiv());

  var canvas = /** @type {HTMLCanvasElement} */ (goog.dom.getElement(
                                                     'convas-container'));
  if (canvas) {
    rect.renderInCanvas(canvas);
  }
  createTreeControl(node, goog.dom.getElement('tree-container'));
};

goog.exportSymbol('visualize', visualize);
