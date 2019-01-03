//app.js

import touch from './pages/touch/touch.js'//新加
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo: function (cb) {
    var that = this;
      wx.login({
        success: function (res) {
          console.log('登陆请求到code=' + res.code);
          that.globalData.code = res.code;
          typeof cb == "function" && cb(that.globalData.userInfo, that.globalData.code);
          // wx.getUserInfo({
          //   success: function (res) {
          //     that.globalData.userInfo = res.userInfo
          //     typeof cb == "function" && cb(that.globalData.userInfo, that.globalData.code)
          //   }
          // });
        }
      })
  },

  globalData: {
    userInfo: null,
    code: null,
    openId:null,
    sessionKey: null,
    // hostname: 'http://test.xccnet.com/carNum_test'
    hostname: 'https://www.xccnet.com/test2/carNum'
  },
  touch: new touch()//新加
})