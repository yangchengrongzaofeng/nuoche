//获取应用实例
var app = getApp();
Page({
  data: {
    qrcodeId: '',
    isShowBtn: false,
    contentbtn: '双方都将显示临时虚拟号码，保护隐私！',
    carNum: '',//显示用
    carNumber: '',//输入框用
    phoneNumber: '',
    disabled_getVir:false
  },
  phoneCall: function(){
    var that = this;
    if (that.data.disabled_getVir) {
      return;
    }
    wx.showLoading({
      mask: true
    });
    that.setData({
      disabled_getVir: true
    });
    that.getVirtualNum(that.data.qrcodeId);
  },
  getVirtualNum(qrcodeId){
    var that = this;
    wx.request({
      url: app.globalData.hostname + '/getvirtualNumByQrcodeId',
      data: {
        qrcodeId: qrcodeId
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        wx.hideLoading();
        that.setData({
          disabled_getVir: false
        });
        console.log(res);
        if (res.statusCode == 200) {
          if (res.data.errcode == 0) {
            if (res.data.data.total > 0) {
              that.setData({
                carNum: res.data.data.content[0].carNum,
                carNumber: res.data.data.content[0].carNum,
                phoneNumber: res.data.data.content[0].phone
              });
              wx.makePhoneCall({
                phoneNumber: res.data.data.content[0].phone,
                success: function () {
                  console.log('success');
                }
              });
            } else {
              wx.showToast({
                title: '该用户还没有开始使用我们平台哟~',
                duration: 5000,
                icon: 'none'
              });
            }
          } else if (res.data.errcode == 30001) {//用户已经隐藏了手机号
            wx.showToast({
              title: '我已经隐藏起手机号了，你看不到我~',
              duration: 5000,
              icon: 'none'
            });
          } else if (res.data.errcode == 30002) {//虚拟号码已经用光了
            wx.showToast({
              title: '虚拟号码已经用光了，请您稍后再试~',
              duration: 5000,
              icon: 'none'
            });
          }else{
            wx.showToast({
              title: '我忙不过来了，请您稍后再试~',
              duration: 5000,
              icon: 'none'
            });
          }
        }
      },
      fail: function () {
        wx.hideLoading();
        that.setData({
          disabled_getVir: false
        });
      }
    })
  },
  onLoad: function (opt) {
    console.log('onLoad', opt)
    var that = this;
    if (!!opt && !!opt.qrcodeId && !!opt.carNum){
      opt.carNum = decodeURIComponent(opt.carNum);
      opt.isopen = (opt.isopen==1 ? true : false);
      if(!opt.isopen){
        that.setData({
          carNum: opt.carNum,
          carNumber: opt.carNum,
          qrcodeId: opt.qrcodeId,
          isShowBtn: opt.isopen,
          contentbtn: '我已经隐藏起手机号了，你看不到我~'
        });
      } else if (parseInt(opt.remainTime) <= 0) {
        that.setData({
          carNum: opt.carNum,
          carNumber: opt.carNum,
          qrcodeId: opt.qrcodeId,
          isShowBtn: opt.isopen,
          contentbtn: '车主费用已用完，双方都将显示真实号码！'
        });
      }else{
        that.setData({
          carNum: opt.carNum,
          carNumber: opt.carNum,
          qrcodeId: opt.qrcodeId,
          isShowBtn: opt.isopen
        });
      }
      console.log(that.data)
    }
    // if (!wx.canvasGetImageData) {// 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    //   wx.showModal({
    //     title: '提示',
    //     content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    //   })
    // }
  }
})
