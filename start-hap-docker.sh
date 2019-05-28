#! /bin/bash

if [ "${1}" = "" -o "${2}" = "" -o "${3}" = "" ]
then
  echo ""
  echo "Start the HAP-NodeJS based container to expose one or more accessories as a HomeKit accessory."
  echo ""
  echo "Usage ${0} <docker image name> <docker container name> <docker network name> [<i2c device bus>]"
  echo ""
  echo "Example: ${0} banjo/bandit:hap lamp-hap-container macvlan-hap 1"
  echo ""
  echo "The network is required so the accessory appears on the LAN and is visible to HomeKit apps."
  echo "it must be of type macvlan. You should create the network before creating or starting the docker instance."
  echo ""
  echo "An example command for creating the network is..."
  echo "docker network create -d macvlan --subnet=192.168.1.0/24 --gateway=192.168.1.1 -o parent=eth0 macvlan-hap"
  echo ""
  exit 0
fi

if [ "$4" != "" ]
then
  DEVICES="--device /dev/i2c-${4}:/dev/i2c-${4}"
else
  DEVICES=""
fi

IMAGE="${1}"
CONTAINER="${2}"
NETWORK="${3}"

docker rm "${CONTAINER}"
docker run --restart always -itd ${DEVICES} --network "${NETWORK}" --name "${CONTAINER}" "${IMAGE}"

#old...
#docker run --rm -itd -v /home/carlpeto/hapjs-docker/accessories:/HAP-NodeJS/accessories --device /dev/i2c-1:/dev/i2c-1 --network my-macvlan-net --name my-hapjs carlos4242/raspberrypi:hapjs-new
