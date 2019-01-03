//获取应用实例
var app = getApp();
Page({
  data: {
    currentStatus: 2,
    openId: '',
    qrcodeId: '',
    isback: false,
    warnContent: '',
    myData: []
  },
  switchChange: function (e,item) {
    console.log('switch 发生 change 事件，携带值为', e.currentTarget.id);
    console.log('switch 发生 change 事件，携带值为', e.detail.value);
    if (e.detail.value){
      this.changeSattus(e.currentTarget.id, 1);
    }else{
      this.changeSattus(e.currentTarget.id, 0);
    }
  },
  changeSattus: function (id,status) {
    wx.showLoading({
      mask: true
    });
    var that = this;
    wx.request({
      url: app.globalData.hostname + '/changeStatus',
      data: {
        id: id,
        status: status
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        if (res.statusCode == 200 && res.data.errcode == 0) {
          that.getMyData(that.data.openId);
        }
      },
      fail: function () {
        wx.hideLoading();
      }
    })
  },
  getMyData: function (openId) {
    var that = this;
    wx.request({
      url: app.globalData.hostname + '/getData',
      data: {
        openId: openId
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
        if (res.statusCode == 200 && res.data.errcode == 0 && res.data.data.total > 0) {
          var str = '';
          var list = [];
          for (var i = 0; i < res.data.data.content.length;i++){
            if (!res.data.data.content[i].remainTime || res.data.data.content[i].remainTime<=0){
              str += "“" + res.data.data.content[i].carNum+"”"
            }
            var temp = {
              id: res.data.data.content[i].id,
              openId: res.data.data.content[i].openId,
              qrcodeId: res.data.data.content[i].qrcodeId,
              phone: res.data.data.content[i].phone,
              carNum: res.data.data.content[i].carNum,
              status: res.data.data.content[i].status,
              remainTime: res.data.data.content[i].remainTime
            }
            if (!!that.data.qrcodeId && that.data.qrcodeId == temp.qrcodeId) {
              list.unshift(temp);//如果有qrcodeId，要把它放在首位
            } else {
              list.push(temp);
            }
          }
          that.setData({
            myData: list,
            warnContent: str
          });
        }
      }
    })
  },
  toChangeInfo: function (e) {
    var that = this;
    var temp = that.data.myData[e.currentTarget.id];
    temp.carNum = encodeURIComponent(temp.carNum);
    that.data.isback = true;
    wx.navigateTo({
      url: 'changeInfo?objs=' + JSON.stringify(temp)
    });
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    let data = app.touch._touchstart(e, this.data.myData)
    this.setData({
      myData: data
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    let data = app.touch._touchmove(e, this.data.myData)
    this.setData({
      myData: data
    })
  },
  //删除事件
  del: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确认要删除此条信息么？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          that.delRecord(that.data.myData[e.currentTarget.dataset.index]);
          // that.data.myData.splice(e.currentTarget.dataset.index, 1)
          // that.setData({
          //   myData: that.data.myData
          // })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  delRecord: function (data) {
    var that = this;
    wx.request({
      url: app.globalData.hostname + '/del',
      data: {
        id: data.id
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
        if (res.statusCode == 200 && res.data.errcode == 0) {
          wx.showToast({
            title: '删除成功！',
            duration: 2000,
            icon: 'none'
          });
          that.getMyData(that.data.openId);
        }else{
          wx.showToast({
            title: res.data.msg,
            duration: 3500,
            icon: 'none'
          });
        }
      }
    })
  },
  onLoad: function (opt) {
    var that = this;
    if (!!opt && opt.objs) {
      var _bojs = JSON.parse(opt.objs);
      console.log(_bojs);
      var str = '';
      // _bojs[1].remainTime = 50*60;
      for (var i = 0; i < _bojs.length; i++){
        _bojs[i].carNum = decodeURIComponent(_bojs[i].carNum);
        if (!_bojs[i].remainTime || _bojs[i].remainTime <= 0) {
          str += "“" + _bojs[i].carNum + "”"
        }
      }
      that.setData({
        openId: _bojs[0].openId,
        qrcodeId: _bojs[0].qrcodeId,
        myData: _bojs,
        warnContent: str
      });
    } else if (!!opt && !!opt.openId && !!opt.qrcodeId){//这里是代表从注册成功页面进来的
      that.data.openId = opt.openId;
      that.data.qrcodeId = opt.qrcodeId;
      that.getMyData(opt.openId);
    }
  },
  onShow: function () {
    // Do something when page show.
    var that = this;
    if (that.data.isback){
      that.getMyData(that.data.openId);
    }
    // if (that.data.isback) {
    //   wx.showToast({
    //     title: '555~',
    //     icon: 'none'
    //   });
    // }
  }
})
