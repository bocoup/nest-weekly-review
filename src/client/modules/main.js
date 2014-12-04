'use strict';
var Router = require('./router');

var router = new Router({ el: document.body });

router.history.start({
  pushState: true
});

// Because this application uses HTML5 pushstate, internal links are written
// using root-relative paths. Click events on these links should be intercepted
// and handled with the application router (this prevents a full page
// redirect).
document.body.addEventListener('click', function(event) {
  var target = event.target;
  var href = target.getAttribute('href');

  if (!href || !/^\//.test(href)) {
    return;
  }

  event.preventDefault();
  router.redirectTo(href);
});
