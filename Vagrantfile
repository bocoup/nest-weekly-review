# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "hashicorp/precise64"
  config.vm.network "private_network", ip: "192.168.33.31"
  config.vm.provision "ansible" do |ansible|
    ansible.limit = "vagrant"
    ansible.inventory_path = "deploy/ansible/inventory/development"
    ansible.playbook = "deploy/ansible/provision.yml"
  end

  config.exec.commands %w{weekly-review}, prepend: 'sudo service'
  config.exec.commands 'watch-log', prepend: 'sudo', env: { PATH: '$PATH:/vagrant/bin' }
  config.exec.commands %w[test run], prepend: 'npm'
end
