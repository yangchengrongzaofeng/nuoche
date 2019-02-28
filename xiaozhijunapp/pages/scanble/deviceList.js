// deviceList.js
var blue = require('../../utils/blue.js')
Page({
  data: {
    deviceList: [],
    deviceListAll: [],
    userData: {},
    searchText: '',
    userId: null,
    openId: null,
    sessionId: null,
    requesting: false,
    loadFinish: false,
    tofindDevice: false,
    tobindDevice: false,
    currentDevice: {},
    BXDeviceList: [],  //符合BX规格的设备列表
  },
  pageState: 0, //0: init, 1: onload 2: onshow, 3:onhide, 4:onUnload
  getDeviceList: function () {
    var topClass = this;
    if (topClass.data.requesting || topClass.data.userId==-1) return;
    topClass.data.requesting = true;
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      header: {
        sessionId: topClass.data.sessionId
      },
      url: 'https://www.xccnet.com/xiaozhijun/agent/deviceList',
      data: {
        userId: topClass.data.userId
      },
      method: 'GET',
      success: function (res) {
        topClass.setData({
          loadFinish: true
        });
        if (res.statusCode != 200) {
          wx.hideLoading();
          topClass.data.requesting = false;
          return;
        }
        topClass.setData({
          deviceList: res.data.devices || [],
          deviceListAll: res.data.devices || [],
          userData: res.data.user
        });
        wx.hideLoading();
        topClass.data.requesting = false;
      },
      fail: function (res) { },
    })
  },
  editDevice: function (event) {
    var topClass = this;
    var index = event.currentTarget.dataset.hi;
    var app = getApp();
    app.globalData.currentDevice = topClass.data.deviceList[index];
    console.log('app.globalData.currentDevice', app.globalData.currentDevice);
    wx.navigateTo({
      url: 'deviceInfo?userId=' + topClass.data.userId+'&sessionId='+encodeURIComponent(topClass.data.sessionId)
    });
  },
  bindInput: function(e){
    this.setData({
      searchText: e.detail.value
    })
  },
  searchByName: function(){
    var topClass = this;
    topClass.data.deviceList = [];
    for (var i = 0; i < topClass.data.deviceListAll.length; i++) {
      if(topClass.data.deviceListAll[i].deviceName.indexOf(topClass.data.searchText)!=-1){
        topClass.data.deviceList.push(topClass.data.deviceListAll[i]);
      }
    };
    topClass.setData({
      deviceList: topClass.data.deviceList
    });
  },
  onReachBottom: function () {
    console.log('滚动到底部了');
    //this.getDeviceList();
  },
  toSetInfo: function(deviceAddr){
    console.log('toSetInfo');
    var topClass = this;
    var app = getApp();
    wx.request({
      header: {
        sessionId: topClass.data.sessionId
      },
      url: 'https://www.xccnet.com/xiaozhijun/agent/deviceList',
      data: {
        userId: topClass.data.userId
      },
      method: 'GET',
      success: function (res) {
        if (res.statusCode == 200) {
          for (var i = 0; i < res.data.devices.length; i++) {
            if(res.data.devices[i].deviceAddr==deviceAddr){
              res.data.devices[i].deviceName = deviceAddr;
              app.globalData.currentDevice = res.data.devices[i];
              console.log('app.globalData.currentDevice', app.globalData.currentDevice);
              wx.redirectTo({
                url: 'deviceInfo?userId=' + topClass.data.userId+'&sessionId='+encodeURIComponent(topClass.data.sessionId)
              });
              break;
            }
          };
        }
      },
      fail: function (res) { },
    })
  },
  setDeviceOnline: function(deviceName){
    console.log('setDeviceOnline');
    var topClass = this;
    wx.request({
      url: 'https://www.xccnet.com/xiaozhijun/agent/setDeviceOnline',
      data: {
        userId: topClass.data.userId,
        deviceId: deviceName,
      },
      header: {
        'sessionId': topClass.data.sessionId,
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function (res) {
        if(res.statusCode!=200)return;
        /*topClass.setData({
          tofindDevice: false
        });
        topClass.getDeviceList();*/
        topClass.toSetInfo(deviceName);
      },
      fail: function (res) {}
    })
  },
  addDevice: function(event){
    var topClass = this;
    if(!!topClass.data.tobindDevice)return;
    var index = event.currentTarget.dataset.hi;
    topClass.data.currentDevice = topClass.data.BXDeviceList[index];
    topClass.data.tobindDevice = true;
    console.log('addDevice',topClass.data.openId,topClass.data.sessionId,topClass.data.currentDevice.name);
    wx.request({
      url: 'https://www.xccnet.com/xiaozhijun/smallApp/newMachine',
      data: {
        openId: topClass.data.openId,
        deviceId: topClass.data.currentDevice.name
      },
      header: {
        'sessionId': topClass.data.sessionId,
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function (res) {
        console.log(res);
        topClass.data.tobindDevice = false;
        if (res.statusCode != 200) {
          topClass.setData({
            tofindDevice: false
          });
          topClass.getDeviceList();
          return;
        }
        console.log('创建设备成功');
        topClass.data.userId = res.data.device.userId;
        topClass.setDeviceOnline(topClass.data.currentDevice.name);
      },
      fail: function(){
        topClass.data.tobindDevice = false;
      }
    })
  },

  isInBXDeviceList: function(device){
    var topClass = this,result = false;
    var list = topClass.data.deviceListAll.concat(topClass.data.BXDeviceList);
    for (var i = 0; i < list.length; i++) {
      if(list[i].deviceAddr==device.name){
        result = true;
        break;
      }
    };
    return result;
  },

  setDeviceType: function(deviceName){
    if(!!deviceName){
      var color,topClass = this;
      deviceName = deviceName.substring(0,20);
      var currentType = deviceName[deviceName.length - 1];
      currentType = parseInt(currentType, 16);
      if (currentType < 4) {//0-3,4-7,8-11,12-15共四类
        topClass.data.deviceType = 1;
        color = '红色';
      } else if(currentType < 8){
        topClass.data.deviceType = 2;
        color = '黄色';
      } else if(currentType < 12){
        topClass.data.deviceType = 3;
        color = '蓝色'+currentType;
      } else{
        topClass.data.deviceType = 4;
        color = '绿色';
      }
      return color;
    }
  },
  startBlue: function () {
    var that = this;
    that.setData({
      tofindDevice: true,
      BXDeviceList: []
    })
    blue.closeBlue();
    var success_openBlue = function () {
      var success_getBlueState = function (res) {
        console.log('蓝牙可用', res.available);
        if (res.available) {
          if (res.available && !res.discovering) {
            blue.discoverBlue(function () { });
          }
        }
        blue.onBlueStateChange(function (res) {
          if (!res.available) {
            wx.showModal({
              title: '提示',
              showCancel: false,
              content: '蓝牙设备被关闭，请打开后重试'
            })
          }
        });
      }
      var fail_getBlueState = function () { };
      blue.getBlueState(success_getBlueState, fail_getBlueState);
      var searchDeviceHandlerId = setInterval(function (res) {
        if (!that.data.tofindDevice || that.pageState == 4) {
          clearInterval(searchDeviceHandlerId);
          return;
        }
        blue.getBlueDevices(
          function (res) {
            res.devices.forEach(function (device) {
              if(device.name.indexOf('BX:') != -1 && !that.isInBXDeviceList(device)){
                device.color = that.setDeviceType(device.name);
                device.deviceAddr = device.name;
                that.data.BXDeviceList.push(device);
              }
            });
            that.setData({
              BXDeviceList: that.data.BXDeviceList
            })
          }
        );
      }, 5000);
    }
    var fail_openBlue = function () {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '蓝牙设备被关闭，请打开后重试'
      })
    }
    blue.openBlue(success_openBlue, fail_openBlue);
  },
  stopBlue: function(){
    this.setData({
      tofindDevice: false
    })
    blue.stopBlueDiscovery();
  },
  onLoad: function (opt) {
    var that = this;
    that.pageState = 1;
    if(!!opt && !!opt.userId && !!opt.sessionId){
      that.setData({
        userId: opt.userId,
        sessionId: decodeURIComponent(opt.sessionId),
      });
      that.getDeviceList();
    }else{
      var app = getApp();
      //调用应用实例的方法获取当前用户信息
      app.getUserInfo(function (userInfo, sessionId, openId, userId) {
        //更新数据
        that.setData({
          sessionId: sessionId,
          openId: openId,
          userId: userId,
        })
        //异步调用
        if(!that.data.userId || that.data.userId == -1){
          wx.redirectTo({
            url: 'bindUser?sessionId=' + encodeURIComponent(that.data.sessionId) + '&openId='+that.data.openId
          });
        }else{
          that.getDeviceList();
        }
      });
    }
  },
  onUnload: function () {
    this.pageState = 4;
    blue.stopBlueDiscovery();
  },
})