(function() {
  const newArticle = {};

  newArticle.initNewArticlePage = function() {
    $('.tab-content').show();
    $('#export-field').hide();
    $('#article-json').on('focus', function() {
      $(this).select();
    });
    $('#new-form').on('change', newArticle.create);
  };

//[x] DONE: Where is this invoked? What values are passed in? Where does it interact elsewhere in the code?
// newArticle.create is instantly invoked, because it is contained in an IIFE. The values passed in are the values from the input fields found in new.html. It interacts with the .toHTML method of formArticle and new.HTML..
  newArticle.create = function() {
    $('#articles').empty();
    let formArticle = new Article({
      title: $('#article-title').val(),
      author: $('#article-author').val(),
      authorUrl: $('#article-author-url').val(),
      category: $('#article-category').val(),
      body: $('#article-body').val(),
      publishedOn: $('#article-published:checked').length ? new Date() : null
    });
    $('#articles').append(formArticle.toHtml('#article-template'));
    $('pre code').each((i, block) => hljs.highlightBlock(block));
    $('#export-field').show();
    $('#article-json').val(JSON.stringify(formArticle) + ',');
  };

  newArticle.initNewArticlePage();
})();
