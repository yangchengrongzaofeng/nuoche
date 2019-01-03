//获取应用实例
var app = getApp();
var si = null;//计时器
Page({
  data: {
    userData: {},
    butType: 1,//1-获取手机号，2-获取验证码
    codeTitle: '发送验证码',
    time: 90,
    radioValue: 1,
    showloading: true,
    carNumIsNoUse: false,
    disabled_regist: false,
  },
  isVehicleNumber: function (vehicleNumber) {
    //新能源车规则
    var xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
    //普通汽车规则（只包括了普通车牌号，教练车，警等车牌号 。部分部队车，新能源不包括在内）
    var creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
    if (vehicleNumber.length == 7) {
      return creg.test(vehicleNumber);
    } else if (vehicleNumber.length == 8) {
      return xreg.test(vehicleNumber);
    } else {
      return false;
    }
  },
  checkPhone: function (phone) {
    var result = false;
    var express = /^(14[0-9]|13[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])\d{8}$/;
    // var express = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
    result = express.test(phone);
    return result;
  },
  sendCode: function () {
    var that = this;
    if (that.data.time!=90){
      wx.showToast({
        title: that.data.time+'秒后再试~',
        duration: 2000,
        icon: 'none'
      });
      return;
    }
    wx.showLoading({
      mask: true
    });
    wx.request({
      url: app.globalData.hostname + '/sendCode',
      data: {
        phone: that.data.userData.phone,
        openId: that.data.userData.openId
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode == 200 && res.data.errcode == 0){
          wx.showToast({
            title: '发送成功',
            icon: 'none'
          });
          si = setInterval(function () {
            that.data.time--;
            if (that.data.time < 0) {
              clearInterval(si);
              si = null;
              that.setData({
                time: 90,
                codeTitle: '重新发送'
              });
            }else{
              if (that.data.userData.phone.length==11){
                that.setData({
                  codeTitle: that.data.time + '秒'
                });
              }else{
                clearInterval(si);
                si = null;
                that.setData({
                  time: 90,
                  codeTitle: '重新发送'
                });
              }
            }
          }, 1000);
        }
      },
      fail: function(){
        wx.hideLoading();
      }
    })
  },
  radioChange: function (e) {
    this.setData({
      radioValue: e.detail.value
    });
    wx.navigateBack({
      delta: 1
    });
  },
  prew(e){
    wx.previewImage({
      current: 'http://oixlf0mzw.bkt.clouddn.com/charge1.jpg', // 当前显示图片的http链接
      urls: ['http://oixlf0mzw.bkt.clouddn.com/charge1.jpg'], // 需要预览的图片http链接列表
      complete:function(e){
        console.log(e)
      }
    })
  },
  registSubmit: function (e) {
    var that = this;
    if (that.data.disabled_regist) {
      return;
    }
    console.log(that.data.userData);
    if (!that.data.userData.phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      });
      return;
    } else if (that.data.userData.phone.length != 11 || !that.checkPhone(that.data.userData.phone)) {
      wx.showToast({
        title: '手机号有误',
        icon: 'none'
      });
      return;
    }
    if (!that.data.userData.authCode) {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none'
      });
      return;
    } else if (that.data.userData.authCode.length != 4) {
      wx.showToast({
        title: '验证码有误',
        icon: 'none'
      });
      return;
    }
    if (!that.data.userData.carNum) {
      wx.showToast({
        title: '车牌号不能为空',
        icon: 'none'
      });
      return;
    } else if (!that.isVehicleNumber(that.data.userData.carNum)) {
      wx.showToast({
        title: '您的车牌号输入格式有误，正确格式如：京A88888',
        icon: 'none'
      });
      return;
    } else if (!that.data.carNumIsNoUse) {
      wx.showToast({
        title: '您的车牌号已经被别人注册过了哦~',
        icon: 'none'
      });
      return;
    }
    wx.showLoading({
      mask: true
    });
    that.setData({
      disabled_regist: true
    });
    wx.request({
      url: app.globalData.hostname + '/regist',
      data: that.data.userData,
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        wx.hideLoading();
        that.setData({
          disabled_regist: false
        });
        if (res.statusCode == 200) {
          if (res.data.errcode == 0){
            wx.navigateTo({
              url: 'registeSuccess?openId=' + that.data.userData.openId + '&qrcodeId=' + that.data.userData.qrcodeId
            });
          } else if (res.data.errcode == 30003) {//二维码id不存在
            wx.showToast({
              title: '您的小程序码有问题哟，请联系商家~',
              duration: 3500,
              icon: 'none'
            });
          } else if (res.data.errcode == 30004) {//该二维码已被使用
            wx.showToast({
              title: '您的小程序码已经被使用过了~',
              duration: 3500,
              icon: 'none'
            });
          }else{
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            });
          }
        }
      },
      fail: function(){
        wx.hideLoading();
        that.setData({
          disabled_regist: false
        });
      }
    })
  },
  checkCarNum: function (carNum){
    this.data.carNumIsNoUse = true;
    return;
    var that = this;
    wx.request({
      url: app.globalData.hostname + '/checkCarNum',
      data: {
        carNum: carNum,
        openId: that.data.userData.openId
      },
      header: {
        'content-type': 'application/json'//'application/x-www-form-urlencoded'
      },
      method: 'post',
      success: function (res) {
        if (res.statusCode == 200 && res.data.errcode == 0) {
          that.data.carNumIsNoUse = true;
        }else{
          that.data.carNumIsNoUse = false;
          wx.showToast({
            title: '您的车牌号已经被别人注册过了哦~',
            icon: 'none'
          });
        }
      }
    })
  },
  bindKeyInput: function (e) {
    var that = this;
    if (e.currentTarget.id == 'authCode') {
      that.data.userData.authCode = e.detail.value;
    } else if (e.currentTarget.id == 'carNum') {
      var arr = e.detail.value.replace(/\s/g, "").split('');
      var reg1 = /[a-z]+/; //匹配小写
      for(let i=0;i<arr.length;i++){
        if (reg1.test(arr[i])) {
          arr[i] = arr[i].toUpperCase();
        }
      }
      var result = arr.join("");
      that.data.userData.carNum = result;
      that.setData({
        userData: that.data.userData
      });
      if (that.isVehicleNumber(result)) {//输入的车牌号格式正确后自动检测是否已经被别人使用，暂时不适用
        that.checkCarNum(result);
      }
    } else if (e.currentTarget.id == 'phone') {
      console.log('###########################################');
      if (!e.detail.value || e.detail.value.length != 11){
        console.log(si);
        if (si!=null){
          clearInterval(si);
          si = null;
          that.setData({
            time: 90,
            codeTitle: '重新发送'
          });
        }
        that.setData({
          butType: 1
        })
      }
      that.data.userData.phone = e.detail.value;
    }


    if (that.data.userData.phone && that.data.userData.phone.length==11 && that.checkPhone(that.data.userData.phone)) {
      that.setData({
        userData: that.data.userData,
        butType: 2
      })
    }else{
      that.setData({
        userData: that.data.userData
      })
    }
  },
  getPhoneNumber: function (e) {
    if (!e.detail.iv || !e.detail.encryptedData){
      return;
    }
    wx.showLoading({
      mask: true
    });
    var that = this;
    wx.request({
      url: app.globalData.hostname + '/getWXPhone',
      data: {
        sessionKey: app.globalData.sessionKey,
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        if (res.statusCode == 200 && res.data.errcode == 0) {
          console.log(res.data.data);
          that.data.userData.phone = res.data.data.purePhoneNumber;//没有区号的手机号
          that.setData({
            userData: that.data.userData,
            butType: 2
          });
        }
        wx.hideLoading();
      },
      fail: function () {
        wx.hideLoading();
      }
    });
  },
  getData: function () {//查询自己信息或者包含车主信息
    var that = this;
    wx.request({
      url: app.globalData.hostname + '/getData',
      data: {
        openId: that.data.userData.openId,
        qrcodeId: that.data.userData.qrcodeId
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        if (res.statusCode == 200 && res.data.errcode == 0) {
          if (!that.data.userData.qrcodeId){//不是扫码进入的--这样的话获取的数据只能是自己的
            if (res.data.data.total > 0) {//不是扫码进入的但是本人注册过了
              var list = [];
              for (var i = 0; i < res.data.data.content.length; i++) {
                var temp = {
                  id: res.data.data.content[i].id,
                  openId: res.data.data.content[i].openId,
                  qrcodeId: res.data.data.content[i].qrcodeId,
                  phone: res.data.data.content[i].phone,
                  carNum: encodeURIComponent(res.data.data.content[i].carNum),
                  status: res.data.data.content[i].status,
                  remainTime: res.data.data.content[i].remainTime
                }
                if (!!that.data.userData.qrcodeId && that.data.userData.qrcodeId == temp.qrcodeId){
                  list.unshift(temp);//如果有qrcodeId，要把它放在首位
                }else{
                  list.push(temp);
                }
              }
              wx.redirectTo({
                url: 'myCar?objs=' + JSON.stringify(list)
              });
            } else {//不是扫码进入的且本人没有注册过
              wx.redirectTo({
                url: 'error?content=' + encodeURIComponent('亲！要扫码才能使用哦~')
              });
            }
          }else{//扫码进入的--获取的数据有可能是自己也有可能是车主的
            if (res.data.data.total > 0) {
              var isNoUsedQrCode = true;//该小程序码没有被使用
              var list = [];
              for (var i = 0; i < res.data.data.content.length; i++) {
                if (res.data.data.content[i].openId == that.data.userData.openId) {//自己的数据
                  var temp = {
                    id: res.data.data.content[i].id,
                    openId: res.data.data.content[i].openId,
                    qrcodeId: res.data.data.content[i].qrcodeId,
                    phone: res.data.data.content[i].phone,
                    carNum: encodeURIComponent(res.data.data.content[i].carNum),
                    status: res.data.data.content[i].status,
                    remainTime: res.data.data.content[i].remainTime
                  }
                  if (!!that.data.userData.qrcodeId && that.data.userData.qrcodeId == temp.qrcodeId) {
                    list.unshift(temp);//如果有qrcodeId，要把它放在首位
                  } else {
                    list.push(temp);
                  }
                  if (that.data.userData.qrcodeId == res.data.data.content[i].qrcodeId) {
                    isNoUsedQrCode = false;//该小程序码已经被使用
                  }
                } else {//别人的数据,要跳到home页面
                  wx.redirectTo({
                    url: 'home?qrcodeId=' + that.data.userData.qrcodeId + "&carNum=" + encodeURIComponent(res.data.data.content[i].carNum) + '&isopen=' + (!!res.data.data.content[i].status ? 1 : 0) + '&remainTime=' + res.data.data.content[i].remainTime
                  });
                  break;
                }
              }
              if (isNoUsedQrCode) {//该小程序码没有被使用，留在注册页面
                console.log("扫码进入的且该小程序码没有被使用");//留在注册页面
              } else {//该小程序码被自己使用了，跳到我的车牌页面
                wx.redirectTo({
                  url: 'myCar?objs=' + JSON.stringify(list)
                });
              }
            } else {//扫码进入的且该小程序码没有被使用
              console.log("扫码进入的且该小程序码没有被使用");//留在注册页面
            }
          }
        }
        setTimeout(function () {
          that.setData({
            showloading: false
          });
        },1000);
      }
    })
  },
  getOpenId: function(code){
    var that = this;
    wx.request({
      url: app.globalData.hostname + '/getOpenId',
      data: {
        code: code
      },
      header: {
        'content-type': 'application/json'//'application/x-www-form-urlencoded'
      },
      method: 'post',
      success: function (res) {
        if (res.statusCode == 200 && res.data.errcode == 0){
          console.log(res.data.data.openId);
          that.data.userData.openId = res.data.data.openId;
          app.globalData.openId = res.data.data.openId;
          if (!!res.data.data.sessionKey){
            app.globalData.sessionKey = res.data.data.sessionKey;
          }
          console.log(app.globalData);
          that.getData();
        }
      }
    })
  },
  onLoad: function (opt) {
    var that = this;
    if (!!opt && !!opt.scene){
      that.data.userData.qrcodeId = opt.scene;
      console.log('小程序码=========', opt.scene);
    }else{
      console.log('这个小程序码识别不出序列号，可能已损坏或者不是扫码进入小程序的');
    }
    setTimeout(function () {
      if (that.data.showloading){
        that.setData({
          showloading: false
        });
      }
    }, 5000);
    app.getUserInfo(function (userInfo, code) {// 调用应用实例的方法获取全局数据
      console.log(code);
      that.getOpenId(code);
    })
  }
})
