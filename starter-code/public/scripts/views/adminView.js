//[x] DONE: Where is this invoked? Where does it interact elsewhere in the code?
//It's being invoked here in the IIFE and initializes our admin page

(function() {
  const adminView = {
    initAdminPage : () => {
      let template = Handlebars.compile($('#author-template').text());
      Article.numWordsByAuthor().forEach(stat => $('.author-stats').append(template(stat)));
      $('#blog-stats .articles').text(Article.all.length);
      $('#blog-stats .words').text(Article.numWordsAll());
    }
  };

  Article.fetchAll(adminView.initAdminPage);
})();
