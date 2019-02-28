function closeBlue(){
  wx.closeBluetoothAdapter({
    success: function (res) {
      console.log("-----success closeBluetoothAdapter----------");
    },
    fail: function (res) {
      console.log("-----failed closeBluetoothAdapter----------");
    },
    complete: function (res) {
    }
  });
}
function openBlue(successF,failF){
  wx.openBluetoothAdapter({
    success: function (res) {
      console.log("-----success openBluetoothAdapter----------",res);
      successF();
    },
    fail: function (res) {
      console.log("-----fail openBluetoothAdapter----------", res);
      failF();
    },
    complete: function (res) {
      console.log("-----complete openBluetoothAdapter----------",res);
    }
  })
}
function getBlueState(successF,failF){
  wx.getBluetoothAdapterState({
      success: function (res) {
        console.log("获取蓝牙设备状态", res);
        successF(res);
      },
      fail: function (res) {
        failF();
      },
      complete: function (res) {
      }
    })
}
function onBlueFound(callback){
  wx.onBluetoothDeviceFound(function (devices) {
    callback(devices);
  });
}
function getBlueDevices(successF){
  wx.getBluetoothDevices({
    success: function (res) {
      console.log("获取到已有的设备列表", res);
      successF(res);
    }
  });
}
function onBlueStateChange(callback){
  wx.onBluetoothAdapterStateChange(function (res) {
    console.log("监听蓝牙设备状态变化", res);
    callback(res);
  });
}
function discoverBlue(successF){
  console.log("start discovery devices");
  wx.startBluetoothDevicesDiscovery({
    // services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'],
    allowDuplicatesKey: true,
    // interval: 3000,
    success: function (res) {
      console.log("-----sucess Discovery---------", res);
      successF();
    },
    fail: function (res) {
      console.log("-----failed discovery----------", res);
    },
    complete: function (res) {
      console.log("-----complete discovery----------", res);
    }
  });
}
function stopBlueDiscovery(){
  wx.stopBluetoothDevicesDiscovery({
    success: function (res) {
      console.log('停止搜索蓝牙设备',res);
    }
  })
}
function connectBlue(deviceId,successF,failF){
  console.log("-----create connectBlue-------");
  wx.createBLEConnection({
    deviceId: deviceId,
    success: function (res) {        
      console.log("success create a connection to device", deviceId, res);
      successF();
    },
    fail: function (res) {
      console.log("failed to connect to device:", res);
      failF();
    },
    complete: function (res) {
    }
  });
}
function closeBlueConnection(deviceId) {
  wx.closeBLEConnection({
    deviceId: deviceId,
    success: function (res) {
      console.log("close connection:", res);
    },
    fail: function (res) {
      console.log("failed to close connection:", res);
    },
  })
}
function getBlueServices(deviceId,successF){
  wx.getBLEDeviceServices({
    deviceId: deviceId,
    success: function (res) {
      console.log("success to get ble services", deviceId, res);
      successF(res);
    },
    fail: function (res) {
      
    },
    complete: function (res) {
    }
  })
}
function getBlueDeviceCharacteristics(deviceId, serviceId,successF,failF){
  wx.getBLEDeviceCharacteristics({
    deviceId: deviceId,
    serviceId: serviceId,
    success: function (res) {
      console.log('success getBLEDeviceCharacteristics:', res.characteristics);
      successF(res);
    },
    fail: function (res) {
      console.log('failed to getBLEDeviceCharacteristics,', res);
      failF();
    },
    complete: function (res) {
    }
  });
}
function notifyBlueCharacteristicValueChanged(deviceId, serviceId, notefyCharId,successF,failF){
  wx.notifyBLECharacteristicValueChanged({
    deviceId: deviceId,
    serviceId: serviceId,
    characteristicId: notefyCharId,
    state: true,
    success: function (res) {
      console.log("success set notification", res, notefyCharId);
      successF();
    },
    fail: function (res) {
      console.log("failed get notification", res);
      failF();
    },
    complete: function (res) {
    }
  });
}
function onBlueECharacteristicValueChange(callback){
  wx.onBLECharacteristicValueChange(function (res) {
    console.log("get notification", res);
    callback(res);
  });
}
function writeBlueCharacteristicValue(deviceId, serviceId, writeCharId, buffer1,successF,failF){
  console.log('deviceId='+deviceId+'---serviceId='+serviceId+'---writeCharId='+writeCharId+'---buffer1='+buffer1);
  wx.writeBLECharacteristicValue({
    deviceId: deviceId,
    serviceId: serviceId,
    characteristicId: writeCharId,
    value: buffer1,
    success: function (res) {
      console.log("success 发送成功", res);
      successF();
    },
    fail: function (res) {
      console.log("failed write data", res);
      failF();
    },
    complete: function (res) {
    }
  });
}
function onBLEConnectionStateChange(callback) {
  wx.onBLEConnectionStateChange(function(res) {
    callback(res);
  })
}
module.exports.closeBlue = closeBlue;
module.exports.openBlue = openBlue;
module.exports.getBlueState = getBlueState;
module.exports.onBlueFound = onBlueFound;
module.exports.getBlueDevices = getBlueDevices;
module.exports.onBlueStateChange = onBlueStateChange;
module.exports.discoverBlue = discoverBlue;
module.exports.stopBlueDiscovery = stopBlueDiscovery;
module.exports.connectBlue = connectBlue;
module.exports.closeBlueConnection = closeBlueConnection;
module.exports.getBlueServices = getBlueServices;
module.exports.getBlueDeviceCharacteristics = getBlueDeviceCharacteristics;
module.exports.notifyBlueCharacteristicValueChanged = notifyBlueCharacteristicValueChanged;
module.exports.onBlueECharacteristicValueChange = onBlueECharacteristicValueChange;
module.exports.writeBlueCharacteristicValue = writeBlueCharacteristicValue;
module.exports.onBLEConnectionStateChange = onBLEConnectionStateChange;
