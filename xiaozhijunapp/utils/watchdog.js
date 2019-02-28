
var lastTime = new Date().getTime();

function touch() {
  lastTime = new Date().getTime();
};

var topClass = null;

function init(scanble) { //用户长时间不动，我们就把该页面关掉。防止占用蓝牙资源
  topClass = scanble;
  lastTime = new Date().getTime();
  console.log("topClass", topClass);
  this.timerId=setTimeout(check,5000);
}

function check(){
  var currentTime = new Date().getTime();
  console.log("enter watch dog checking function**************", currentTime - lastTime);
  if (currentTime - lastTime > 60000) {//60s
    if(topClass.data.isPaySuccessBack){//支付页面已经弹起
      touch();
    }else{
      topClass.readyForNextStep(topClass.pStatus.finished, false);
    }
  } else {
    console.log("watch dog idle time", currentTime - lastTime);
    if (topClass.pageState != 4) {
      setTimeout(check, 5000);
    }
  }
}

function handleState(event) {
  if (event == topClass.pStatus.userClicked || event == topClass.pStatus.payed) {
    touch();
  }
}

module.exports.init = init;
module.exports.handleState = handleState;
