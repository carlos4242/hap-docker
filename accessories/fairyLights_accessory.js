var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

const gpioPipe = "/home/carlpeto/node/flasher";
const lightsPin = 18;

console.log("starting fairy lights script");

function setPowerState(state) {
	console.log("Setting power state: to %s", state);

  fs.exists(gpioPipe, function(exists) {
  if (exists) {

    var writableStream = fs.createWriteStream(gpioPipe);

    if (state) {
      writableStream.write('p:'+lightsPin+':001\n'); 
    } else {
      writableStream.write('p:'+lightsPin+':000\n'); 
    }
  }
}

var FairyLightsState = {
	powerOn = false,
	setPowerOn: function(on) {

    if(on){
      setPowerState(1);
    }
    else{
      setPowerState(0);
    }

    FairyLightsState.powerOn = on;
  },
  identify: function() {
    FairyLightsState.powerOn = false;
    console.log("Lamp Identified!");
  }
}

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake fan.
var fairy = exports.accessory = new Accessory('Fairy Lights', uuid.generate('hap-nodejs:accessories:FairyLights1'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
fairy.username = "1B:2B:3C:4D:5E:FF";
fairy.pincode = "033-45-157";
fairy.category = Accessory.Categories.LIGHTBULB;

// set some basic properties (these values are arbitrary and setting them is optional)
lamp
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Petosoft")

// listen for the "identify" event for this Accessory
lamp.on('identify', function(paired, callback) {
  FairyLightsState.identify();
  callback(); // success
});

// Add the actual Fan Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
lamp
  .addService(Service.Lightbulb, "Lightbulb") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    FairyLightsState.setPowerOn(value);
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

    if (FairyLightsState.powerOn) {
      callback(err, true);
    }
    else {
      callback(err, false);
    }
  });
