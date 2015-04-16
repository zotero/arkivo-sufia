# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "debian74-puppet"
  # config.vm.box_url = "http://domain.com/path/to/above.box"

  config.vm.define "sufia" do |ss|
    ss.vm.network "forwarded_port", guest: 3000, host: 6080

    ss.vm.provider "virtualbox" do |vb|
      vb.customize ["modifyvm", :id, "--memory", "1024"]
    end

    ss.vm.provision "puppet" do |puppet|
      puppet.manifests_path = "puppet/manifests"
      puppet.module_path = "puppet/modules"
      puppet.manifest_file  = "sufia.pp"
    end
  end
end
