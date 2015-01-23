# Weekly Review [![Status on TravisCI](https://magnum.travis-ci.com/bocoup/nest-weekly-review.svg?token=gK8nkH4p5NnBw5E9JB7L)](https://magnum.travis-ci.com/bocoup/nest-weekly-review)

An application for managing billing data for consulting projects

## Developing

If you'd like to work on this project, you can either manually install its
dependencies on your **local** machine or use a **virtual machine** (via
[Vagrant](http://vagrantup.com)) to run the application in a sandboxed
environment. Instructions for each are provided below.

### Installation

- [Node.js](http://nodejs.org)

Run:

    $ npm install
    $ npm run get-secrets

**Virtual Machine:**

- Ansible
  - via [pip](http://pip.readthedocs.org/en/latest/installing.html) (All
    Platforms): `pip install ansible`
  - via [homebrew](http://brew.sh/) (OSX) `brew install ansible`
  - Linux: `apt-get/yum install ansible`
- VirtualBox ([download](https://www.virtualbox.org/))
- Vagrant ([download](http://www.vagrantup.com/downloads.html))

### Running (production)

To run in your **development environment**, execute the following command:

    $ npm start

...and visit http://localhost:8000

To run within a **virtual machine**, execute the following command:

    $ vagrant up

...and visit http://192.168.33.31

The `NODE_PORT` environmental variable allows for runtime configuration of the
TCP/IP port to which the HTTP server should be bound. Defaults to `8000`.

### Running (development)

To run the application in development mode, execute the following command:

    $ npm run start-dev

In addition to `NODE_PORT` (see above), this mode allows for runtime
configuration of the application's dependencies on external services. This is
useful for offline development and testing. The following environmental
variables will alter the application's behavior if set prior to running the
server:

- `WR_API` - the "base" URL the client should use to make dynamic requests for
  data. By default, the value `http://api.bocoup.com` will be used, but this
  may be set to a staging server, a server with cached responses (see [the
  "Mock API Server" section](#mock-api-server) below) or a local installation
  of the Nest API server.
- `WR_AUTH` - control authorization requirements. May be set to `production` or
  `dev` to use associated authentication schemes. May be set to `bypass` to
  disable authentication completely (this value is only useful when overriding
  `WR_API` to reference a server instance that does not require
  authentication).

The default and current values of all recognized variables are printed to the
console each time the application is initialized.

### Mock API Server

A mock API server is available for testing. To run it, use the following
command:

    $ npm run start-api

This server also honors the `NODE_PORT` environment variable. Defaults to
`4000`.

### Tests

Unit tests, linting checks and style checks can be run with the following
command:

    $ npm test

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

### Building for Production

The application can be optimized into a single file with the following command:

    $ npm run build

The location of the Nest API is configurable at build time via the `WR_API`
environmental variable--that may be set to any arbitrary URL.
