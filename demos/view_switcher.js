goog.require('yunabe.misc.GoogleImageSearch');
goog.require('yunabe.ui.GridListSwitcher');

goog.require('goog.ui.ToggleButton');
goog.require('goog.Uri');

/**
 * @constructor
 * @extends yunabe.ui.GridListSwitcher
 *
 * @param {string} thumbnailClassName
 * @param {boolean} isGrid
 * @param {Array.<google.search.GimageResult>} imageResults
 */
var ThumbnailViewSwitcher = function(thumbnailClassName, isGrid,
                                     imageResults) {
  var gridview = goog.dom.$('grid');
  var listview = goog.dom.$('list');
  var harbor = goog.dom.$('harbor');
  this.imageResults_ = imageResults;
  yunabe.ui.GridListSwitcher.call(this, gridview, listview, harbor,
                                  thumbnailClassName, isGrid);
  var i;
  var content;
  content = '<table border="1">';
  for(i = 0; i < imageResults.length; ++i) {
    var result = imageResults[i];
    var tbWidth = Number(result.tbWidth) + 10;
    var tbHeight = Number(result.tbHeight) + 10;
    if (i % 5 == 0) {
      content += '<tr>';
    }
    content += '<td valign="top">' +
               '<div class="thumbnail" style="width:' + tbWidth + 'px;' +
               'height:' + tbHeight + 'px"></div>';
  }
  content += '</table>';
  gridview.innerHTML = content;

  content = '<table border="1">';
  content += '<tr>';
  for (i = 0; i < 2; ++i) {
    content += '<td>image<td>title<td>size';
  }
  content += '</tr>';
  for(i = 0; i < imageResults.length; ++i) {
    var result = imageResults[i];
    var tbWidth = Number(result.tbWidth) + 10;
    var tbHeight = Number(result.tbHeight) + 10;
    if (i % 2 == 0) {
      content += '<tr>';
    }
    content += '<td valign="top">' +
               '<div class="thumbnail" style="width:' + tbWidth + 'px;' +
               'height:' + tbHeight + 'px"></div>';
    content += '<td>' + result.titleNoFormatting + '</td>';
    content += '<td>' + result.width + 'x' + result.height + '</td>';
  }
  content += '</table>';
  listview.innerHTML = content;
};

goog.inherits(ThumbnailViewSwitcher, yunabe.ui.GridListSwitcher);

/** @type Array.<google.search.GimageResult> */
ThumbnailViewSwitcher.prototype.imageResults_ = [];

ThumbnailViewSwitcher.prototype.initThumbnails = function() {
  var i;
  for (i = 0; i < this.imageResults_.length; ++i) {
    var div = goog.dom.createDom('div', {'style':
                                         'z-index:1;position:absolute;'});
    var link = goog.dom.createDom('a', {'href': this.imageResults_[i].url});
    var image = goog.dom.createDom('img',
                                   {'src': this.imageResults_[i].tbUrl});
    image.style['padding'] = '5px';
    image.style['background-color'] = '#fff';
    div.appendChild(link);
    link.appendChild(image);
    this.thumbnails_.push(div);
    this.harbor_.appendChild(div);
  }
};

/**
 * @param {Array.<google.search.GimageResult>} results
 */
var showImageSearchResults = function(results) {
  var switcher = new ThumbnailViewSwitcher('thumbnail', true, results);
  switcher.initialize();
  goog.events.listen(goog.dom.$('switch_button'), 'click',
                     goog.bind(switcher.switchView, switcher));
};

var main = function() {
  var uri = new goog.Uri(document.location.href, true);
  
  var query = /** @type {string} */ (uri.getParameterValue('q')) || 'ocean';
  var imageSearch = new yunabe.misc.GoogleImageSearch();
  imageSearch.search(query, 15, showImageSearchResults);
};

var init = function() {
  if (!window['google'] || !google.load) {
    // Note that !google causes ReferenceError.
    alert('Google AJAX API Loader is not loaded');
    return;
  }
  google.load('search', '1');
  google.setOnLoadCallback(main);
};

init();
