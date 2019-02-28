function setErrorLog(params){
  wx.request({
    url: 'https://www.xccnet.com/log/write?content='+params,
    success: function (res) {
      console.log(res);
      if (res.statusCode == 200) {
        console.log(res.data);
      }
    }
  })
}
module.exports.setErrorLog = setErrorLog;