//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  setErrorLog: function(params){
    wx.request({
      url: 'https://www.xccnet.com/log/write?content='+params,
      success: function (res) {
        console.log(res);
        if (res.statusCode == 200) {
          console.log(res.data);
        }
      }
    })
  },
  getSessionKey: function(code, cb, errorTime){
    var that = this;
    wx.request({
      url: 'https://www.xccnet.com/xiaozhijun/smallApp/refreshSessionKey?appId=******&code=' + code,
      success: function (res) {
        console.log(res);
        if (res.statusCode == 200) {
          console.log("-----获取sessionId=", res.data.sessionId);
          that.globalData.sessionId = res.data.sessionId;
          that.globalData.openId = res.data.openId;
          that.globalData.userId = res.data.userId;
          typeof cb == "function" && cb(that.globalData.userInfo, that.globalData.sessionId, that.globalData.openId, that.globalData.userId);
        } else {
          if (!errorTime){
            errorTime = 1;
          }else{
            errorTime++;
          }
          if (errorTime<5){
            console.log('refreshSessionKey------Time=' + errorTime);
            that.getSessionKey(code, cb, errorTime);
          }else{//超出5次了
            that.setErrorLog(that.globalData.userInfo.nickName + ' at refreshSessionKey error 参数({code:' + code+'})');
          }
        }
      },
      fail: function (res) {
        console.log("-----获取sessionId失败----------");
      }
    })
  },
  getUserInfo: function (cb) {
    var that = this;
      wx.login({
        success: function (res) {
          var code = res.code;
          console.log('登陆请求到code=' + code);
          wx.getUserInfo({
            success: function (res) {
              console.log(res.userInfo);
              that.globalData.userInfo = res.userInfo;
              that.getSessionKey(code,cb);
            }
          })
        }
      })
  },

  globalData: {
    userInfo: null,
    code: null,
    sessionId: null,
    openId: null,
    userId: null,
  }
})