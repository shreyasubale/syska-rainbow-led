var noble = require('noble');
var _ = require("underscore");
function SyskaLed(options,cb){
    this._options = {};
	this._connectedPeripherals = [];
    this._discoveredPeripherals = {};
	this._poweredOn = false;
	this._instructionQueue =[];
	this.scanActive = false;

	var defaultOptions = {
	    activeConnectionTime: 500,
        scanTime : 2000
    };
    _.extend(this._options,defaultOptions,options);
	var serviceUUids = (options && options.serviceUUids) || ['f371'];
	// var color = [0x01,0xf0,0x00,0x06,0x00,0x0a,0x03,0x00,0x01,0x01,0x00,0xRR,0xGG,0xBB,0x00,0x00,0x00,0x00];
	this.defaultColor = [0x01,0xf0,0x00,0x06,0x00,0x0a,0x03,0x00,0x01,0x01,0x00,0xff,0xff,0x00,0x00,0x00,0x00,0x00];
	this._bindEvents();
}
	
SyskaLed.prototype._bindEvents = function() {
    var whiteList = this.options.whiteList ||  ['f371'];
    noble.on('discover', function(peripheral) {
        this._discoveredPeripheralsp[peripheral.uuid] = peripheral;
        console.log('Found device with local name: ' + peripheral.advertisement.localName);
        console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
        noble.stopScanning();
        console.log("connecting");
    }.bind(this));

    noble.on('stateChange', function(state) {
        this._poweredOn = true;
        if(state ==='poweredOn'){
            noble.startScanning(whiteList,false);
        }
    }.bind(this));

    noble.on('scanStart', function () {
		this.scanActive = true;
    }.bind(this));

    noble.on('scanStop', function () {
		this.scanActive = false;
    }.bind(this));

};

SyskaLed.prototype.colorChangeInstruction = function() {

};

SyskaLed.prototype._processInstruction = function () {
	var instruction = undefined;
	if(this._instructionQueue.length === 0){
		this._peripheral.disconnect(function(){
            console.log("Peripheral Disconnected after write");
        });
	}else{
		instruction = this._instructionQueue.pop();
		this[instruction.name+"Instruction"].call(this,instruction.params);
	}
};

SyskaLed.prototype._setInstruction = function (instruction) {
	this._instructionQueue.push({
		'name': instruction.name,
		'params' : instruction.params || undefined
	});
	this._processInstruction();
};


SyskaLed.prototype.connectPeripherals = function() {
    var oThis = this;
    this._discoveredPeripherals.forEach(function (peripheral) {

        peripheral.once('disconnect', function() {
            delete  oThis._connectedPeripherals[this.uuid];
        });

        peripheral.once('connect', function() {
            oThis._connectedPeripherals[this.uuid] = this;
        });

        peripheral.connect(function (err) {
           if(err){
               delete this._connectedPeripherals[peripheral.uuid]
           }else{
               this._connectedPeripherals[peripheral.uuid] = peripheral;
           }
        }.bind(this));
    })
};

SyskaLed.prototype.setColor = function(color,cb){

        this._connectedPeripherals.forEach(function (peripheral) {
            peripheral.discoverServices(['f371'], function(error, services) {
                var service = services[0];
                service.discoverCharacteristics(['fff1'], function(error, characteristics) {
                    var colorcharacteristic = characteristics[0];
                    this._connectedPeripherals[peripheral.uuid]['characteristics'] = colorcharacteristic;
                    colorcharacteristic.write(new Buffer(color?color:this.defaultColor), true, function(error) {
                        error ? cb.call(this,error):cb.call(this,null);
                    });

                });
            }.bind(this));


        });
};
