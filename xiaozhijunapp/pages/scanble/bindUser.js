//bindUser.js
Page({
  data: {
    openId: null,
    sessionId: null,
    loading: false,
    disabled: false,
    userName: '',
    userPhone: ''
  },
  onPullDownRefresh: function () {
    console.log('stopPullDownRefresh');
    wx.stopPullDownRefresh();
  },
  bindKeyInput: function (e) {
    if (e.currentTarget.id == 'userName') {
      this.setData({
        userName: e.detail.value
      })
    } else if (e.currentTarget.id == 'userPhone') {
      this.setData({
        userPhone: e.detail.value
      })
    }
  },
  toBindUser: function () {
    var topClass = this;
    if (!topClass.data.userName) {
      wx.showToast({
        title: '请输入姓名',
        image: '../../resource/y4.png',
        duration: 1000
      });
      return;
    }
    if (!topClass.data.userPhone) {
      wx.showToast({
        title: '请输入手机号',
        image: '../../resource/y4.png',
        duration: 1000
      });
      return;
    }
    topClass.setData({
      loading: true,
      disabled: true
    });
    wx.request({
      url: 'https://www.xccnet.com/xiaozhijun/agent/register',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        sessionId: topClass.data.sessionId
      },
      data: {
        openId: topClass.data.openId,
        phone: topClass.data.userPhone,
        userName: topClass.data.userName
      },
      method: 'POST',
      success: function (res) {
        topClass.setData({
          loading: false,
          disabled: false
        });
        if (res.statusCode != 200) return;
        wx.redirectTo({
          url: 'deviceList'
        });
      }
    })
  },
  onLoad: function (opt) {
    var that = this;
    if(!!opt){
      that.setData({
        sessionId: decodeURIComponent(opt.sessionId),
        openId: opt.openId,
      })
    }
    wx.login({
      success: function (res) {
        that.setData({
          code: res.code
        })
      }
    })
  },
  onUnload: function () {
    wx.setTopBarText({
      text: 'onUnload'
    })
  }
})