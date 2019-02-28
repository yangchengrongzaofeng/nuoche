// deviceInfo.js
Page({
  data: {
    array: [ '使用中','已作废'],
    index: 0,
    userId: '',
    sessionId: '',
    requesting: false,
    deviceData: {
      deviceName: '',
      remain: 0,
      status: 3,
      comments: ''
    }
  },
  cancleEdit: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  saveEdit: function (e) {
    console.log(e.detail);
    console.log(this.data.deviceData);
    var topClass = this;
    if (topClass.data.requesting) return;
    wx.showLoading({
      title: '保存中',
    });
    topClass.data.requesting = true;
    wx.request({
      url: 'https://www.xccnet.com/xiaozhijun/agent/device',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        sessionId: topClass.data.sessionId
      },
      data: {
        id: topClass.data.deviceData.id,
        userId: topClass.data.userId,
        deviceName: e.detail.value.deviceName,
        deviceId: topClass.data.deviceData.deviceAddr,
        remain: e.detail.value.remain,
        comments: e.detail.value.comments,
        status: topClass.data.deviceData.status,
        formId: e.detail.formId
      },
      method: 'POST',
      success: function (res) {
        if (res.statusCode != 200) {
          wx.hideLoading();
          topClass.data.requesting = false;
          return;
        }
        wx.hideLoading();
        topClass.data.requesting = false;
        wx.reLaunch({
          url: 'deviceList?userId=' + topClass.data.userId+'&sessionId='+encodeURIComponent(topClass.data.sessionId)
        });
      },
      fail: function (res) { },
    })
  },
  bindPickerChange: function (e) {
    var num = parseInt(e.detail.value);
    this.data.deviceData.status = (num+3);
    this.setData({
      index: num
    })
  },
  onLoad: function (opt) {
    var that = this;
    that.setData({
      userId: opt.userId,
      sessionId: decodeURIComponent(opt.sessionId)
    })
    var app = getApp();
    var device = app.globalData.currentDevice;
    console.log(device);
    if (!!device) {
      that.setData({
        deviceData: device,
        index: (device.status-3)
      });
    }

    console.log(this.data.deviceData)
  },
  onReady: function(){
    //此处是为了解决真机textarea默认复制失败的坑
    if (!!this.data.deviceData) {
      this.setData({
        deviceData: this.data.deviceData
      });
    }
  }
})