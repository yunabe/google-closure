goog.require('yunabe.misc.GoogleImageSearch');

/**
 * @param {Array.<google.search.GimageResult>} results
 */
var showImageSearchResults = function(results) {
  var resultsDiv = document.getElementById('results');
  var table = '<table border="1">';
  for (var i = 0; i < results.length; ++i) {
    var result = results[i];
    if (i % 4 == 0) {
      table += '<tr>';
    }
    table += '<td><a href="' + result.url + '"><img src="' +
             result.tbUrl + '"></img></a></td>';
    if (i % 4 == 3 || i == results.length - 1) {
      table += '</tr>';
    }
  }
  table += '</tr></table>';
  resultsDiv.innerHTML = table;
};

var main = function() {
  var imageSearch = new yunabe.misc.GoogleImageSearch();
  imageSearch.search('blue ocean', 16, showImageSearchResults);
};

var init = function() {
  if (!window.google || !window.google.load) {
    // Note that !google causes ReferenceError.
    alert('Google AJAX API Loader is not loaded');
  }
  google.load('search', '1');
  google.setOnLoadCallback(main);
};

init();
