'use strict';

(function(module) {
  const aboutController = {};

  aboutController.index = () => {
    $('#about').show().siblings().hide();
    repos.requestRepos(repoView.index);
  };

  //[x] DONE: What value is in 'module'? What is the purpose of this line of code?
  // It's the reference to the objects or variables that will be made available outside of the IIFE.
  module.aboutController = aboutController;

})(window);
