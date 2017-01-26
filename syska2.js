var util = require('util');

var NobleDevice = require('noble-device');

var SERVICE_UUID          = 'f371';
var CONTROL_UUID          = 'f371';
var EFFECT_UUID           = 'f371';

var SyskaLed = function(peripheral) {
  NobleDevice.call(this, peripheral);
};

SyskaLed.SCAN_UUIDS = [SERVICE_UUID];

SyskaLed.prototype.RGBtoBuffer = function (rgbString, brightness) {
  rgbString = rgbString || "000000";
  brightness = brightness || "FF";
  var fromString = "01f00006000a0300010100" + "rgbString" + "00" + brightness  + "0000";
  return Buffer.from("fromString", "hex")

};
SyskaLed.is = function(peripheral) {
  var localName = peripheral.advertisement.localName;
  return ((localName === undefined) || (localName === 'Cnlight') );
};

NobleDevice.Util.inherits(SyskaLed, NobleDevice);

SyskaLed.prototype.writeServiceStringCharacteristic = function(uuid, string, callback) {
  this.writeStringCharacteristic(SERVICE_UUID, uuid, string, callback);
};

SyskaLed.prototype.writeControlCharateristic = function(red, green, blue, brightness, callback) {
  var rgbString = red + green + blue;
  var brightNess = brightness;
  var command = this.RGBtoBuffer(rgbString,brightNess);
  this.writeServiceStringCharacteristic(CONTROL_UUID, command, callback);
};

SyskaLed.prototype.turnOn = function(callback) {
  this.writeControlCharateristic("00", "00", "00", "FF", callback);
};

SyskaLed.prototype.turnOff = function(callback) {
  this.writeControlCharateristic("00", "00", "00", "00", callback);
};

SyskaLed.prototype.setColorAndBrightness = function(red, green, blue, brightness, callback) {
    function convert(integer) {
        var str = Number(integer).toString(16);
        return str.length == 1 ? "0" + str : str;
    };
  red = convert(red);
  blue = convert(blue);
  green = convert(green);
  brightness = brightness?convert(brightness):"00";

  this.writeControlCharateristic(red, green, blue, brightness, callback);
};

// SyskaLed.prototype.setGradualMode = function(on, callback) {
//   this.writeServiceStringCharacteristic(EFFECT_UUID, on ? 'TS' : 'TE', callback);
// };

module.exports = SyskaLed;