var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;






// i2c
// var i2c = require('i2c');
// var address = 0x18;
// var wire = new i2c(address, {device: '/dev/i2c-1'});

var i2c = require('i2c-bus'), i2c1 = i2c.openSync(1);

console.log("starting lamp script");

function getPowerState() {
	return i2c1.readByteSync(0x23, 0x07);
	return 1;
}

function setPowerState(state) {
	console.log("Setting power state: to %s", state);
	i2c1.writeByteSync(0x23, 0x07, state);
}

function getBrightness() {
	return 105 - i2c1.readByteSync(0x23, 0x06);
	return 5;
}

function setBrightness(brightness) {
	console.log("Setting brightness: to %s", brightness);
	i2c1.writeByteSync(0x23, 0x06, 105 - brightness);
}

var CornerLampState = {
	powerOn: false,
	brightness: 0,
	setPowerOn: function(on) {

    if(on){
      setPowerState(1);
    }
    else{
      setPowerState(0);
    }

    CornerLampState.powerOn = on;
  },
  setBrightness: function(value) {
    console.log("Setting brightness to %s", value);
    CornerLampState.brightness = value;
    setBrightness(value);
  },
  identify: function() {
    CornerLampState.powerOn = getPowerState();
		CornerLampState.brightness = getBrightness();
    console.log("Lamp Identified!");
  }
}

// CornerLampState.powerOn = getPowerState();
// CornerLampState.brightness = getBrightness();

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake fan.
var lamp = exports.accessory = new Accessory('Corner Lamp', uuid.generate('hap-nodejs:accessories:Lamp2'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
lamp.username = "1B:2B:3C:4D:5E:FF";
lamp.pincode = "033-45-157";
lamp.category = Accessory.Categories.LIGHTBULB;

// set some basic properties (these values are arbitrary and setting them is optional)
lamp
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Petosoft")

// listen for the "identify" event for this Accessory
lamp.on('identify', function(paired, callback) {
  CornerLampState.identify();
  callback(); // success
});

// Add the actual Fan Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
lamp
  .addService(Service.Lightbulb, "Lightbulb") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    CornerLampState.setPowerOn(value);
    callback(); // Our fake Fan is synchronous - this value has been successfully set
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
lamp
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {

    // this event is emitted when you ask Siri directly whether your fan is on or not. you might query
    // the fan hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.

    var err = null; // in case there were any problems

    if (CornerLampState.powerOn) {
      callback(err, true);
    }
    else {
      callback(err, false);
    }
  });

lamp
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Brightness)
  .on('get', function(callback) {
    callback(null, CornerLampState.brightness);
  })
  .on('set', function(value, callback) {
    CornerLampState.setBrightness(value);
    callback();
  });


