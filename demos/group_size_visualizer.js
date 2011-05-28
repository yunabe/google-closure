goog.require('yunabe.ui.GroupSizeVisualizer');

var visualize = function(nodeObj, div) {
  var node = yunabe.ui.Node.parseJsonObject(nodeObj);
  var rect = new yunabe.ui.Rect(0, 0, 900, 600, 0, 360.0);
  constructRectTree(node, rect);
  div.appendChild(rect.createDiv());
};

goog.exportSymbol('visualize', visualize);
