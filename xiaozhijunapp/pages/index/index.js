//index.js
//获取应用实例
var app = getApp()
var temp;
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    code: '',
    sessionKey: '',
    deviceName: "",
    openid: '',
    phoneNumber: '400-683-1169'
  },
  phoneCall: function () {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.phoneNumber,
    });
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  //事件处理函数
  bindViewTap1: function () {
    wx.scanCode({
    });
    // var url = '../scanble/scanble?d=BX:D3:D7:FF:95:79:4D';
    // //var url = '../scanble/success';
    // console.log('跳转路径=' + url);
    // wx.navigateTo({
    //   url: url
    // })
  },

  launchScanCode:function(){
    wx.scanCode();
  },

  onLoad: function (opt) {
    console.log('onLoad', opt)
  },
})
