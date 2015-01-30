# Weekly Review [![Status on TravisCI](https://magnum.travis-ci.com/bocoup/nest-weekly-review.svg?token=gK8nkH4p5NnBw5E9JB7L)](https://magnum.travis-ci.com/bocoup/nest-weekly-review)

An application for managing billing data for consulting projects

## Developing

If you'd like to work on this project, you can either manually install its
dependencies on your **local** machine or use a **virtual machine** (via
[Vagrant](http://vagrantup.com)) to run the application in a sandboxed
environment. Instructions for each are provided below.

For practical details on application architectural, testing strategy, and build
optimization, please see the `contributing.md` file.

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
  may be set to a staging server or a local installation of the Nest API
  server.
- `WR_BYPASS_AUTH` - when set to any value, the application will
  self-authorize. This only makes sense in contexts where `WR_API` references a
  permissive server instance (i.e. a local installation of the API).

The default and current values of all recognized variables are printed to the
console each time the application is initialized.

### Deployment

To provision the production server environment, execute the following command
from the `deploy/ansible/` directory:

    $ ansible-playbook -i inventory/production provision.yml

Future application-level changes that do not require changes to the system
environment can be deployed with the streamlined "deploy" command described
below.

During deployment, code is sourced from the upstream git repo. Execute the
following command from the `deploy/ansible/` directory:

    $ ansible-playbook -i inventory/production deploy.yml
