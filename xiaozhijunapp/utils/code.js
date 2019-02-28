function getCmd (deviceKey) {
  var hex = deviceKey;
  console.log('编码前:'+ hex);
  var arr = [];
  for (var i = 0; i < hex.length; i++) {
    var num10 = hex.charCodeAt(i);  ///< 以10进制的整数返回 某个字符 的unicode编码
    arr.push(num10);
  }
  console.log("编码后:" + arr);
  var typedArray = new Uint8Array(arr);
  console.log(typedArray);
  return typedArray.buffer;
}
function deCode (arr){
  arr = new Uint8Array(arr);
  var str = '';
  for (var i = 0; i < arr.length; i++) {
    str+=String.fromCharCode(arr[i]);
  };
  return str;
}
function getOldCmd () {
  var hex = '6f70656e626f78'
  var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  }))
  console.log(typedArray);
  return typedArray.buffer;
}
function deOldCode (arr){
  arr = new Uint8Array(arr);
  var str = '';
  for (var i = 0; i < arr.length; i++) {
    str+=arr[i].toString(16);
  };
  return str;
}
module.exports.getCmd = getCmd;
module.exports.deCode = deCode;
module.exports.getOldCmd = getOldCmd;
module.exports.deOldCode = deOldCode;