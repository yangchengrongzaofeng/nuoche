//获取应用实例
var app = getApp();
var si = null;//计时器
Page({
  data: {
    userData: {},
    codeTitle: '发送验证码',
    time: 90,
    carNumIsNoUse: true,
    disabled_update: false,
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
    result = express.test(phone);
    return result;
  },
  sendCode: function () {
    var that = this;
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
    if (that.data.time != 90) {
      wx.showToast({
        title: that.data.time + '秒后再试~',
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
        if (res.statusCode == 200 && res.data.errcode == 0) {
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
            } else {
              if (that.data.userData.phone.length == 11) {
                that.setData({
                  codeTitle: that.data.time + '秒'
                });
              } else {
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
      fail: function () {
        wx.hideLoading();
      }
    })
  },
  updateSubmit: function (e) {
    var that = this;
    if (that.data.disabled_update) {
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
      disabled_update: true
    });
    wx.request({
      url: app.globalData.hostname + '/update',
      data: that.data.userData,
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        wx.hideLoading();
        that.setData({
          disabled_update: false
        });
        if (res.statusCode == 200 && res.data.errcode == 0) {
          wx.navigateBack({
            delta: 1
          })
        }else{
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          });
        }
      },
      fail: function () {
        wx.hideLoading();
        that.setData({
          disabled_update: false
        });
      }
    })
  },
  checkCarNum: function (carNum) {
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
        } else {
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
      for (let i = 0; i < arr.length; i++) {
        if (reg1.test(arr[i])) {
          arr[i] = arr[i].toUpperCase();
        }
      }
      var result = arr.join("");
      that.data.userData.carNum = result;
      that.setData({
        userData: that.data.userData
      });
      if (that.isVehicleNumber(result)) {//输入的车牌号格式正确后自动检测是否已经被他人使用
        that.checkCarNum(result);
      }
    } else if (e.currentTarget.id == 'phone') {
      console.log('###########################################');
      if (!e.detail.value || e.detail.value.length != 11) {
        console.log(si);
        if (si != null) {
          clearInterval(si);
          si = null;
          that.setData({
            time: 90,
            codeTitle: '重新发送'
          });
        }
      }
      that.data.userData.phone = e.detail.value;
    }
    that.setData({
      userData: that.data.userData
    })
  },
  onLoad: function (opt) {
    var that = this;
    if (!!opt && opt.objs) {
      var _bojs = JSON.parse(opt.objs);
      _bojs.carNum = decodeURIComponent(_bojs.carNum);
      console.log(_bojs);
      that.setData({
        userData: _bojs
      });
    }
  }
})
