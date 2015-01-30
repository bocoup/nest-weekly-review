# Contributing

### Architectural Overview

The modules in this application are defined using [the CommonJS module
format](http://wiki.commonjs.org/wiki/Modules/1.1), which is consumed by [the
Browserify library](http://browserify.org/) to produce a single JavaScript file
suitable for execution in web browser contexts.

**Libraries** The [Ampersand](https://ampersandjs.com/) suite of modules
provide the data interface (via
[`ampersand-model`](https://github.com/ampersandjs/ampersand-model) and
[`ampersand-rest-collection`](https://github.com/ampersandjs/ampersand-rest-collection))
and routing support (via
[`ampersand-router`](https://github.com/ampersandjs/ampersand-router). These
modules were forked from the [Backbone.js](http://backbonejs.org/) library and
should feel familiar to anyone who has worked with that library.

The application uses [Ractive.js](http://www.ractivejs.org/) for its view
layer.

**Component Structure** Each well-defined region of the UI is implemented as a
distinct Ractive.js "component". These components enforce some degree of
separation of concerns through:

- "scoped" CSS: style rules defined on a component instance will not apply
  outside of the component's element
- Data isolation: components do not have access to information other than what
  is explicitly provided to them. Note this is **not** default behavior of
  Ractive.js view instances, but it enforced by the consistent use of [the
  `isolated` view configuration
  property](http://docs.ractivejs.org/latest/options#isolated).

Components may communicate with their parents by emitting events.

### Tests

Unit tests, linting checks and style checks can be run with one of the
following commands (selected according to the development environment):

    # Local development
    $ npm test

    # Vagrant-assisted development
    $ vagrant exec test

The UI tests have additional requirements on
[Java](http://www.oracle.com/technetwork/java/index.html) and
[Firefox](http://firefox.com). Once those are installed, the tests can be run
with the following command:

    $ npm run test-ui

The UI tests run against API fixture data to promote reproducibility and
facilitate offline development. If a change to the application or the tests
effects the external requests made during the test runs, the fixture data will
have to be re-recorded from a locally running installation of the API. To do
this, remove the `/test/ui/fixtures` directory and run the tests with the
`REPLAY` environmental variable set to `record`. In \*nix environments:

    # (first, ensure the API is available at http://api.loc)
    $ rm -rf test/ui/fixtures
    $ REPLAY=record npm run test-ui

The `test/` directory is dedicated to this application's automated tests and
testing infrastructure. Unit tests are used to express expectations of
functional code (models, utilities, etc.) while UI tests are used to verify
correctness of the user interface and general module interconnections. Both
test suites are structured using [the Mocha testing
framework](http://mochajs.org/) and [the Chai assertion
library](http://chaijs.com/). The UI tests additionally rely on
[Selenium](http://www.seleniumhq.org/) (and [the Leadfoot Selenium
bindings](https://theintern.github.io/leadfoot/)) to automate browser behavior.

Any change to the code base (whether a bug fix or new feature) should be backed
by an automated test of some sort. Unit tests should be preferred in all cases
due to their speed of execution, ability to localize errors, and general
simplicity to author. In those cases where unit tests are not appropriate, a
"test driver" module is available to facilitate the implementation of
integration tests. This driver abstracts details regarding HTML elements, CSS
selectors, and browser communication race conditions. UI tests should be
structured to use the test driver as an interface between assertions and the
Selenium interface in order to promote readability and reusability.

### Building for Production

The application can be optimized into a single file with the following command:

    $ npm run build

The location of the Nest API is configurable at build time via the `WR_API`
environmental variable--that may be set to any arbitrary URL.
