FROM resin/raspberry-pi2-node:7

# Note, see KhaosT's original instructions
# Also, thanks to KhaosT for a cool bit of software!
# https://github.com/KhaosT/HAP-NodeJS/wiki/Installing

MAINTAINER Carl Peto <carl@petosoft.com>

RUN apt-get update
RUN apt-get install git-core libnss-mdns libavahi-compat-libdnssd-dev
RUN apt-get install openssh-server
RUN npm config set registry http://registry.npmjs.org/
RUN npm install -g node-gyp

RUN git clone https://github.com/KhaosT/HAP-NodeJS.git

WORKDIR "/HAP-NodeJS"

RUN npm rebuild
RUN npm install
RUN npm install i2c-bus --save

RUN rm accessories/*.js

EXPOSE 22

COPY run-hap.sh .
COPY accessories/*_accessory.js accessories/

CMD ["./run-hap.sh"]
