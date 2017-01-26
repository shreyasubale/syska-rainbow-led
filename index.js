var noble = require('noble');
var poweredOn = false;
var serviceUUids = ['f371'];
// noble.startScanning([],true)
// setTimeout(function() {
// 	if(poweredOn === true){
// 		// noble.stopScanning();
// 	}

// },50000)
// var color = [0x01,0xf0,0x00,0x06,0x00,0x0a,0x03,0x00,0x01,0x01,0x00,0xRR,0xGG,0xBB,0x00,0xBR,0x00,0x00];

var color = [0x01,0xf0,0x00,0x06,0x00,0x0a,0x03,0x00,0x01,0x01,0x00,0x00,0x00,0x00,0x00,0xFF,0x00,0x00];

noble.on('stateChange', function(state) {
	console.log(state);
	if(state ==='poweredOn'){
		noble.startScanning(serviceUUids,false);
	}
	// console.log(state);
});



noble.on('discover', function(peripheral) {
    console.log('Found device with local name: ' + peripheral.advertisement.localName);
    console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
    console.log();
    noble.stopScanning();
    console.log("connecting");
    peripheral.connect(function(err){
    	 console.log('connected to peripheral: ' + peripheral.uuid);
    	 peripheral.discoverServices(['f371'], function(error, services) {
    	 	var service = services[0];
    	 	service.discoverCharacteristics(['fff1'], function(error, characteristics) {
    	 		var colorcharacteristic = characteristics[0]
		        colorcharacteristic.write(new Buffer(color), true, function(error) {
		          console.log('set alert level to mid (1)');
		        });

		    });

    	 });
    })


});
