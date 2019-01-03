Page({
  data: {
    openId: '', 
    qrcodeId: ''
  },
  toMy: function(){
    var that = this;
    wx.navigateTo({
      url: 'myCar?openId=' + that.data.openId + '&qrcodeId=' + that.data.qrcodeId
    })
  },
  onLoad: function (opt) {
    var that = this;
    that.setData({
      openId: opt.openId,
      qrcodeId: opt.qrcodeId
    });
  },
})
