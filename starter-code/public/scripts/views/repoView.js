'use strict';

(function(module) {
  const repoView = {};

  const ui = function() {
    let $about = $('#about');

    $about.find('ul').empty();
    $about.show().siblings().hide();
  };

  //[x] DONE: What is in 'render'? What values are passed in? Where does it interact elsewhere in the code?
  // the render variable is immutable, and it contains the text from id=repo-template (found in the head of index.html)
  const render = Handlebars.compile($('#repo-template').text());

  repoView.index = function() {
    ui();

    $('#about ul').append(
      repos.with('name').map(render)
    );
  };

  module.repoView = repoView;
})(window);
