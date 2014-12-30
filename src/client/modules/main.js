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
// Some internal links (such as those relating to session management) require a
// full page redirect. Any link that specifies a `data-passthrough` attribute
// will be ignored by this hijacking logic.
document.body.addEventListener('click', function(event) {
  var target = event.target;
  var href = target.getAttribute('href');
  var passthrough = target.getAttribute('data-passthrough') !== null;

  if (!href || !/^\//.test(href) || passthrough) {
    return;
  }

  event.preventDefault();
  router.navigate(href, { trigger: true });
});
