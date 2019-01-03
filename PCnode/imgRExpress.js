//errcode: 0--ok,50000--error,30006--用户已存在,30007--未登录,30008--部分解绑失败
var redis = require("redis");
var client = redis.createClient(6379,"127.0.0.1");
client.on('error',function(error){
   console.log(error);
});
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 100,//连接池数
    host      : 'localhost',
    user      : 'root',
    password    : 'zaofeng1234',//本地是123456
    database    : 'carnumber'
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
//删除使用用户 1位开启，0为关闭，2为注销~~~~~~~~~~~~~~~~~~~~~
function toExcuteDelCarMaster(id,response){
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
//查询使用用户-翻页
function toExcuteQueryCarMaster(data,response){//currentPage从1开始
    var sql_searchAll = 'SELECT id FROM car_master where 1=1';
    if(typeof data.status!="undefined" && typeof data.status!="object" && data.status!=null){
        sql_searchAll+=" and status="+data.status;
    }
    if(!!data.keyword){
        sql_searchAll+=" and phone="+data.keyword+" or carNum="+data.keyword;
    }
    sql_searchAll+= ' ORDER BY id DESC;';
    querySQL(sql_searchAll,[],function(rowsAll,fields){
        if(rowsAll.length>0){
            var start = (data.currentPage-1)*data.pageSize;
            var end = data.currentPage*data.pageSize;
            var currentIdsObj = rowsAll.slice(start,end);
            if(currentIdsObj.length==0){
                response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: [],total: rowsAll.length,pageSize:data.pageSize,currentPage:data.currentPage})+'}');
            }else{
                var currentIds = [];
                for (var i = 0; i < currentIdsObj.length; i++) {
                    currentIds.push(currentIdsObj[i].id);
                };
                var sql_search = 'SELECT * FROM car_master where id in(?) ORDER BY id DESC;';
                querySQL(sql_search,[currentIds],function(rows,fields){
                    response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: rows,total: rowsAll.length,pageSize:data.pageSize,currentPage:data.currentPage})+'}');
                });
            }
        }else{
            response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: [],total: 0,pageSize:data.pageSize,currentPage:data.currentPage})+'}');
        } 
    });
}
//查询统计数据
function toExcuteQuerytotalNum(response){
    var sql_searchAllCM = 'SELECT count(id) as total  FROM car_master;';
    querySQL(sql_searchAllCM,[],function(rowsCM,fields){
        var total_CM = rowsCM[0].total;
        var sql_searchAllC = 'SELECT count(id) as total,SUM(duration) as time  FROM callrecord where DATE_FORMAT(createTime,"%Y-%m-%d")>=DATE_FORMAT("2018-12-17","%Y-%m-%d" );';
        querySQL(sql_searchAllC,[],function(rowsC,fields){
            var total_C = rowsC[0].total;
            var time = Math.ceil((rowsC[0].time-181)/60)+8;//减去181是因为181s不是供应商阿里云的费用，是上一个供应商融营的费用,8分钟是线下开发使用的时间
            var sql_searchAllQ = 'SELECT count(id) as total  FROM qrcode;';
            querySQL(sql_searchAllQ,[],function(rowsQ,fields){
                var total_Q = rowsQ[0].total;
                response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({userNum: total_CM,callNum: total_C,timeNum:time,codeNum:total_Q})+'}');
            });
        });
    });
}
//获取一分钟内的最大请求并发数
function toGetMaxConcurrency(response){
    console.log("toGetMaxConcurrency");
    // var sql_double = 'select time,max(num) maxNum from () as b;';
    var sql_double = 'SELECT a.time,COUNT(*) as num FROM (SELECT DATE_FORMAT(concat(date(createTime)," ",HOUR(createTime),":",floor(MINUTE(createTime)/3)*3),"%Y-%m-%d %H:%i") AS time FROM callrecord) as a  GROUP BY a.time HAVING COUNT(*)>4 ORDER BY COUNT(*) DESC,a.time DESC ;';
    querySQL(sql_double,[],function(rows,fields){
        response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({theTime: rows[0].time,maxNum: rows[0].num})+'}');
    });
}
//查询指定日期数据
function toExcuteQueryDayNum(data,response){
    // var sql_searchCM = 'SELECT count(id) as total  FROM car_master where createTime like ?;';["%"+data.day+"%"]
    var sql_searchCM = 'SELECT count(id) as total  FROM car_master where DATE_FORMAT(createTime,"%Y-%m-%d")>=DATE_FORMAT(?,"%Y-%m-%d" );';
    querySQL(sql_searchCM,[data.day],function(rowsCM,fields){
        var day_CM = rowsCM[0].total;
        var sql_searchC = 'SELECT count(id) as total  FROM callrecord where DATE_FORMAT(createTime,"%Y-%m-%d")>=DATE_FORMAT(?,"%Y-%m-%d" );';
        querySQL(sql_searchC,[data.day],function(rowsC,fields){
            var day_C = rowsC[0].total;
            response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({userNumDay: day_CM,callNumDay: day_C})+'}');
        });
    });
}
//查询指定日期期间数据
function toExcuteQueryDaysList(data,response){
    var sql_searchCM = 'select DATE_FORMAT(createTime,"%Y-%m-%d") as time,count(id) count from car_master where DATE_FORMAT(createTime,"%Y-%m-%d")>DATE_FORMAT(?,"%Y-%m-%d") group by time;';
    querySQL(sql_searchCM,[data.day],function(rowsCM,fields){
        var sql_searchC = 'select DATE_FORMAT(createTime,"%Y-%m-%d") as time,count(id) count from callrecord where DATE_FORMAT(createTime,"%Y-%m-%d")>DATE_FORMAT(?,"%Y-%m-%d") group by time;';
        querySQL(sql_searchC,[data.day],function(rowsC,fields){
            response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({userList: rowsCM,callList: rowsC})+'}');
        });
    });
}
//查询使用用户-phone
function toExcuteQueryCarMasterByPhone(phone,response){
    var sql_search = 'SELECT * FROM car_master where phone like ?;';
    var search_params = [phone];
    querySQL(sql_search,search_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: rows})+'}');
    });
}
//-------------------------------------------carmaster----end----------------------------------------------------
//添加二维码 1为已使用，0为未使用，2为注销~~~~~~~~~~~~~~~~~~~~~~~~~~~
function toExcuteAQrcode(response){
    var  sql_add = 'INSERT INTO qrcode(status,createTime) VALUES (?,?) ;';
    var add_params = [0,new Date().toLocaleString()];
    querySQL(sql_add,add_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok"}');
    });
}
function toExcutesearchCarMByQrcode(qrcodeId,response){
    var  sql_search = 'SELECT * FROM car_master where qrcodeId=?;';
    console.log(qrcodeId);
    querySQL(sql_search,[qrcodeId],function(rows,fields){
        response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: rows,total: rows.length})+'}');
    });
}
//-------------------------------------------qrcode----end----------------------------------------------------
//往管理员添加号码--超级管理员 1为使用中，0为注销~~~~~~~~~~~~~~~~~~~~~~~~~~
function toExcuteAddManager(data,response){
    var sql_add = 'INSERT INTO manager(phone,password,status,createTime) VALUES (?,?,?,?)';
    var add_params = [data.phone,data.password,1,new Date().toLocaleString()];
    querySQL(sql_add,add_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok"}');
    });
}
//-------------------------------------------manager----end----------------------------------------------------
//往虚拟池添加虚拟号码 1为使用中，0为闲置中，2为号码有问题-锁定中~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function toExcuteAddPools(virtualNum,response){
    var sql_search = 'SELECT * FROM virtual_pools_aliyun where virtualNum=?;';
    var search_params = [virtualNum];
    querySQL(sql_search,search_params,function(rows,fields){
        if(rows.length>0){
            response.end('{"errcode":30006,"msg":"'+virtualNum+'-该小号已存在"}');
        }else{
            var sql_add = 'INSERT INTO virtual_pools_aliyun(virtualNum,status,createTime) VALUES (?,?,?);';
            var add_params = [virtualNum,0,new Date().toLocaleString()];
            querySQL(sql_add,add_params,function(rows,fields){
                response.end('{"errcode":0,"msg":"ok"}');
            });
        }
    });
}
//修改虚拟池中的虚拟号码
function toExcuteUpdatePools(data,response){
    var sql_update = 'UPDATE virtual_pools_aliyun set virtualNum=? where id=? ;';
    var update_params = [data.virtualNum,data.id];
    querySQL(sql_update,update_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok"}');
    });
}
//查询虚拟池中的虚拟号码
function toExcuteQueryPools(data,response){
    var sql_search = 'SELECT * FROM virtual_pools_aliyun WHERE 1=1';
    var search_params = [];
    if(!!data.virtualNum){
        search_params.push("%"+data.virtualNum+"%");
        sql_search = sql_search+' and virtualNum like ?';
    }
    if(data.status!=null&&data.status!=undefined){
        search_params.push(data.status);
        sql_search = sql_search+' and status=?';
    }
    sql_search = sql_search+' ;';
    querySQL(sql_search,search_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: rows,total: rows.length})+'}');
    });
}
//锁定虚拟池中的虚拟号码
function toExcuteLockPools(pools,response){
    var sql_update = 'UPDATE virtual_pools_aliyun set status=2 where id in(?);';
    var update_params = [];
    for (var i = 0; i < pools.length; i++) {
        update_params.push(pools[i].id);
    };
    querySQL(sql_update,update_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok"}');
    });
}
//解锁虚拟池中的虚拟号码
function toExcuteFreePools(pools,response){
    var sql_update = 'UPDATE virtual_pools_aliyun set status=0 where id in(?);';
    var update_params = [];
    for (var i = 0; i < pools.length; i++) {
        update_params.push(pools[i].id);
    };
    querySQL(sql_update,update_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok"}');
    });
}
//-------------------------------------------virtualpools----end----------------------------------------------------
//添加白名单  1-有效，0-无效，2-删除~~~~~~~~~~~~~~~~~~~~~~
function toExcuteAddWhiteList(data,response){
    var sql_search = 'SELECT * FROM whiteList where phone=?;';
    var search_params = [data.phone];
    querySQL(sql_search,search_params,function(rows,fields){
        if(rows.length>0){
            if(rows[0].status==2){
                var sql_update = 'UPDATE whiteList SET phone=?,status=?,reason=?,createTime=? where id=?;';
                var update_params = [data.phone,1,data.reason,new Date().toLocaleString(),rows[0].id];
                querySQL(sql_update,update_params,function(rows,fields){
                    response.end('{"errcode":0,"msg":"ok"}');
                });
            }else{
                response.end('{"errcode":30006,"msg":"'+data.phone+'-该用户已存在"}');
            }
        }else{
            var sql_add = 'INSERT INTO whiteList(phone,status,reason,createTime) VALUES (?,?,?,?);';
            var add_params = [data.phone,1,data.reason,new Date().toLocaleString()];
            querySQL(sql_add,add_params,function(rows,fields){
                response.end('{"errcode":0,"msg":"ok"}');
            });
        }
    });
}
//修改白名单
function toExcuteUpdateWhiteList(data,response){
    var sql_update = 'UPDATE whiteList SET phone=?,status=?,reason=? where id=?;';
    var update_params = [data.phone,data.status,data.reason,data.id];
    querySQL(sql_update,update_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok"}');
    });
}
//删除白名单
function toExcuteDelWhiteList(id,response){
    var sql_del = 'UPDATE whiteList SET status=2 where id=?;';
    var del_params = [id];
    querySQL(sql_del,del_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok"}');
    });
}
//查询白名单
function toExcuteQueryWhiteList(phone,response){
    var sql_search = 'SELECT * FROM whiteList where phone like ? and status!=2;';
    var search_params = ["%"+phone+"%"];
    querySQL(sql_search,search_params,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: rows,total: rows.length})+'}');
    });
}
//-------------------------------------------whiteList----end----------------------------------------------------
//添加后台商家管理员  1-使用中，0-已删除~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function toExcuteAddBusiness(data,response){
    var sql_search = 'SELECT * FROM business where phone=?;';
    var search_params = [data.phone];
    querySQL(sql_search,search_params,function(rows,fields){
        if(rows.length>0){
            if(rows[0].status==1){
                response.end('{"errcode":30006,"msg":"'+data.phone+'-该用户已存在"}');
            }else{
                var sql_update = 'UPDATE business SET name=?, phone=?,password=?,status=?,reason=?,createTime=? where id=?;';
                var update_params = [data.name,data.phone,data.password,1,data.reason,new Date().toLocaleString(),rows[0].id];
                querySQL(sql_update,update_params,function(rows,fields){
                    response.end('{"errcode":0,"msg":"ok"}');
                });
            }
        }else{
            var sql_add = 'INSERT INTO business(name,phone,password,status,reason,createTime) VALUES (?,?,?,?,?,?);';
            var add_params = [data.name,data.phone,data.password,1,data.reason,new Date().toLocaleString()];
            querySQL(sql_add,add_params,function(rows,fields){
                response.end('{"errcode":0,"msg":"ok"}');
            });
        }
    });
}
//修改后台商家管理员
function toExcuteUpdateBusiness(data,response){
    var sql_update = 'UPDATE business SET name=?,phone=?,password=?,status=?,reason=? where id=?;';
    var search_update = [data.name,data.phone,data.password,data.status,data.reason,data.id];
    querySQL(sql_update,search_update,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok"}');
    });
}
//删除后台商家管理员
function toExcuteDelBusiness(id,response){
    var sql_del = 'UPDATE business SET status=0 where id=?;';
    var search_del = [id];
    querySQL(sql_del,search_del,function(rows,fields){
        response.end('{"errcode":0,"msg":"ok"}');
    });
}
//查询商家管理员
function toExcuteQueryBusiness(phone,response){
    var sql_search = 'SELECT * FROM business where status!=0';
    var search_params = [];
    if(!!phone){
        search_params = ["%"+phone+"%"];
        sql_search +=' and phone like ?';
    }
    sql_search +=' ;';
    querySQL(sql_search,search_params,function(rows,fields){
        var userData = {};
        if(rows.length>0){
            userData.name = rows[0].name;
            userData.phone = rows[0].phone;
            userData.reason = rows[0].reason;
            userData.createTime = rows[0].createTime;
            userData.auth = !rows[0].superId?0:1;
        }
        if(!!phone){
            response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({userData: userData})+'}');
        }else{
            response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: rows,total: rows.length,pageSize:1000,currentPage:1})+'}');
        }
    });
}
/*
** randomWord 产生任意长度随机字母数字组合
** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
*/
function randomWord(randomFlag, min, max){
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
 
    // 随机产生
    if(randomFlag){
        range = Math.round(Math.random() * (max-min)) + min;
    }
    for(var i=0; i<range; i++){
        pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
    return str;
}
function toLogin(data,response){
    var sql_search = 'SELECT * FROM business where phone=? and password=?;';
    var search_params = [data.phone,data.password];
    querySQL(sql_search,search_params,function(rows,fields){
        if(rows.length>0){
            var validTime = 7*24*60*60;//单位是秒---有效期七天
            var theToken = randomWord(false,32);
            client.hmset(data.phone+"sessionId", { token: theToken}, function(err) {
                if(err){
                    throw err;
                }
                response.end('{"errcode":0,"msg":"ok","data":{"token":"'+theToken+'"}}');
            });
            client.expire(data.phone+"sessionId", parseInt(validTime));
        }else{
            response.end('{"errcode":50000,"msg":"用户名或密码不正确"}');
        }
    });
}
//-------------------------------------------business----end----------------------------------------------------
//查询使用记录-翻页
function toExcuteQueryCallRecord(data,response){//currentPage从1开始
    var sql_searchAll = 'SELECT id FROM callrecord where 1=1 and DATE_FORMAT(createTime,"%Y-%m-%d")>=DATE_FORMAT("2018-12-17","%Y-%m-%d" )'
    var params = [];
    if(!!data.keyword){
        sql_searchAll+=" and called like ?";
        params = ["%"+data.keyword+"%"];
    }
    sql_searchAll+= ' ORDER BY id DESC;'
    querySQL(sql_searchAll,params,function(rowsAll,fields){
        if(rowsAll.length>0){
            var start = (data.currentPage-1)*data.pageSize;
            var end = data.currentPage*data.pageSize;
            var currentIdsObj = rowsAll.slice(start,end);
            if(currentIdsObj.length==0){
                response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: [],total: rowsAll.length,pageSize:data.pageSize,currentPage:data.currentPage})+'}');
            }else{
                var currentIds = [];
                for (var i = 0; i < currentIdsObj.length; i++) {
                    currentIds.push(currentIdsObj[i].id);
                };
                var sql_search = 'SELECT * FROM callrecord where id in(?) ORDER BY id DESC;';
                querySQL(sql_search,[currentIds],function(rows,fields){
                    response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: rows,total: rowsAll.length,pageSize:data.pageSize,currentPage:data.currentPage})+'}');
                });
            }
        }else{
            response.end('{"errcode":0,"msg":"ok","data":'+JSON.stringify({content: [],total: 0,pageSize:data.pageSize,currentPage:data.currentPage})+'}');
        } 
    });
}
var express = require('express');
var cookie = require('cookie-parser')
var app = express();
app.use(cookie());
var multipart = require('connect-multiparty'); //在处理模块中引入第三方解析模块 
var multipartMiddleware = multipart();
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use("*", function(req, res, next) {
    console.log(req.originalUrl);
    res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" });// charset=utf-8 解决json数据中中文乱码
    console.log(req.cookies.sessionName);
    console.log(req.cookies.sessionId);
    if(req.originalUrl=="/carNumManager/login"){
        next();
    }else{
        if(!!req.cookies.sessionName && !!req.cookies.sessionId){
            client.hgetall(req.cookies.sessionName+"sessionId", function(err, object) {
                if(!object){//不存在
                    res.end('{"errcode":30007,"msg":"未登录"}');
                }else{//已存在
                    if(object.token==req.cookies.sessionId){
                        next();
                    }else{
                        res.end('{"errcode":30007,"msg":"未登录"}');
                    }
                }
            });
        }else{
            res.end('{"errcode":30007,"msg":"未登录"}');
        }
    }
});
app.get('/carNumManager/process_get', function (req, res) {
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

app.post('/carNumManager/queryCallRecord',urlencodedParser,function (req, res) {
    toExcuteQueryCallRecord(req.body,res);
});
app.post('/carNumManager/addBUser',urlencodedParser,function (req, res) {
    toExcuteAddBusiness(req.body,res);
});
app.post('/carNumManager/updateBUser',urlencodedParser,function (req, res) {
    toExcuteUpdateBusiness(req.body,res);
});
app.post('/carNumManager/delBusiness',urlencodedParser,function (req, res) {
    if(!req.body.id){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcuteDelBusiness(req.body.id,res);
    }
});
app.post('/carNumManager/queryBusiness',urlencodedParser,function (req, res) {
    toExcuteQueryBusiness(null,res);
});
app.post('/carNumManager/login',urlencodedParser,function (req, res) {
    if(!req.body.phone||!req.body.password){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toLogin(req.body,res);
    }
});
app.post('/carNumManager/logout',urlencodedParser,function (req, res) {
    client.hgetall(req.cookies.sessionName+"sessionId", function(err, object) {
        if(!object){//不存在
            res.end('{"errcode":30007,"msg":"未登录"}');
        }else{//已存在
            if(object.token==req.cookies.sessionId){
                client.expire(req.cookies.sessionName+"sessionId", 1);//把验证码从redis清除掉,单位是秒
                res.end('{"errcode":30007,"msg":"未登录"}');
            }else{
                res.end('{"errcode":30007,"msg":"未登录"}');
            }
        }
    });
});
app.post('/carNumManager/getMyData',urlencodedParser,function (req, res) {
    toExcuteQueryBusiness(req.cookies.sessionName,res);
});
app.post('/carNumManager/queryCarMaster',urlencodedParser,function (req, res) {
    toExcuteQueryCarMaster(req.body,res);
});
app.post('/carNumManager/queryTotalNum',urlencodedParser,function (req, res) {
    toExcuteQuerytotalNum(res);
});
app.post('/carNumManager/queryMaxConcurrency',urlencodedParser,function (req, res) {
    toGetMaxConcurrency(res);
});
app.post('/carNumManager/queryDayNum',urlencodedParser,function (req, res) {
    toExcuteQueryDayNum(req.body,res);
});
app.post('/carNumManager/queryDaysList',urlencodedParser,function (req, res) {
    toExcuteQueryDaysList(req.body,res);
});
app.post('/carNumManager/queryCarMasterByPhone',urlencodedParser,function (req, res) {
    toExcuteQueryCarMasterByPhone(req.body.phone,res);
});
app.post('/carNumManager/AddQrcode',urlencodedParser,function (req, res) {
    toExcuteAQrcode(res);
});
app.post('/carNumManager/searchCarMByQrcode',urlencodedParser,function (req, res) {
    if(!req.body.qrcodeId){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcutesearchCarMByQrcode(req.body.qrcodeId,res);
    }
});
app.post('/carNumManager/AddManager',urlencodedParser,function (req, res) {
    if(!req.body.phone || !req.body.password){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcuteAddManager(req.body.virtualNum,res);
    }
});
app.post('/carNumManager/AddPools',urlencodedParser,function (req, res) {
    if(!req.body.virtualNum){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
    	toExcuteAddPools(req.body.virtualNum,res);
    }
});
app.post('/carNumManager/updatePools',urlencodedParser,function (req, res) {
    if(!req.body.virtualNum||!req.body.id){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcuteUpdatePools(req.body,res);
    }
});
app.post('/carNumManager/lockPools',urlencodedParser,function (req, res) {
    if(!req.body.pools||req.body.pools.length==0){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcuteLockPools(req.body.pools,res);
    }
});
app.post('/carNumManager/freePools',urlencodedParser,function (req, res) {
    if(!req.body.pools||req.body.pools.length==0){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcuteFreePools(req.body.pools,res);
    }
});
app.post('/carNumManager/queryPools',urlencodedParser,function (req, res) {
    toExcuteQueryPools(req.body,res);
});
app.post('/carNumManager/AddWhiteList',urlencodedParser,function (req, res) {
    if(!req.body.phone){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcuteAddWhiteList(req.body,res);
    }
});
app.post('/carNumManager/updateWhiteList',urlencodedParser,function (req, res) {
    if(!req.body.phone||!req.body.id){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcuteUpdateWhiteList(req.body,res);
    }
});
app.post('/carNumManager/delWhiteList',urlencodedParser,function (req, res) {
    if(!req.body.id){
        res.end('{"errcode":50000,"msg":"参数不能为空"}');
    }else{
        toExcuteDelWhiteList(req.body.id,res);
    }
});
app.post('/carNumManager/queryWhiteList',urlencodedParser,function (req, res) {
    if(!req.body.phone){
        toExcuteQueryWhiteList("",res);
    }else{
        toExcuteQueryWhiteList(req.body.phone,res);
    }
});
var server = app.listen(8868, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("应用实例，访问地址为 http://%s:%s", host, port);
});
