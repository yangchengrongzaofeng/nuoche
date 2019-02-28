/**
 * 搜索设备界面
 */
var blue = require('../../utils/blue.js');
var code = require('../../utils/code.js');
var watchdog = require('../../utils/watchdog.js');
var errorLog = require('../../utils/setErrorLog.js');
var cxt_arc;

Page({
  data: {
    deviceName: "",
    deviceId: "",
    serviceId: "",
    logs: [],
    writeCharId: "",
    notefyCharId: "",
    openId: "",
    userId: "",
    userInfo: {},
    code: '',
    sessionId: '',
    failedMsg: "",
    currentState: 0,
    eventHandlerList: [],
    failed: false,
    progress: 0,
    inLoading: true,
    comeFromDriver: false,
    isPaySuccessBack: false,
    isNeedPay: true,//是否需要支付
    payCancel: false,
    deviceType: 0,//1,2,3,4代表四类 
    showChoice: false, 
    searchTime: 0,
    currentDevice: {},
    BXDeviceList: [],  //符合BX规格的设备列表
  },

  pageState: 0, //0: init, 1: onload 2: onshow, 3:onhide, 4:onUnload

  cache: {
    payData: "",
  },

  pStatus: {
    userClicked: 1,
    bleConnected: 2,
    bleReady: 4,
    payReady: 8,
    payed: 16,
    finished: 32,
    paperAvailable: 64,
  },

  setPageState: function(status) {
    console.log("*******set current page state:**********", status);
    this.pageState = status;
  },

  readyForNextStep: function (event, success, context) {
    console.log("enter readyForNextStep", event, success, context);
    var topClass = this;
    if (topClass.data.failed) {
      return;
    }
    if (!success) {
      topClass.data.failed = true;
      for (var x in topClass.pStatus) {//打印错误日记
        if(topClass.pStatus[x]==event){
          errorLog.setErrorLog(topClass.data.userInfo.nickName + ' at step ' + x + ' error 参数(' + JSON.stringify(topClass.data)+')' );
        }
      };
      topClass.handleFailed();
      if (context) {
        context.then();
      } else {
        wx.redirectTo({
          url: '../../pages/index/index',
        });
      }
    } else {
      this.showProgress();
    }
    var oldStatus = topClass.data.currentState;
    topClass.data.currentState = topClass.data.currentState | event;

    topClass.data.eventHandlerList.forEach(function (eventHandler) {//满足第一次触法条件
      if (((topClass.data.currentState & eventHandler.trigger) == eventHandler.trigger) && ((oldStatus & eventHandler.trigger) != eventHandler.trigger)) {
        setTimeout(function () { eventHandler.action(context) }, 0);
      }
    });

    watchdog.handleState(event);
  },

  unsetCurrentState: function (state) {
    this.data.currentState = this.data.currentState & (~state)
  },

  writeRecord: function(){
    var topClass = this;
    wx.request({
      url: 'https://www.xccnet.com/log/writeRedis',
      data: {
        openId: topClass.data.openId,
      },
      success: function (res) {
        if (res.statusCode == 200) {
          console.log(res.data);
        }
      },
      fail: function (res) {
      }
    })
  },

  toReduce: function () {//纸巾数量减一
    var topClass = this;
    wx.request({
      header: {
        sessionId: topClass.data.sessionId
      },
      url: 'https://www.xccnet.com/xiaozhijun/smallApp/reduceOnePack',
      data: {
        deviceId: topClass.data.deviceName,
        openId: topClass.data.openId
      },
      success: function (res) {
        console.log('纸巾数量减一成功');
        if(!topClass.data.isNeedPay){
          topClass.writeRecord();
        }
      },
      fail: function (res) {
        console.log('纸巾数量减一失败');
      },
    })
  },

  createOrder: function(){
    var topClass = this;
    wx.login({
      success: function (res) {
        console.log('登陆请求到code=' + res.code,topClass.data.deviceName);
        topClass.data.code = res.code;
        if (!!topClass.data.code) {
          //预先准备支付数据
          wx.request({
            url: 'https://www.xccnet.com/xiaozhijun/smallApp/payPrepare',
            data: {
              code: topClass.data.code,
              deviceId: topClass.data.deviceName,
            },
            success: function (res) {
              console.log("-----获取prepayid成功----------", res);
              var x_json = JSON.parse(res.data.json);
              if (x_json.result == false && (typeof x_json.result) != 'undefined') {
                topClass.readyForNextStep(topClass.pStatus.payReady, false);
                return;
              }
              topClass.cache.payData = { x_json: x_json };
              topClass.readyForNextStep(topClass.pStatus.payReady, true, topClass.cache.payData);
            },
            fail: function (res) {
              console.log("-----获取prepayid失败----------", res);
              topClass.setData({
                failedMsg: "获取prepayid失败"
              });
              topClass.readyForNextStep(topClass.pStatus.payReady, false, topClass.onNetworkFailed);
            },
          })
        } else {
          console.log('当前用户code为空！')
          topClass.readyForNextStep(topClass.pStatus.payReady, false, topClass.onNetworkFailed);
        }
      }
    });
  },

  getPayData: function(){//判断看是否免费并下单
    var topClass = this;
    wx.request({
      url: 'https://www.xccnet.com/log/readRedis',
      data: {
        openId: topClass.data.openId,
      },
      success: function (res) {
        console.log('这是记录免费的记录',res.data);
        if (res.statusCode == 200) {
          if(!res.data){
            console.log('还没有拿过纸');
            topClass.data.isNeedPay = false;
            topClass.readyForNextStep(topClass.pStatus.payReady, true, {});
          }else if(res.data.length>=3){//不满足一周三次，一天最多两次/////////////吴总-----上线后300改成3
            console.log('不满足一周三次，一天最多两次');
            topClass.createOrder();
          }else{
            var adayT = 0;
            var tt = new Date();
            tt = tt.getFullYear() + '-' + (tt.getMonth()+1) + '-' + tt.getDate();
            console.log(tt);
            for (var i = 0; i < res.data.length; i++) {
              if(res.data[i].time.indexOf(tt)!=-1){
                adayT++;
              }
            };
            if(adayT>=2){/////////////////////吴总------上线后200改成2
              console.log('今天领了两次了',adayT);
              topClass.createOrder();
            }else{
              console.log('今天只领取了一次',adayT);
              topClass.data.isNeedPay = false;
              topClass.readyForNextStep(topClass.pStatus.payReady, true, {});
            }
          }
        } else {
         topClass.createOrder();
        }
      },
      fail: function (res) {
        topClass.createOrder();
      }
    })
  },

  onNetworkFailed: function() {
    wx.showToast({
      title: '您当前的网络不可用',
      image: '../../resource/y4.png',
      duration: 1500
    });

    this.callAsyc(function () {
      wx.redirectTo({
        url: '../../pages/index/index',
      });
    }, 5000);
  },

  launchPayProcess(context) {
    var topClass = this;
    console.log('需要支付',topClass.data.isNeedPay);
    if(topClass.data.isNeedPay){
      console.log('弹出支付页面', context);
      var x_json = topClass.cache.payData.x_json;
      if (!!context) {
        x_json = context.x_json;
      }
      topClass.data.isPaySuccessBack = true;
      wx.requestPayment({
        'timeStamp': x_json.timeStamp,
        'nonceStr': x_json.nonceStr,
        'package': x_json.package,
        'signType': x_json.signType,
        'paySign': x_json.paySign,
        success: function (res) {
          console.log(res);
          // 支付成功后执行以下代码
          console.log("付完钱,一切准备完成", topClass.data.writeCharId, topClass.data.notefyCharId);
          wx.showLoading({
            title: '正在连接中...',
          })
          topClass.readyForNextStep(topClass.pStatus.payed, true);
        },
        fail: function (res) {//支付失败后，8秒钟以后断掉连接
          console.log("启动支付失败", res);
          wx.showModal({
            title: '支付失败',
            content: '请重新扫码支付'
          });
          topClass.readyForNextStep(topClass.pStatus.payed, false);
        }
      });
    }else{
      wx.showLoading({
        title: '正在连接中...',
      })
      topClass.readyForNextStep(topClass.pStatus.payed, true);
    }
  },

  jsonToFormData: function (json) {
    return Object.keys(json).reduce((prev, next) => {
      return prev.concat(next + '=' + encodeURIComponent(json[next]));
    }, []).join('&');
  },

  checkPaperNumber: function () {
    var topClass = this;
    wx.request({
      header: {
        sessionId: topClass.data.sessionId
      },
      url: 'https://www.xccnet.com/xiaozhijun/smallApp/getPaperNum',
      data: {
        deviceId: topClass.data.deviceName,
        openId: topClass.data.openId
      },
      success: function (res) {
        console.log("get the paper number", res);
        if (res.data.paperNum && res.data.paperNum >= 1) { //没纸了
          console.log("还有纸", res.data.paperNum);
          topClass.readyForNextStep(topClass.pStatus.paperAvailable, true);
        } else {
          topClass.readyForNextStep(topClass.pStatus.paperAvailable, false, {
            then: function () {
              wx.redirectTo({
                url: 'noPaperLeft',
              });
            }
          });
        }
      },
      fail: function (res) {
        topClass.readyForNextStep(topClass.pStatus.paperAvailable, false, {
          then: function () {
            wx.redirectTo({
              url: 'connectFailed',
            });
          }
        });
      },
    })
  },

  resetBluetoothAdapter: function () {
    blue.closeBlue();
  },

  discoverBluetoothDevices: function (successF) {
    blue.discoverBlue(successF);
  },

  stopBluetoothDiscovery: function () {
    blue.stopBlueDiscovery();
  },

  createBleConnection: function (retry) {
    var topClass = this;
    console.log("-----create deviceId-------serviceId---", topClass.data.deviceId + "------" + topClass.data.serviceId);
    var success_connectBlue = function () {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      var hadUse = false;
      blue.onBLEConnectionStateChange(function (res) {
        if ((!res || !res.connected) && !hadUse && topClass.data.eventHandlerList.length > 0) {
          console.log('设备意外断开',res);
          topClass.callAsyc(function () {
            hadUse = true;
            console.log('设备意外断开--处我要跳转到connectFailed了啊啊啊啊啊啊啊啊啊啊啊啊');
            wx.redirectTo({
              url: 'connectFailed',
            });
          }, 500);
        }
      })
      topClass.readyForNextStep(topClass.pStatus.bleConnected, true);
      var success_getBlueServices = function (res) {
        console.log('连接蓝牙设备时再次回去serviceId',res);
        res.services.forEach(function (devService) {
          if (devService.uuid.toLowerCase().indexOf("6e400001-b5a3-f393-e0a9-e50e24dcca9e") != -1) {
            topClass.setData({ serviceId: devService.uuid });
            console.log("createBLEConnection-----serviceId---", topClass.data.deviceId + "------" + topClass.data.serviceId);
          } else {
            console.log("drop device");
          }
        });
        if (!topClass.data.serviceId) {
          wx.showModal({
            title: '提示',
            content: '找不到正確的service'
          });
          return;
        }else{
          topClass.stopBluetoothDiscovery();//停止搜索蓝牙设备
        }
        topClass.getBLEDeviceCharacteristics();
      }
      blue.getBlueServices(topClass.data.deviceId, success_getBlueServices);
    }
    var fail_connectBlue = function () {
      topClass.setData({
        failedMsg: "failed to createBleConnection--" + retry
      });
      if (!retry) {
        retry = 0;
      }
      if (retry > 20) {
        console.log("retry createBleConnection timeout:", retry);
        topClass.readyForNextStep(topClass.pStatus.bleConnected, false);
      } else {
        setTimeout(function () {
          if (!topClass.data.serviceId) {
            topClass.createBleConnection(retry + 1);
          } else {
            topClass.createBleConnection(retry + 1);
          }
        }, 20);
      }
    }
    blue.connectBlue(topClass.data.deviceId, success_connectBlue, fail_connectBlue);
  },

  getBLEDeviceCharacteristics: function () {
    var topClass = this;
    if (!topClass.data.serviceId) {
      wx.showModal({
        title: '提示',
        content: '没有正確的serviceid'
      });
      return;
    }
    console.log("get device chracteristics, ", topClass.data.deviceId, topClass.data.serviceId);
    var success_getBlueDeviceCharacteristics = function (res) {
      if (res.characteristics.length == 0) {
        setTimeout(topClass.getBLEDeviceCharacteristics, 10);
        return;
      }
      res.characteristics.forEach(function (characteristic) {
        if (characteristic.properties.write == true) {
          topClass.data.writeCharId = characteristic.uuid;
        } else if (characteristic.properties.notify == true) {
          topClass.data.notefyCharId = characteristic.uuid;
        }
      });
      console.log('建立蓝牙串口连接' + topClass.data.writeCharId + '******' + topClass.data.notefyCharId);
      topClass.prepareBle();
    }
    var fail_getBlueDeviceCharacteristics = function () {
      topClass.setData({
        failedMsg: "failed to getBLEDeviceCharacteristics"
      });
      topClass.readyForNextStep(topClass.pStatus.bleReady, false);
    }
    blue.getBlueDeviceCharacteristics(topClass.data.deviceId, topClass.data.serviceId, success_getBlueDeviceCharacteristics, fail_getBlueDeviceCharacteristics);
  },

  prepareBle: function () {
    var topClass = this;
    var success_notifyBlueCVC = function () {
      blue.onBlueECharacteristicValueChange(function (res) {
        topClass.readyForNextStep(topClass.pStatus.finished, true);
      });
      setTimeout(function () {
        topClass.readyForNextStep(topClass.pStatus.bleReady, true);
      }, 800);
    }
    var fail_notifyBlueCVC = function () {
      topClass.readyForNextStep(topClass.pStatus.bleReady, false);
    }
    blue.notifyBlueCharacteristicValueChanged(topClass.data.deviceId, topClass.data.serviceId, topClass.data.notefyCharId, success_notifyBlueCVC, fail_notifyBlueCVC);
  },

  writeValueToBlueTooth: function (retry) {
    console.log('enter writeValueToBlueTooth-----------------------------');
    var topClass = this;
    var buffer1 = code.getOldCmd();
    var success_writeValue = function () {
      /*var callback_onBlueCVC = function(){//??
        topClass.readyForNextStep(topClass.pStatus.finished, true);//??
      }//??
      blue.onBlueECharacteristicValueChange(callback_onBlueCVC);//??*/
    }
    var fail_writeValue = function () {
      if (!retry) {
        retry = 0;
      }
      if (retry > 2000) {
        console.log("retry timeout:", retry);
        topClass.readyForNextStep(topClass.pStatus.finished, false);
      } else {
        setTimeout(function () {
          topClass.writeValueToBlueTooth(retry + 1);
        }, 20);
      }
    }
    blue.writeBlueCharacteristicValue(topClass.data.deviceId, topClass.data.serviceId, topClass.data.writeCharId, buffer1, success_writeValue, fail_writeValue);
  },

  setEventHandlers: function () {
    var topClass = this;
    topClass.data.eventHandlerList.push({
      trigger: topClass.pStatus.userClicked,
      action: topClass.checkPaperNumber,
    });

    topClass.data.eventHandlerList.push({
      trigger: topClass.pStatus.paperAvailable,
      action: topClass.getPayData,
    });

    topClass.data.eventHandlerList.push({
      trigger: topClass.pStatus.paperAvailable,
      action: topClass.createBleConnection,
    });

    topClass.data.eventHandlerList.push({
      trigger: topClass.pStatus.finished,
      action: topClass.handleSuccess,
    });

    topClass.data.eventHandlerList.push({
      trigger: topClass.pStatus.bleReady | topClass.pStatus.payed,
      action: topClass.writeValueToBlueTooth,
    });

    topClass.data.eventHandlerList.push({
      trigger: topClass.pStatus.payReady | topClass.pStatus.bleReady | topClass.pStatus.userClicked,
      action: topClass.launchPayProcess
    });
  },

  handleCleanup: function () {
    var topClass = this;
    topClass.stopBluetoothDiscovery();
    if ((topClass.data.currentState & topClass.pStatus.bleConnected) == topClass.pStatus.bleConnected) {
      console.log("free resource");
      topClass.closeBleConnection();
    }
    topClass.data.currentState = 0;
    topClass.data.isPaySuccessBack = false;
    topClass.data.payCancel = false;
    topClass.data.BXDeviceList = [];
    topClass.setData({
      eventHandlerList: []
    });
  },

  closeBleConnection: function () {
    var topClass = this;
    console.log("close connection:", topClass.data.deviceId);
    blue.closeBlueConnection(topClass.data.deviceId);
  },

  showProgress: function () {
    var newProgress = this.data.progress + 20;
    if (newProgress > 100) {
      newProgress = 100;
    }
    this.setData({
      progress: newProgress
    });
    var deg = newProgress/100*2*Math.PI - Math.PI * 1/2;//-Math.PI * 1/2至Math.PI*3/2
    this.setProgress(deg);
    console.log("current progress", this.data.progress);
  },

  handleSuccess: function () {
    var topClass = this;
    wx.hideLoading();
    topClass.toReduce();
    setTimeout(this.handleCleanup, 0);
    wx.redirectTo({
      url: 'success?type=' + topClass.data.deviceType,
    });
  },

  handleFailed: function() {
    wx.hideLoading();
    if (!!this.data.failedMsg) {
      wx.showToast({
        title: '连接失败(' + this.data.failedMsg + ')，请重试',
        image: '../../resource/y4.png',
        duration: 3000
      });
    }
    this.handleCleanup();
  },

  handleFoundDevice: function (device) {
    if (!!this.data.serviceId) {
      return;//找到了以后就不在处理其他的device
    }
    if (!device) {
      console.log("device is empty");
      return;
    }
    var topClass = this;
    console.log('handleFoundDevice-----------------------',device);
    device.name = device.name.substring(0,20);
    console.log("found a new device", device);
    if(!!device.advertisServiceUUIDs){
      device.advertisServiceUUIDs.forEach(function (serviceId) {
        if (serviceId.toLowerCase().indexOf("6e400001-b5a3-f393-e0a9-e50e24dcca9e") != -1) {
          topClass.setData({
            serviceId: serviceId
          });
        } else {
          console.log("drop service");
        }
      });
    }else{
      console.log("can not read advertisServiceUUIDs", device);
    }
    topClass.setData({
      deviceName: device.name,
      deviceId: device.deviceId,
      showChoice: false
    });
    topClass.readyForNextStep(topClass.pStatus.userClicked, true);
    
  },

  choiceDevice: function (e) {
    var that = this;
    var index = parseInt(e.currentTarget.dataset.hi);
    for (var i = 0; i < that.data.BXDeviceList.length; i++) {
      if(!!that.data.BXDeviceList[i].checked){
        that.data.BXDeviceList[i].checked = false;
        break;
      }
    };
    that.data.BXDeviceList[index-1].checked = true;
    that.setData({
      deviceType: that.data.BXDeviceList[index-1].value,
      BXDeviceList: that.data.BXDeviceList
    });
    that.data.currentDevice = that.data.BXDeviceList[index-1].device;
    console.log(this.data.currentDevice);
  },

  sureChoiceD: function(){
    var that = this;
    that.handleFoundDevice(that.data.currentDevice);
  },

  isInBXDeviceList: function(device){
    var topClass = this,result = false;
    for (var i = 0; i < topClass.data.BXDeviceList.length; i++) {
      if(topClass.data.BXDeviceList[i].device.deviceId==device.deviceId){
        result = true;
        break;
      }
    };
    return result;
  },

  setDeviceType: function(deviceName){
    if(!!deviceName){
      var obj = {};
      deviceName = deviceName.substring(0,20);
      var currentType = deviceName[deviceName.length - 1];
      currentType = parseInt(currentType, 16);
      if (currentType < 4) {//0-3,4-7,8-11,12-15共四类
        obj.value = 1;
        obj.color = '桔色';
      } else if(currentType < 8){
        obj.value = 2;
        obj.color = '蓝色';
      } else if(currentType < 12){
        obj.value = 3;
        obj.color = '绿色';
      } else{
        obj.value = 4;
        obj.color = '青色';
      }
      return obj;
    }
  },

  startBlue: function () {
    var that = this;
    that.resetBluetoothAdapter();
    var success_openBlue = function () {
      var success_getBlueState = function (res) {
        console.log('蓝牙可用', res.available);
        if (res.available) {
          that.callAsyc(function () {//设置一个timer，60秒后跳转到找不到设备提示           
            if (that.pStatus.bleConnected & that.data.currentState) {
              console.log("device has found, cancel the timer");
            } else if(that.data.eventHandlerList.length>0){
              console.log("找不到相应的设备,显示错误页面");
              that.readyForNextStep(that.pStatus.bleConnected, false, {
                then: function () {
                  wx.redirectTo({
                    url: 'connectFailed',
                  });
                }
              });
            }else{//数据已经被清除掉了
              that.readyForNextStep(that.pStatus.bleConnected, false);
            }
          }, 60000);
          if (res.available && !res.discovering) {
            that.discoverBluetoothDevices(function () { });
          }
        }
        blue.onBlueStateChange(function (res) {
          if (!res.available) {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '蓝牙设备被关闭，请打开后重试'
            })
            wx.redirectTo({
              url: 'blena',
            });
          }
        });
      }
      var fail_getBlueState = function () { };
      blue.getBlueState(success_getBlueState, fail_getBlueState);
      var searchDeviceHandlerId = setInterval(function (res) {
        that.data.searchTime++;
        if (that.data.serviceId || that.pageState == 4) {
          clearInterval(searchDeviceHandlerId);
          return;
        }
        console.log('开始获取设备列表');
        blue.getBlueDevices(
          function (res) {
            res.devices.forEach(function (device) {
              if(device.name.indexOf('BX:') != -1 && !that.isInBXDeviceList(device) && device.RSSI>-80){
                var obj = that.setDeviceType(device.name);
                var temp = {device: device, value: obj.value,color: obj.color};
                that.data.BXDeviceList.push(temp);
                console.log(temp);
                if(that.data.BXDeviceList.length==1){
                  that.data.BXDeviceList[0].checked = true;
                  that.data.currentDevice = device;
                }
              }
            });
            if(that.data.BXDeviceList.length>0 && that.data.searchTime%3==0){
              console.log('合适设备列表',that.data.BXDeviceList);
              that.data.deviceType = that.data.BXDeviceList[0].value;
              if(that.data.BXDeviceList.length==1){//不用选择
                that.handleFoundDevice(that.data.currentDevice);
              }else{//要选择
                that.setData({
                  showChoice: true,
                  BXDeviceList: that.data.BXDeviceList
                })
              }
            }
          }
        );
      }, 1500);
    }
    var fail_openBlue = function () {
      wx.redirectTo({
        url: 'blena',
      });
    }
    blue.openBlue(success_openBlue, fail_openBlue);
  },

  callAsyc: function (fn, second) {
    var topClass = this;
    setTimeout(function () {
      console.log(fn.name, second);
      console.log("current page status:", topClass.pageState);
      if (!(topClass.pageState == 1 || topClass.pageState == 2 || topClass.pageState == 3)) {
        console.log("page is unloaded, exist directly");
      } else {
        fn();
      }
    }, second);
  },

  onLoad: function (opt) {
    console.log('onLoad-scanble');
    var that = this;
    // that.setData({
    //   showChoice: true
    // })
    // return;
    //监听网络状态
    wx.onNetworkStatusChange(function (res) {
      console.log(res.isConnected);
      console.log(res.networkType);
      if (!res.isConnected || res.networkType == 'none') {
        wx.showToast({
          title: '您当前的网络不可用',
          image: '../../resource/y4.png',
          duration: 1500
        });
      }
    })
    that.setEventHandlers();
    var app = getApp();
    //调用应用实例的方法获取当前用户信息
    app.getUserInfo(function (userInfo, sessionId, openId, userId) {
      that.setData({
        userInfo: userInfo,
        sessionId: sessionId,
        openId: openId,
        userId: userId,
      })
      //异步调用
      that.startBlue();
    });
    that.setPageState(1); //onload
    watchdog.init(that);
  },

  onShow: function () {
    this.setPageState(2)
  },

  onHide: function () {
    this.setPageState(3);
    console.log('onHide~~~~~~~~~~~~~~~~~~~~~~~~~~~~~onHide');
    var topClass = this;
    console.log(topClass.data.isPaySuccessBack);
    if (!topClass.data.isPaySuccessBack) {
      this.handleCleanup();
    }
  },

  setProgress: function(deg){//-Math.PI * 1/2至Math.PI*3/2
    cxt_arc.setLineWidth(2); 
    cxt_arc.setStrokeStyle('#85d5d3'); 
    cxt_arc.setLineCap('round') 
    cxt_arc.beginPath();//开始一个新的路径 
    cxt_arc.arc(70, 70, 65, 0, 2*Math.PI, false);//设置一个原点(106,106)，半径为100的圆的路径到当前路径 
    cxt_arc.stroke();//对当前路径进行描边 

    cxt_arc.setLineWidth(3); 
    cxt_arc.setStrokeStyle('#ffffff'); 
    cxt_arc.setLineCap('round') 
    cxt_arc.beginPath();//开始一个新的路径 
    cxt_arc.arc(70, 70, 65, -Math.PI * 1 / 2, deg, false); 
    cxt_arc.stroke();//对当前路径进行描边 
    cxt_arc.draw(); 
  },
  onReady: function(){
    // 页面渲染完成 
    var that = this;
    cxt_arc = wx.createCanvasContext('canvasArc');//创建并返回绘图上下文context对象。 
    that.setProgress(-Math.PI * 1 / 2);
  },

  onUnload: function () {
    console.log('onUnload-handleCleanup');
    this.setPageState(4)
    this.handleCleanup();
  },
})
