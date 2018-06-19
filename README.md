# hap-docker
Docker container for HAP.js based accessories

__Not for commercial use__

To build your own accessories visible to homekit apps and the ios home app, clone this repository, then put the accessories into the accessories folder. Each will be exposed as a homekit accessory.

Build the container using ./hap-docker-build.sh and run it using ./start-hap-docker.sh.

You will need to create a macvlan docker network to expose the accessories on your LAN. Use a command such as...

`docker network create -d macvlan --subnet=192.168.1.0/24 --gateway=192.168.1.1 -o parent=eth0 macvlan-hap`

...but with suitable values for your LAN.

This is built on HapJS with thanks. Kudos.

Raise and issue, fork, help, if you want to get involved.

Carl
