//index.js
//获取应用实例
var app = getApp()

var temp;
Page({
  data: {
    imgUrls: [
      {id:1,imgurl:'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg'},
      { id:2,imgurl:'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg'}
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    disabled: false,
    loading: false,
    phoneNB: '',
    carNumber: '',
    userImageBase64: '',
    imgW: 0,
    imgH: 0
  },
  btnclick: function(){
    var that = this;
    that.data.disabled = true;
    that.data.loading = true;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res){
        that.data.disabled = false;
        that.data.loading = false;
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.data.imgUrls.push({id:3,imgurl:tempFilePaths[0]});
        that.setData({
          imgUrls: that.data.imgUrls
        });
        that.urlToCanvasToBase64(tempFilePaths[0]);
        // that.setData({
        //   phoneNB: '13714059174'
        // });
        // wx.makePhoneCall({
        //   phoneNumber: that.data.phoneNB
        // })
      },
      fail: function(res){
        that.data.disabled = false;
        that.data.loading = false;
      }
    })
  },
  urlToCanvasToBase64: function(url){
    var that = this;
    var context = wx.createCanvasContext('firstCanvas');
    wx.getImageInfo({
      src: url,
      success: function (imgD) {
        console.log(imgD);
        that.setData({
          imgW: imgD.width,
          imgH: imgD.height
        })
        context.drawImage(url, 0, 0, that.data.imgW, that.data.imgH);
        context.draw();
        setTimeout(function () {
          wx.canvasGetImageData({
            canvasId: 'firstCanvas',
            x: 0,
            y: 0,
            width: that.data.imgW,
            height: that.data.imgH,
            success: res => {
              // console.log(res.data instanceof Uint8ClampedArray) // true
              // console.log(res.data)
              let pngData = upng.encode([res.data.buffer], res.width, res.height)
              var base64 = wx.arrayBufferToBase64(pngData);
              that.setData({
                userImageBase64: 'data:image/jpeg;base64,' + base64
              })
              that.getCarNum(base64);
            },
            fail: res => {
              console.log(res)
            }
          })
        }, 1000)
      }
    });
  },
  getCarNum: function(base64_){
    var that = this;
    wx.request({
      url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/license_plate?access_token=24.d5a58f3823c708578eec3bd524ec05dd.2592000.1528455596.282335-11210806',
      data: {
        image: base64_
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
        if (!res.data.error_code && res.data.words_result){//识别成功
          that.setData({
            carNumber: res.data.words_result.number
          })
        }
      }
    })
  },
  myrequest: function(){
    var that = this;
    wx.request({
      url: 'http://localhost:8899/search',
      data: {
        cardNo: '粤00009'
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
      }
    })
  },
  toRegist: function(){
    wx.navigateTo({
      url: '../manage/bind?id=1'
    })
  },
  chooseImg_: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log("size", res.tempFiles[0].size / 1024);
        var tempFilePaths = res.tempFilePaths
        wx.showLoading({
          title: "图片正在上传...",
          mask: true
        });
        that.urlToCanvasToBase64(tempFilePaths[0]);
      },
      fail: function (res) { }
    })
  },
  urlToCanvasToBase64: function (url) {
    var that = this;
    var context = wx.createCanvasContext('firstCanvas');
    wx.getImageInfo({
      src: url,
      success: function (imgD) {
        console.log(imgD);
        that.setData({
          imgW: wx.getSystemInfoSync().windowWidth,
          imgH: wx.getSystemInfoSync().windowWidth * imgD.height / imgD.width
        });
        context.drawImage(url, 0, 0, that.data.imgW, that.data.imgH);
        context.draw();
        setTimeout(function () {
          wx.canvasGetImageData({
            canvasId: 'firstCanvas',
            x: 0,
            y: 0,
            width: that.data.imgW,
            height: that.data.imgH,
            success: res => {
              // console.log(res.data instanceof Uint8ClampedArray) // true
              let pngData = upng.encode([res.data.buffer], res.width, res.height);
              // var arrayBuffer = new Uint8Array(res.data);
              var base64 = wx.arrayBufferToBase64(pngData);
              // var base64 = Base64.CusBASE64.encoder(res.data);
              // console.log("本地图片路径base6458：", base64);
              that.setData({
                userImageBase64: base64//'data:image/jpeg;base64,' + base64
              })
              that.getCarNum(base64);

            },
            fail: res => {
              console.log(res);
              wx.hideLoading();
            }
          })
        }, 1000)
      }
    });
  },
  onLoad: function (opt) {
    console.log('onLoad', opt)
    var that = this;
    if (!wx.canvasGetImageData) {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    
    if (opt.d) {
      that.setData({
        deviceName: opt.d
      });
    }
    //调用应用实例的方法获取全局数据
    // app.getUserInfo(function (userInfo, code) {
    //   //更新数据
    //   that.setData({
    //     userInfo: userInfo,
    //     code: code,
    //   })
    // })
  },
})
