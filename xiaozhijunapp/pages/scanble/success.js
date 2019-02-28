// success.js
Page({
	data: {
		deviceType: null,
    deviceColor: '',
    deviceUrl: '',
		phoneNumber: '400-683-1169'
	},
	phoneCall: function () {
		var that = this;
		wx.makePhoneCall({
			phoneNumber: that.data.phoneNumber,
		});
	},
	onLoad: function (opt) {
    var that = this;
    var color;
    switch (parseInt(opt.type)){
      case 1:
        color = '桔色';
        break;
      case 2:
        color = '蓝色';
        break;
      case 3:
        color = '绿色';
        break;
      case 4:
        color = '青色';
        break;
    }
    console.log(opt.type);
    that.setData({
      deviceType: opt.type,
      deviceColor: color,
      deviceUrl: '../../resource/success' + opt.type + '.png',
    });
	}
})