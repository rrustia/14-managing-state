'use strict';

(function(module) {
  const repos = {};
  repos.all = [];

  //[x] DONE: Where is this invoked? What values are passed in? Where does it interact elsewhere in the code?
  // It is being invoked here in repo.js as part of the IIFE and also being invoked by aboutController.js as part of its IIFE
  repos.requestRepos = function(callback) {
    $.get('/github/user/repos?per_page=5&sort=updated')
    .then(data => repos.all = data, err => console.error(err))
    .then(callback);
  };

  repos.with = attr => repos.all.filter(repo => repo[attr]);

  module.repos = repos;
})(window);
