//errcode: 0--ok,50000--error,30001--用户已经隐藏了手机号,30002--虚拟号码已经用光了,30003--二维码id不存在,30004--二维码已被使用,30005--车牌号已被使用
var https = require('https');
var querystring = require('querystring');
var fs = require("fs");
var WXBizDataCrypt = require('./WXBizDataCrypt');
var SHA = require('./SHA');
var sha = new SHA();
var appid = '*****';
var secret = '*****';
var sms = {
    appKey :'*****',
    appSecret :'****',
    templateid: '****',//短信验证码
    templateid2: '****',//号码有异常
    templateid3: '****',//费用已用完
}
//获取微信用户openid和session_key 
function getOpenId(code,response,encryptedData,iv){
    var options={  
        hostname: 'api.weixin.qq.com',
        path: '/sns/jscode2session?appid='+appid+'&secret='+secret+'&js_code='+code+'&grant_type=authorization_code',
        method: 'GET',
        rejectUnauthorized: false,
        headers:{
          'Content-Type': 'application/json'
        }
    }  
    var req = https.request(options, function (res) {  
      res.on('data', function (data) {
        console.log(data.toString());
        if(!!data){
            var obj = JSON.parse(data);//转换成对象
            if(!!encryptedData && !!iv){
                try{
                    var pc = new WXBizDataCrypt(appid, obj.session_key);
                    var redata = pc.decryptData(encryptedData, iv);
                    console.log('解密后 data: ', redata);
                    if(!!redata&&!!redata.phoneNumber&&!!redata.purePhoneNumber){
                        var redata_ = {
                            phoneNumber: redata.phoneNumber,
                            purePhoneNumber: redata.purePhoneNumber
                        }
                        response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify(redata_)+'}');
                    }else{
                        response.end('{"errcode":50000,"msg":"error"}');
                    }
                }catch(err){
                    console.log(err);
                    response.end('{"errcode":50000,"msg":"error"}');
                }
            }else{
              if(!!obj.openid){
                  response.end('{"errcode":0,"msg":"ok","data":{"openId":"'+obj.openid+'","sessionKey":"'+obj.session_key+'"}}');
              }else{
                  response.end('{"errcode":50000,"msg":"error"}');
              }
            }
        }else{
            response.end('{"errcode":50000,"msg":"error"}');
        }
      });
    });
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    req.end();
}
//解密获取手机号
function analysisPhone(response,sessionKey,encryptedData,iv){
    try{
        var pc = new WXBizDataCrypt(appid, sessionKey);
        var redata = pc.decryptData(encryptedData, iv);
        console.log('解密后 data: ', redata);
        if(!!redata&&!!redata.phoneNumber&&!!redata.purePhoneNumber){
            var redata_ = {
                phoneNumber: redata.phoneNumber,
                purePhoneNumber: redata.purePhoneNumber
            }
            response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify(redata_)+'}');
        }else{
            response.end('{"errcode":50000,"msg":"error"}');
        }
    }catch(err){
        console.log(err);
        response.end('{"errcode":50000,"msg":'+err+'}');
    }
}
//发送短信验证码给用户type==3代表消息推送
function smsParams(phone,content,type){
    var params = {};
    var number,authCode;
    do
      number = Math.floor(Math.random()*10000);
    while(number<1000) 
      authCode = number;
    if(!content){
        if(type==3){//消息推送--费用已用完
            params.data = querystring.stringify({
              templateid: sms.templateid3,
              mobiles: '['+phone+']',
              needUp: true,
              // params: content//短信变量
            });
        }else{//短信验证码
            params.data = querystring.stringify({
              templateid: sms.templateid,
              mobile: phone,
              authCode: authCode//验证码
            });
        }
    }else{//警报通知--号码有异常
      params.data = querystring.stringify({
        templateid: sms.templateid2,
        mobile: phone,
        authCode: content//警报内容
      });
    }
    params.authCode = authCode;
    var appKey = sms.appKey;
    var appSecret = sms.appSecret;
    var nonce = Math.random().toString(36).substr(2, 15);
    var timestamp = Math.floor((new Date()).getTime()/1000)+'';
    var sha1Str = appSecret + nonce + timestamp;
    var CheckSum = sha.SHA2(sha1Str);
    console.log(CheckSum);
    params.headers = {   
        'Content-Type':'application/x-www-form-urlencoded;charset=utf-8',
        'AppKey': appKey,
        'Nonce': nonce,
        'CurTime': timestamp,
        'CheckSum': CheckSum
    }
    return params;
}
var redis = require("redis");
var client = redis.createClient(6379,"127.0.0.1");
client.on('error',function(error){
   console.log(error);
});
function sendCode(str,response){
    /*//----------------------------------测试时节省短信验证码用start--------------------------------------//
    var validTime = 5*60;//单位是秒
    client.hmset(str.openId, { obj: '1111',phone: str.phone}, function(err) {
        if(err){
            throw err;
        }
        response.end('{"errcode":0,"msg":"ok"}');
    });
    client.expire(str.openId, parseInt(validTime));
    return;
    //----------------------------------测试时节省短信验证码用end--------------------------------------//*/
    var obj = smsParams(str.phone);
    var dataL = obj.data;
    var options={  
        hostname: 'api.netease.im',
        path: '/sms/sendcode.action',
        method: 'POST',
        rejectUnauthorized: false,
        headers: obj.headers
    }  
    var req = https.request(options, function (res) {  
      res.on('data', function (data) {
        console.log(data.toString());
        var result = JSON.parse(data).obj;
        if(result==obj.authCode){
            var validTime = 5*60;//单位是秒
            client.hmset(str.openId, { obj: obj.authCode,phone: str.phone}, function(err) {
                if(err){
                    throw err;
                }
                response.end('{"errcode":0,"msg":"ok"}');
            });
            client.expire(str.openId, parseInt(validTime));
        }else{
            response.end('{"errcode":50000,"msg":"sms error"}');
        }
      });
    });
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    req.write(dataL);
    req.end();
}
function sendWarning(phones,content){
  console.log('警告'+phones[0],content)
    var obj = smsParams(phones[0],content);
    var dataL = obj.data;
    var options={  
        hostname: 'api.netease.im',
        path: '/sms/sendcode.action',
        method: 'POST',
        rejectUnauthorized: false,
        headers: obj.headers
    }  
    var req = https.request(options, function (res) {  
      res.on('data', function (data) {
        console.log(data.toString());
      });
    });
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    req.write(dataL);
    req.end();
}
function send_Warning(phones){//phones=['13888888888','13666666666'],content=['xxxx','xxxx']//使用通知类模板9404199
    var obj = smsParams(phones,null,3);
    var dataL = obj.data;
    var options={  
        hostname: 'api.netease.im',
        path: '/sms/sendtemplate.action',
        method: 'POST',
        rejectUnauthorized: false,
        headers: obj.headers
    }  
    var req = https.request(options, function (res) {  
      res.on('data', function (data) {
        console.log(data.toString());
      });
    });
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    req.write(dataL);
    req.end();
}
//////////////////////////////////////虚拟号码start/////////////////////////////////////////////////////
/**
 * 云通信基础能力业务-号码隐私保护示例，仅供参考。
 * Created on 2018-07-27
 */
const PLSClient = require('@alicloud/pls-sdk');
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = '*****';
const secretAccessKey = '******';
//在云通信页面开通相应业务消息后，就能在页面上获得对应的queueName
const queueName = '******';
//初始化sms_client
const plsClient = new PLSClient({ accessKeyId, secretAccessKey });
const PoolKey = 'FC100000056678406';
function timeForm(date, fmt){
    date = new Date(date);
    // 返回处理后的值
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    }
    for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
            let str = o[k] + ''
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length))
        }
    }
    return fmt
}
//第三方提供的虚拟号码有问题，记录返回信息---接口没有返回正确格式
function errorLogs(content){
    content = content+' '+(new Date().toLocaleString())+'\n';
    fs.appendFile("./logs/bindAndUnbindErr.log",content , (error)  => {
        if (error) return console.log("追加文件失败" + error.message);
        console.log("追加成功");
    });
}
//第三方提供的虚拟号码有问题，记录返回信息
function recordErrorLogs(data,type,virtualNum,phone){
    data.type = type;
    data.virtualNum = virtualNum;
    if(!!phone){
        data.phone = phone;
    }
    data.createTime = new Date().toLocaleString();
    var wstr = JSON.stringify(data);
    wstr = wstr+'\n';
    fs.appendFile("./logs/bindAndUnbindErr.log",wstr , (error)  => {
        if (error) return console.log("追加文件失败" + error.message);
        console.log("追加成功");
    });
}
//绑定只能绑定一次，第二次会绑定失败
function bindPhone(phoneRows,virtualNum,response){//失败后会锁定该虚拟号码并返回真是号码
    var expiration = new Date().getTime();
    expiration+=3*60*1000;//3分钟后如果没有解绑的话会自动解绑
    expiration = timeForm(expiration,'yyyy-MM-dd hh:mm:ss');
    plsClient.bindAxn({
        PoolKey,
        PhoneNoA: phoneRows[0].phone,
        PhoneNoX: virtualNum,
        Expiration: expiration
    }).then(function (res) {
        console.log('绑定axn', res);
        // receiveMsg();
        recordErrorLogs(res,"bind",virtualNum,phoneRows[0].phone);//把绑定错误记录下来
        phoneRows[0].phone = virtualNum; //把号码改成虚拟号码
        var validTime = 3 * 60; //单位是秒
        client.hmset(phoneRows[0].openId + phoneRows[0].qrcodeId, {
            virtualNum: virtualNum
        }, function(err) {
            if (err) {
                throw err;
            }
            console.log('setHmsetVirtualNumSuccess');
        });
        client.expire(phoneRows[0].openId + phoneRows[0].qrcodeId, parseInt(validTime));
        setSubsId(phoneRows,res.SecretBindDTO.SubsId);//把subsId设置到车主表，后面计算花费时有用
        getBackVirtualNum_(res.SecretBindDTO.SubsId,virtualNum);
        response.end('{"errcode":0,"msg":"ok","data":' + JSON.stringify({content: phoneRows,total: phoneRows.length}) + '}');
    }, function (err) {
      console.log('绑定axn失败', err);
      var wstr = err;
      if(typeof err!="string"){
        wstr = JSON.stringify(err);
      }
      errorLogs("bind_err="+wstr);
      response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: phoneRows,total: phoneRows.length})+'}');
      toExcuteGetManager(virtualNum);
      toExcuteLockVirtual(virtualNum);
    });
}
//解绑定多次的返回数据是一样的
function freePhone(subsId,virtualNum){
  console.log("freePhone---------");
  console.log(subsId);
  console.log(virtualNum);
  plsClient.unbindSubscription({
    PoolKey,
    SubsId: subsId,
    SecretNo: virtualNum,
  }).then(function (res) {
    console.log('解绑', res);
    recordErrorLogs(res,"unbind",virtualNum);//把解绑错误记录下来
    toExcuteBackVirtual(subsId,virtualNum);
  }, function (err) {
      console.log('解绑失败', err);
      var wstr = err;
      if(typeof err!="string"){
          wstr = JSON.stringify(err);
      }
      errorLogs("unbind_err="+wstr);
  });
}
/**
 * @param type: 0/1/2 对应 小号呼叫状态回执/录音状态报告接收/短信内容报告接受
 * @param queueName 队列名称，必须是type下的队列
 * @param waitSeconds 队列等待时间，如果没有删除该消息，过了等待时间后会重新推送
 * @param isDel 是否删除消息
 */
  //主入口
function getRealJsonData(baseStr) {
    if (!baseStr || typeof baseStr != 'string') return;
    var jsonData = null;
    try {
        jsonData = JSON.parse(baseStr);
    } catch (err){
        return null;
    }
    var needReplaceStrs = [];
    loopFindArrOrObj(jsonData,needReplaceStrs);
    needReplaceStrs.forEach(function (replaceInfo) {
        var matchArr = baseStr.match(eval('/"'+ replaceInfo.key + '":[0-9]{15,}/'));
        if (matchArr) {
            var str = matchArr[0];
            var replaceStr = str.replace('"' + replaceInfo.key + '":','"' + replaceInfo.key + '":"');
            replaceStr += '"';
            baseStr = baseStr.replace(str,replaceStr);
        }
    });
    var returnJson = null;
    try {
        returnJson = JSON.parse(baseStr);
    }catch (err){
        return null;
    }
    return returnJson;
}
//遍历对象类型的
function getNeedRpStrByObj(obj,needReplaceStrs) {
    for (var key in obj) {
        var value = obj[key];
        if (typeof value == 'number' && value > 9007199254740992){
            needReplaceStrs.push({key:key});
        }
        loopFindArrOrObj(value,needReplaceStrs);
    }
}
//遍历数组类型的
function getNeedRpStrByArr(arr,needReplaceStrs) {
    for(var i=0; i<arr.length; i++){
        var value = arr[i];
        loopFindArrOrObj(value,needReplaceStrs);
    }
}
//递归遍历
function loopFindArrOrObj(value,needRpStrArr) {
    var valueTypeof = Object.prototype.toString.call(value);
    if (valueTypeof == '[object Object]') {
        needRpStrArr.concat(getNeedRpStrByObj(value,needRpStrArr));
    }
    if (valueTypeof == '[object Array]') {
        needRpStrArr.concat(getNeedRpStrByArr(value,needRpStrArr));
    }
}
function receiveMsg(){
    plsClient.receiveMsg(0,queueName, waitSeconds = 10, isDel = true).then(function (res) {
    //消息体需要base64解码
    let { code, body } = res;
    if (code === 200) {
        //处理消息体,messagebody
        // console.log('回执报告:', body)
        // console.log('剩余未接收队列:', body.DequeueCount)
        // console.log(parseInt(body.DequeueCount));
        if(!!body && !!body.MessageBody){
            var b = new Buffer(body.MessageBody, 'base64');
            var obj = getRealJsonData(b.toString());
            console.log(obj.phone_no+"监听到通话信息推送了");//绑定手机号
            let st = (new Date(obj.start_time).getTime())/1000;
            let et = (new Date(obj.release_time).getTime())/1000;
            var tempData = {
                calling: obj.peer_no,
                called: obj.phone_no,
                virtualNumber: obj.secret_no,
                callIdentifier: obj.sub_id,
                timestart: obj.start_time,
                timestamp: obj.release_time,
                duration: (Math.ceil((et-st)/60)*60)//时间是按分钟算的
            };
            console.log(tempData);
            handleRecord(tempData);//挂断后记录通话记录
            handleCarMaster(tempData);//挂断后记录通话次数和时长，把异常使用的车主手机号禁用掉
            getBackVirtualNumNow(obj.sub_id,obj.secret_no);//挂断时检测虚拟号是否已经回收，没有回收立即回收
        }
      }
    }, function (err) {
        // console.log('回执报告err:', err);
    });
}
// setTimeout(function(){
//   receiveMsg();
// },5000);
setInterval(function(){
    receiveMsg();
},20000);//监听频率是20秒监听一次
//////////////////////////////////////虚拟号码end////////////////////////////////////////////////////
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 100,//连接池数
    host      : 'localhost',
    user      : 'root',
    password    : '*****',//本地是123456
    database    : '*****'
});
//使用getConnection方法-执行
function querySQL(sql, params, callback){
    pool.getConnection(function(err,conn){
        conn.query(sql,params,function(err,rows,fields){
            if (err) throw err;
            callback(rows,fields); 
            conn.release();  // 不要忘了释放
        });    
    });
}
//锁定二维码为使用状态
function updateQrcode(qrcodeId,response){
  var  sql_update = 'UPDATE qrcode set status=1 where id=? ;';
    var update_params = [qrcodeId];
    querySQL(sql_update,update_params,function(rows,fields){
    console.log('qrcode locked successfully');
    response.end('{"errcode":0,"msg":"ok"}');
    });
}
//检测该车牌号是否已被注册
function checkCarNum(data,response){
    var sql_search = 'SELECT * FROM car_master where carNum=? and openId!=? ;';
    var search_params = [data.carNum,data.openId];
    querySQL(sql_search,search_params,function(rows,fields){
        if(rows.length>0){//已经被他人使用
            response.end('{"errcode":30005,"msg":"It has been used by others"}');
        }else{
            response.end('{"errcode":0,"msg":"ok"}');
        }
    });
}
//注册新增用户或者老用户重新绑定
function toExcuteAdd(data,response){
  //查询--二维码是否已使用
  var sql_search_code = 'SELECT * FROM qrcode where id=? ;';
    var search_params_code = [data.qrcodeId];
    querySQL(sql_search_code,search_params_code,function(rowsQR,fields){
        if(!rowsQR || !rowsQR.length){//空，二维码id不存在
            response.end('{"errcode":30003,"msg":"not exit"}');
        }else{//存在
          if(rowsQR[0].status==1){//该二维码已被使用
            response.end('{"errcode":30004,"msg":"already used"}');
          }else if(rowsQR[0].status==2){//该二维码被使用过，现在是重新绑定使用
                //查询--车主
                var sql_search = 'SELECT * FROM car_master where qrcodeId=? ;';
                var search_params = [data.qrcodeId];
                querySQL(sql_search,search_params,function(rows,fields){
                    if(!rows || !rows.length){//空，新增（基本不会出现）
                        var  sql_add = 'INSERT INTO car_master(openId,qrcodeId,carNum,phone,status,remainTime,createTime,times,lastCallDuration,allCallDuration,showRealPhone,balance,timesPerMonth) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?);';
                        var add_params = [data.openId,data.qrcodeId,data.carNum,data.phone,1,7200,new Date().toLocaleString(),0,0,0,0,0,0];
                        querySQL(sql_add,add_params,function(rowsADD,fields){
                            //锁定二维码
                            updateQrcode(data.qrcodeId,response);
                        });
                    }else{//修改
                        if(data.openId==rows[0].openId){//本人重新使用
                            var  sql_update = 'UPDATE car_master set carNum=? ,phone=? ,status=1 where qrcodeId=? ;';
                            var update_params = [data.carNum,data.phone,data.qrcodeId];
                            querySQL(sql_update,update_params,function(rowsUP,fields){
                                //锁定二维码
                                updateQrcode(data.qrcodeId,response);
                            });
                        }else{//他人使用，报已经被使用
                            response.end('{"errcode":30004,"msg":"already used"}');
                        }
                    }
                });
            }else{
          //查询--车主
          var sql_search = 'SELECT * FROM car_master where qrcodeId=? ;';
          var search_params = [data.qrcodeId];
          querySQL(sql_search,search_params,function(rows,fields){
              if(!rows || !rows.length){//空，新增
                  var  sql_add = 'INSERT INTO car_master(openId,qrcodeId,carNum,phone,status,remainTime,createTime,times,lastCallDuration,allCallDuration,showRealPhone,balance,timesPerMonth) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?);';
                  var add_params = [data.openId,data.qrcodeId,data.carNum,data.phone,1,7200,new Date().toLocaleString(),0,0,0,0,0,0];
                  querySQL(sql_add,add_params,function(rowsADD,fields){
                  //锁定二维码
                  updateQrcode(data.qrcodeId,response);
                  });
              }else{//修改（基本不会出现）
                  var  sql_update = 'UPDATE car_master set carNum=? ,phone=? where id=? ;';
                  var update_params = [data.carNum,data.phone,data.id];
                  querySQL(sql_update,update_params,function(rowsUP,fields){
                    //锁定二维码
                  updateQrcode(data.qrcodeId,response);
                  });
              }
          });
          }
        }  
    });
}
//用户修改手机号和车牌
function toExcuteUpdate(data,response){
    //查询--车主
    var sql_search = 'SELECT * FROM car_master where qrcodeId=? ;';
    var search_params = [data.qrcodeId];
    querySQL(sql_search,search_params,function(rows,fields){
        if(rows.length>0){
            var  sql_update = 'UPDATE car_master set carNum=? ,phone=? where id=? ;';
            var update_params = [data.carNum,data.phone,data.id];
            querySQL(sql_update,update_params,function(rows,fields){
                response.end('{"errcode":0,"msg":"ok"}');
            });
        }
    });
}
//用户删除
function toExcuteDel(id,response){
    //查询--车主
    var sql_search = 'SELECT * FROM car_master where id=? ;';
    var search_params = [id];
    querySQL(sql_search,search_params,function(rowsC,fields){
        if(rowsC.length>0){
            var  sql_update = 'UPDATE car_master set status=2 where id=? ;';
            var update_params = [id];
            querySQL(sql_update,update_params,function(rows,fields){
                var  sql_update_ = 'UPDATE qrcode set status=2 where id=? ;';
                var update_params_ = [rowsC[0].qrcodeId];
                querySQL(sql_update_,update_params_,function(rows,fields){
                    response.end('{"errcode":0,"msg":"ok"}');
                });
            });
        }
    });
}
//修改号码显示状态
function toExcutechangeStatus(data,response){
  var sql_update = 'UPDATE car_master set status=? where id=? ;';
  var update_params = [data.status,data.id];
  querySQL(sql_update,update_params,function(rows,fields){
    response.end('{"errcode":0,"msg":"ok"}');
  });
}
//获取我的所有车辆信息
function toExcuteData(data,response){
    //查询qrcodeId是客户扫码的时候获取车主信息时用的
    var sql_search = 'SELECT * FROM car_master where (openId=? or qrcodeId=?) and status!=2 order by remainTime desc;';
    var search_params = [data.openId,!data.qrcodeId?"":data.qrcodeId];
    console.log(sql_search);
    querySQL(sql_search,search_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: rows,total: rows.length})+'}');
    });
}
//获取警报管理员
function toExcuteGetManager(virtualNum){
    var sql_search = 'select * from manager where status=1;';
    querySQL(sql_search,[],function(rows,fields){
        if(rows.length>0){
          var phones = [];
          for (var i = 0; i < rows.length; i++) {
            phones.push(rows[i].phone);
          };
            if(virtualNum.length==11){
             virtualNum = virtualNum.substring(1,11);//因为短信只能最长发送10位，现在截取后十位
            }else if(virtualNum.length==13){
                virtualNum = virtualNum.substring(3,13);//因为短信只能最长发送10位，现在截取后十位
            }
          sendWarning(phones,virtualNum);
        }
    });
}
//用车牌号查询车主记录和虚拟号码----2
function toExcuteGetVirtualNum(phoneRows,response){
    //随机选择一条可用记录
    var sql_search_count = 'SELECT COUNT(*) as num FROM virtual_pools_aliyun WHERE status=0;';
    querySQL(sql_search_count,[],function(rowsC,fields){
        console.log(rowsC[0].num);
        if(rowsC[0].num>0){//有空闲虚拟号码
            var offset = Math.floor(Math.random()*rowsC[0].num);
            console.log(offset);
            var sql_search_offset = 'SELECT * FROM virtual_pools_aliyun WHERE status=0 LIMIT ?, 1;';
            var _params = [offset];
            querySQL(sql_search_offset,_params,function(rows,fields){
                if(rows.length>0){
                    console.log('to---设置',rows[0].id);
                    toExcuteUseVirtual(rows[0],phoneRows,response);
                }else{
                    response.end('{"errcode":30002,"msg":"'+phoneRows[0].carNum+'"}');
                }
            });
        }else{//虚拟号码已经用光了
            response.end('{"errcode":30002,"msg":"'+phoneRows[0].carNum+'"}');
        }
    });
}
//用二维码ID号查询车主记录和虚拟号码----1.5
function toGetVirtualNumByRedis(phoneRows,response){
    client.hgetall(phoneRows[0].openId+phoneRows[0].qrcodeId, function(err, object) {
        if(!object){//不存在
            toExcuteGetVirtualNum(phoneRows,response);
        }else{//已存在
            console.log(object.virtualNum);
            var sql_search_ = 'SELECT * FROM virtual_pools_aliyun WHERE status=1 and virtualNum=? ;';
            querySQL(sql_search_,[object.virtualNum],function(rows,fields){
                if(rows.length>0){//redis的号码没有失效，直接返回可用的之前的号码回去
                    phoneRows[0].phone = object.virtualNum;//把号码改成虚拟号码
                    response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: phoneRows,total: phoneRows.length})+'}');
                }else{
                    toExcuteGetVirtualNum(phoneRows,response);
                }
            });
        }
    });
}
//用二维码ID号查询车主记录和虚拟号码----1
function toExcuteGetPhoneByQrcodeId(qrcodeId,response){
    var sql_search = 'SELECT * FROM car_master where qrcodeId=? and status!=2;';
    var search_params = [qrcodeId];
    querySQL(sql_search,search_params,function(rows,fields){
        if(rows.length>0 && rows[0].status!=1){//非开启状态30001
            response.end('{"errcode":30001,"msg":"'+rows[0].carNum+'"}');
        }else{
            if(rows.length>0){
              console.log(rows[0].id,rows[0].phone);
                if(rows[0].remainTime>0){//还有费用获取虚拟号码
                    toGetVirtualNumByRedis(rows,response);
                }else{//没有费用了，要使用真实号码了
                    response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: rows,total: rows.length})+'}');
                }
            }else{//没有记录
                response.end('{"errcode":0,"msg":"not found","data":'+JSON.stringify({content: rows,total: rows.length})+'}');
            }
        }
    });
}
//虚拟号码设置成使用中----3
function toExcuteUseVirtual(virtualData,phoneRows,response){
  var sql_update = 'UPDATE virtual_pools_aliyun set status=1 where id=? ;';
  var update_params = [virtualData.id];
  querySQL(sql_update,update_params,function(rows,fields){
    console.log(virtualData.id,'设置成使用成功');
        bindPhone(phoneRows,virtualData.virtualNum,response);
  });
}
//虚拟号码放回虚拟池
function toExcuteBackVirtual(subsId,virtualNum){
  if(virtualNum.length==13){
    virtualNum = virtualNum.substring(2,13);//去掉前面的86
  }
  var sql_update = 'UPDATE virtual_pools_aliyun set status=0 where virtualNum=? and subsId=?;';
  var update_params = [virtualNum,subsId];
  querySQL(sql_update,update_params,function(rows,fields){
    console.log(virtualNum,'释放成功');
  });
}
//第三方提供的虚拟号码有问题，锁定为不可用
function toExcuteLockVirtual(virtualNum){
  if(virtualNum.length==13){
      virtualNum = virtualNum.substring(2,13);//去掉前面的86
  }
  var sql_update = 'UPDATE virtual_pools_aliyun set status=2 where virtualNum=? ;';
  var update_params = [virtualNum];
  querySQL(sql_update,update_params,function(rows,fields){
    console.log(virtualNum,'锁定成功');
  });
}
//把subsId设置到车主表，后面计算花费时有用
function setSubsId(phoneRows,subsId){
    var sql_update = 'UPDATE car_master set subsId=? where id=? ;';
    console.log(sql_update);
    console.log(subsId);
    console.log(phoneRows[0].id);
    var update_params = [subsId,phoneRows[0].id];
    querySQL(sql_update,update_params,function(rows,fields){
        console.log('setMasterSubsId--ok');
    });
    var sql_update1 = 'UPDATE virtual_pools_aliyun set subsId=? where virtualNum=? ;';
    console.log(sql_update1);
    var update_params1 = [subsId,phoneRows[0].phone];
    querySQL(sql_update1,update_params1,function(rows,fields){
        console.log('setVirtualSubsId--ok');
    });
}
//记录通话次数和时长，把异常使用的车主手机号禁用掉
function handleCarMaster(data){
  console.log(data);
  if(data.called.length==13){
    data.called = data.called.substring(2,13);
  }
  if(data.virtualNumber.length==13){
    data.virtualNumber = data.virtualNumber.substring(2,13);
  }
  console.log(data.called,data.virtualNumber);
  var sql_search = 'SELECT * FROM car_master where phone=? and subsId=?;';
  var search_params = [data.called,data.callIdentifier];
  querySQL(sql_search,search_params,function(rows_,fields_){
    console.log(sql_search);
    console.log(rows_[0]);
    if(rows_.length<=0){
      console.log('{"errcode":0,"msg":"查不到车主记录"}');
      return;
    }
    data.times = rows_[0].times+1;
    data.allCallDuration = rows_[0].allCallDuration+parseInt(data.duration);
    data.remainTime = rows_[0].remainTime-parseInt(data.duration);
    if(data.remainTime<=0){//通话费用用完了，发短信提醒车主
      console.log("通话费用用完了，发短信提醒车主")
      send_Warning([data.called]);
    }
    data.status = rows_[0].status;
    data.id = rows_[0].id;
    /*if(data.duration>180||rows_[0].timesPerMonth>15){//如果单次通话时间超过180秒或者每月通话次数超过15次则判定为异常通话
      data.status = 2;
    }*/
    var sql_update = 'UPDATE car_master set status=?,lastCallTime=?,times=?,lastCallDuration=?,allCallDuration=?,virtualNum=?,timesPerMonth=?,perSumStartTime=?,remainTime=? where id=? ;';
    var update_params = [data.status,data.timestamp,data.times,data.duration,data.allCallDuration,null,1,new Date().toLocaleString(),data.remainTime,data.id];
    if(!!rows_[0].perSumStartTime&&(new Date().getTime()-new Date(rows_[0].perSumStartTime).getTime())<30*24*60*60*1000){//不超过了一个月
      sql_update = 'UPDATE car_master set status=?,lastCallTime=?,times=?,lastCallDuration=?,allCallDuration=?,virtualNum=?,timesPerMonth=?,remainTime=? where id=? ;';
      update_params = [data.status,data.timestamp,data.times,data.duration,data.allCallDuration,null,rows_[0].timesPerMonth+1,data.remainTime,data.id];
    }
    querySQL(sql_update,update_params,function(rows,fields){
      console.log('{"errcode":0,"msg":"ok"}');
    });
  });
}
//插入通话记录
function handleRecord(data){
  var sql_update = 'INSERT INTO callrecord(calling,called,virtualNumber,callIdentifier,timestart,timestamp,createTime,duration) VALUES (?,?,?,?,?,?,?,?) ;';
  var update_params = [data.calling,data.called,data.virtualNumber,data.callIdentifier,data.timestart,data.timestamp,new Date().toLocaleString(),data.duration];
  querySQL(sql_update,update_params,function(rows,fields){
    console.log('插入通话记录成功');
  });
}
//挂断时检测虚拟号是否已经回收，没有回收立即回收
function getBackVirtualNumNow(subsId,virtualNum){
  console.log("free--------------from----------------------jianting");
    if(virtualNum.length==13){
        virtualNum = virtualNum.substring(2,13);//去掉前面的86
    }
    var sql_search = 'select * from virtual_pools_aliyun where virtualNum=? ;';
    querySQL(sql_search,[virtualNum],function(rows,fields){
        if(rows[0].status==1){//获取了虚拟号但是还在占用，所以要回收
            freePhone(subsId,virtualNum);//绑定关系ID和绑定虚拟号
        }
    });
}
//为防止长期占用虚拟号，加一个好吗回收机制。
//(3min后第三方供应商已经自动释放了虚拟号，所以只需要释放数据库就行了)
function getBackVirtualNum_(subsId,virtualNum){
    setTimeout(function(){
      console.log("free--------------from----------------------3minlater");
        if(virtualNum.length==13){
            virtualNum = virtualNum.substring(2,13);//去掉前面的86
        }
        toExcuteBackVirtual(subsId,virtualNum);
    },180000);
}
//查询该手机号是否加入到了白名单中，是则可免短信验证注册
function toExcuteSearchWhiteList(data,response,type){
    var sql_search = 'SELECT * FROM whiteList where phone=? and status=1;';
    var search_params = [data.phone];
    querySQL(sql_search,search_params,function(rows,fields){
        if(!rows || !rows.length){//不在白名单中
            response.end('{"errcode":50000,"msg":"验证码不正确，请重新获取"}');
        }else{//在白名单中
            if(type==1){//新增
                toExcuteAdd(data,response);
            }else{//修改
                toExcuteUpdate(data,response);
            }
        }
    });
}
var express = require('express');
var app = express();
var multipart = require('connect-multiparty'); //在处理模块中引入第三方解析模块 
var multipartMiddleware = multipart();
// charset=utf-8 解决json数据中中文乱码
app.use("*", function(req, res, next) {
    res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" });
    next();
});
app.get('/carNum/process_get', function (req, res) {
  console.log('get');
   // 输出 JSON 格式
   var response = {
       "name":req.query.name
   };
   console.log(response);
   res.end(JSON.stringify(response));
});
var bodyParser = require('body-parser');
// var urlencodedParser = bodyParser.urlencoded({ extended: false });//parse application/x-www-form-urlencoded
var urlencodedParser = bodyParser.json();// parse application/json
app.post('/carNum/getOpenId',urlencodedParser,function (req, res) {
    if(!req.body.code){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        getOpenId(req.body.code,res);
    }
});
app.post('/carNum/sendCode',urlencodedParser,function (req, res) {
    if(!req.body.openId || !req.body.phone){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        sendCode(req.body,res);
    }
});
app.post('/carNum/checkCarNum',urlencodedParser,function (req, res) {
    if(!req.body.carNum && !req.body.openId){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        checkCarNum(req.body,res);
    }
});
app.post('/carNum/regist',urlencodedParser,function (req, res) {
    client.hgetall(req.body.openId, function(err, object) {
        if(!object){//不存在
            toExcuteSearchWhiteList(req.body,res,1);
        }else{//已存在
            // var authCode = JSON.parse(object).obj;
            var authCode = object.obj;
            console.log(authCode);
            if(authCode==req.body.authCode && req.body.phone==object.phone){//验证码正确
                client.expire(req.body.openId, 1);//把验证码从redis清除掉,单位是秒
                toExcuteAdd(req.body,res);
            }else{
                toExcuteSearchWhiteList(req.body,res,1);
            }
        }
    });
});
app.post('/carNum/update',urlencodedParser,function (req, res) {
    client.hgetall(req.body.openId, function(err, object) {
        if(!object){//不存在
            toExcuteSearchWhiteList(req.body,res,2);
        }else{//已存在
            // var authCode = JSON.parse(object).obj;
            var authCode = object.obj;
            console.log(authCode);
            if(authCode==req.body.authCode && req.body.phone==object.phone){//验证码正确
                client.expire(req.body.openId, 1);//把验证码从redis清除掉,单位是秒
                toExcuteUpdate(req.body,res);
            }else{
                toExcuteSearchWhiteList(req.body,res,2);
            }
        }
    });
});
app.post('/carNum/del',urlencodedParser,function (req, res) {
    if(!!req.body.id){
        toExcuteDel(req.body.id,res);
    }else{
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }
});
app.post('/carNum/getData',urlencodedParser,function (req, res) {
    if(!req.body.openId){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcuteData(req.body,res);
    }
});
app.post('/carNum/changeStatus',urlencodedParser,function (req, res) {
    if(!req.body.id || !req.body.status&&req.body.status!=0){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcutechangeStatus(req.body,res);
    }
});
app.post('/carNum/getWXPhone',urlencodedParser,function (req, res) {
    if(!req.body.encryptedData || !req.body.iv){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        if(!!req.body.code){
            getOpenId(req.body.code,res,req.body.encryptedData,req.body.iv);
        }else{
            analysisPhone(res,req.body.sessionKey,req.body.encryptedData,req.body.iv);
        }
    }
});
app.post('/carNum/getvirtualNumByQrcodeId',urlencodedParser,function (req, res) {
    if(!req.body.qrcodeId){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcuteGetPhoneByQrcodeId(req.body.qrcodeId,res);
    }
});
var server = app.listen(8888, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
