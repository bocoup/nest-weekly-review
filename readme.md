# Black Phoenix

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

**Virtual Machine:**

- Ansible
  - via [pip](http://pip.readthedocs.org/en/latest/installing.html) (All
    Platforms): `pip install ansible`
  - via [homebrew](http://brew.sh/) (OSX) `brew install ansible`
  - Linux: `apt-get/yum install ansible`
- VirtualBox ([download](https://www.virtualbox.org/))
- Vagrant ([download](http://www.vagrantup.com/downloads.html))

### Running

**Local**

Run:

    $ npm start

Visit http://localhost:8000

**Virtual Machine**

Run

    $ vagrant up

Visit http://192.168.33.31

### Tests

    $ npm test
