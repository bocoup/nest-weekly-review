# Black Phoenix [![Status on TravisCI](https://magnum.travis-ci.com/bocoup/black-phoenix.svg?token=gK8nkH4p5NnBw5E9JB7L)](https://magnum.travis-ci.com/bocoup/black-phoenix)

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

### Running

To run in your **development environment**, execute the following command:

    $ npm start

...and visit http://localhost:8000

To run within a **virtual machine**, execute the following command:

    $ vagrant up

...and visit http://192.168.33.31

The application's dependencies on external services may be configured at run
time. This is useful for offline development and testing. The following
environmental variables will alter the application's behavior if set prior to
running the server:

- `NODE_PORT` - the TCP/IP port to which the HTTP server should be bound.
  Defaults to `8000`.
- `BP_API` - the "base" URL the client should use to make dynamic requests for
  data. By default, the value `http://api.bocoup.com` will be used, but this
  may be set to a staging server, a server with cached responses or a local
  installation of the Nest API server.
- `BP_BYPASS_AUTH` - disable all requirements for authentication. This setting
  is only useful when overriding `BP_API` and is explicitly ignored when
  `NODE_ENV` is set to `production`.

### Tests

Unit tests, linting checks and style checks can be run with the following
command:

    $ npm test

The UI tests have additional requirements on
[Java](http://www.oracle.com/technetwork/java/index.html) and
[Firefox](http://firefox.com). Once those are installed, the tests can be run
with the following command:

    $ npm run test-ui

### Building for Production

The application can be optimized into a single file with the following command:

    $ npm run build

The location of the Nest API is configurable at build time. If the `NODE_ENV`
environmental variable is set to `production`, then `http://api.bocoup.com`
will be used. This behavior can be overridden via the `BP_API` environmental
variable--that may be set to any arbitrary URL.

In order to serve the optimized file, the `NODE_ENV` environmental variable
must be set to `production` when running the server. In Unix-like systems:

    $ NODE_ENV=production npm start
