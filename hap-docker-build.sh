#! /bin/bash

usage() {
  echo ""
  echo "This builds and tags a Docker image for a HAP-NodeJS server."
  echo "Put any accessories to install into the accessories directory. They must be named <something>_accessory.js."
  echo ""
  echo "To launch the resulting image use ./start-hap-docker.sh"
  echo "Or pass the -r switch to this script."
  echo ""
  echo "Usage ${0} <your docker username>/<repo>:<tag>"
  echo "...to build an image..."
  echo "e.g. ${0} dreebor/raspberrypi:lamp-hap"
  echo ""
  echo "Usage ${0} <your docker username>/<repo>:<tag> -r <container name>  -n <network name> -i <i2c bus number>"
  echo "...to build and run the image."
  echo "e.g. ${0} dreebor/raspberrypi:lamp-hap -r lamp-hap -n macvlan-hap"
  echo ""
  echo "Note, you must have already made a suitable network."
  echo "The network is required so the accessory appears on the LAN and is visible to HomeKit apps."
  echo "it must be of type macvlan. You should create the network before creating or starting the docker instance."
  echo ""
  echo "An example command for creating the network is..."
  echo "docker network create -d macvlan --subnet=192.168.1.0/24 --gateway=192.168.1.1 -o parent=eth0 macvlan-hap"
  echo ""
}

build_image() {
  docker build -t "${IMAGE}" .
}

run_image() {
  ./start-docker-container.sh "${IMAGE}" "${CONTAINER}" "${NETWORK}" "${I2C-BUS}"
}

if [ "${1}" = "" ]
then
  usage
  exit 0
else
  IMAGE="${1}"

  if [ "${2}" != "" ]
  then
    if [ "${2}" != "-r" -o "${3}" = "" -o "${4}" != "-n" -o "${5}" = "" ]
    then
      usage
      exit 1
    fi

    CONTAINER="${3}"
    NETWORK="${5}"

    if ! (docker network ls | grep -q "${NETWORK}")
    then
      echo "Cannot find docker network ${NETWORK}, please check your spelling."
      exit 1
    fi

    if [ "${6}" != "" ]
    then
      if [ "{6}" != "-i" -o "${7}" = "" ]
      then
        usage
        exit 1
      fi

      I2C-BUS="${7}"
    fi
  fi
fi

build_image

if [ -n "${CONTAINER}" ]
then
  run_image
fi
