//小程序码目前已经用到了10620
function CompareDate(d1,d2)
{
  return ((new Date(d1.replace(/-/g,"\/"))) > (new Date(d2.replace(/-/g,"\/"))));
}

var charset = require('superagent-charset');
var superagent = charset(require('superagent'));
var params = {
	"access_token": "********",
	"APPID": "*********"
}
var readline = require('readline');
var fs = require('fs');
function getQRCode(start,end){
	var temp = {
		"page":"pages/manage/registe",
		"scene": start,
		"is_hyaline":true,
  		"width":1280 //最大值是1280px
	};
    superagent
        .post('https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token='+params.access_token)
        .type('json')
        .send(temp)
        .set('Content-Type', 'application/json;charset=utf-8')
        .end(function(err,res){
            if(err){
                console.log(err);
            }
            if (res.ok) {
            	// console.log('yay got bind ' + JSON.stringify(res.body));
                // console.log(res.body);
               //  start++;
               // if(start<=end){
               // 	console.log(start);
               // 	getQRCode(start,end);
               // }else{
               // 	console.log('全部写完');
               // }
		        fs.writeFile('./movecar/ct11/ct'+temp.scene+'.png',res.body,function(err){//用fs写入文件
		            if(err){
		                console.log(err);
		            }else{
		               console.log('写入成功！',start);
		            }
		        });
            } else {
                console.log('Oh no! error ' + res.text);
            }
        });
}
// getQRCode(30865);
// return;
/*for (var i = 35621; i <= 36000; i++) {//已经排到了  36000
	getQRCode(i);
};
return;*/
// getQRCode(7171,5100);//可行的调用方法，但是太慢了----已经排到了 5100
// return;
function getAccessToken(){
	superagent
        .get('https://api.weixin.qq.com/cgi-bin/token')
        .query({'grant_type':'client_credential','appid':'******','secret':'******'})
        .end(function(err,res){
            if(err){
                console.log(err);
            }
            if (res.ok) {
            	// console.log('yay got bind ' + JSON.stringify(res.body));
                console.log(res.body);
            } else {
                console.log('Oh no! error ' + res.text);
            }
        });
}
//往数据库插入二维码
function addQrcode(start,end){
    superagent
        .post('https://www.xccnet.com/test2/carNum/AddQrcode')
        .type('json')
        .set('Content-Type', 'application/json;charset=utf-8')
        .end(function(err,res){
            if(err){
                console.log(err);
            }
            if (res.ok) {
            	// console.log('yay got bind ' + JSON.stringify(res.body));
                console.log(res.body,start);
                if(res.body.errcode==0){
                	if(start<end){
			            addQrcode(start+1,end);
			        }else{
			            console.log('end');
			        }
                }
            } else {
                console.log('Oh no! error ' + res.text);
            }
        });
}
// addQrcode(5001,5100);//目前生成到了5100
// return;
//往数据库插入虚拟号
function addPools(virtualNum){
	var temp = {
		"virtualNum": virtualNum
	};
    superagent
        .post('https://www.xccnet.com/test2/carNum/AddPools')
        .type('json')
        .send(temp)
        .set('Content-Type', 'application/json;charset=utf-8')
        .end(function(err,res){
            if(err){
                console.log(err);
            }
            if (res.ok) {
            	// console.log('yay got bind ' + JSON.stringify(res.body));
                console.log(res.body);
            } else {
                console.log('Oh no! error ' + res.text);
            }
        });
}
//修改数据库虚拟号
function updatePools(data){
	var temp = {
		"virtualNum": data.virtualNum,
		"status": !data.status?0:data.status,
		"id": data.id,
	};
    superagent
        .post('https://www.xccnet.com/test2/carNum/updatePools')
        .type('json')
        .send(temp)
        .set('Content-Type', 'application/json;charset=utf-8')
        .end(function(err,res){
            if(err){
                console.log(err);
            }
            if (res.ok) {
            	// console.log('yay got bind ' + JSON.stringify(res.body));
                console.log(res.body);
            } else {
                console.log('Oh no! error ' + res.text);
            }
        });
}
var xlsx = require('node-xlsx');
//解析excel表格
function analysisExcel(){
	//读取文件内容
	var obj = xlsx.parse(__dirname+'\\movecar\\number.xlsx');//配置excel文件的路径
	var excelObj=obj[0].data;//excelObj是excel文件里第一个sheet文档的数据，obj[i].data表示excel文件第i+1个sheet文档的全部内容
	// console.log(excelObj);
	console.log("总共数量",excelObj.length-1);
	//一个sheet文档中的内容包含sheet表头 一个excelObj表示一个二维数组，excelObj[i]表示sheet文档中第i+1行的数据集（一行的数据也是数组形式，访问从索引0开始）
	var data = [];
	for(var i in excelObj){
	    var arr=[];
	    var value=excelObj[i];
	    for(var j in value){
	        arr.push(value[j]);
	        if((typeof value[j])=='number'){
				// console.log(value[j]);
				data.push(arr);
				/////
	        }else{
	        	console.log(typeof value[j]);
	        }
	    }
	}
	return data;
}
var gm = require('gm');
var path = './movecar/158';
function imgHandle(){
	gm('./movecar/car.jpg')
		.size(function(err,size){
			if(!err){
				console.log(1);
				console.log(size);
				console.log(size.width,size.height);
			}else{
				console.log('some error!!');
			}
		})
		// .composite('./movecar/car.png')
		.composite('./movecar/2.png')
		.gravity("SouthEast")
		.write('./movecar/car_4.jpg',function(err){
			if(!err){
				console.log('success!');
			}else{
				console.log(err);
				console.log('error!');
			}
		})
}
function imgHandleCode(num){
	gm('./movecar/800/ct'+num+'.png')
		.composite('./movecar/bgcircle.png')
		.gravity("SouthEast")
		.write('./movecar/800_re/'+num+'.png',function(err){
			if(!err){
				console.log('success!');
			}else{
				console.log(err);
				console.log('error!');
			}
		})
}
function changeSize(start,end){//
	gm('./movecar/ct6/ct'+start+'.png')
		.resize(158.74, 158.74)
		.write(path+'/'+start+'.png',function(err){
			if(!err){
				start++;
				console.log(start)
				if(start<=end){
					changeSize(start,end);
				}
			}else{
				console.log(err);
			}
		})
}
function testPoint(){
	gm('./movecar/car.jpg')
		.composite(path+'/ct.png')
		.gravity('NorthWest')
		.geometry(`+240+1835`)
		.write('./movecar/car_1.jpg',function(err){
			if(!err){
				gm('./movecar/car_1.jpg')
					.composite('./movecar/car.png')
					.gravity("SouthEast")
					.write('./movecar/car_test.jpg',function(err){
						if(!err){
							console.log('success!');
							fs.unlink('./movecar/car_1.jpg');
						}else{
							console.log(err);
							console.log('error!result');
						}
					})
			}else{
				console.log(err);
				console.log('error!');
			}
		})
}
function imgGMFont(num){
	gm('./movecar/pdfinfo.png')
		.font('./准圆简.ttf')
		.fill('#A5A3A2')
		.fontSize(66)
		.drawText(1345, 2120, num)
		.write('./movecar/pdfinfo3/pdfinfo'+num+'.png',function(err){
			if(!err){
				console.log('success!------'+num);
			}else{
				console.log(err);
				console.log('error!');
			}
		})
}
/*for (var i = 35621; i <= 36000; i++) {//25621-36000
	imgGMFont(i);
};
return;*/
//设置图片位深度
function imgBitdepth(){
	gm('./movecar/800_re/1.png').bitdepth(8).write('./movecar/800_re_8/1.png',function(err){
		if(!err){
			console.log("success")
		}else{
			console.log(err)
		}
	});
	/*gm.convert(['./movecar/800_re/1.png', '-depth', 8, './movecar/800_re_8/1.png'], 
		function(err, stdout){
		  if (err) throw err;
		  console.log('stdout:', stdout);
		})*/
}
// for (var i = 1; i <= 100; i++) {
// 	imgHandleCode(i);
// };
// imgBitdepth();
// return;
// changeSize(1,100);return;


//-------------------------------------------------------pagestart-图片------------------------------------------------------
function firstStep(qrList,info){
	console.log('+'+240+'+'+175+'',1);
	gm('./movecar/car.jpg')
		.composite(qrList[0])
		.gravity('NorthWest')
		.geometry(`+240+175`)
		.write('./movecar/car_1.jpg',function(err){
			if(!err){
				qrList.shift();
				ingStep(2,qrList,info);
			}else{
				console.log(err);
				console.log('error!222');
			}
		})
}
function ingStep(time,qrList,info){//time从1开始计算
	var pointx = 0;
	var pointy = 0;
	var low = parseInt(time/8)+1;//行数--从1开始计算
	var culmn = time%8;//列数--从1开始计算
	if(time%8==0){
		low--;
		culmn = 8;
	}
	pointx = 240+550*(culmn-1)+75*(culmn-1);
	pointy = 175+550*(low-1)+280*(low-1);
	var point = '+'+pointx+'+'+pointy+'';
	console.log(point,low);
	gm('./movecar/car_'+(time-1)+'.jpg')
		.composite(qrList[0])
		.gravity('NorthWest')
		.geometry(point)
		.write('./movecar/car_'+time+'.jpg',function(err){
			if(!err){
				fs.unlink('./movecar/car_'+(time-1)+'.jpg');
				time++;
				qrList.shift();
				if(qrList.length==0){
					lastStep(time-1,info);
				}else{
					ingStep(time,qrList,info);
				}
			}else{
				console.log(err);
				console.log('error!'+time);
			}
		})
}
function lastStep(number,info){
	gm('./movecar/car_'+number+'.jpg')
		.composite('./movecar/car.png')
		.gravity("SouthEast")
		.write('./movecar/car_result1.jpg',function(err){
			if(!err){
				fs.unlink('./movecar/car_'+number+'.jpg');
				gm('./movecar/car_result1.jpg')
					.font('./准圆简.ttf')
					.fill('#000000')
					.fontSize(160)
					.drawText(20, 40, info,'SouthEast')
					.write('./movecar/car_result'+info+'.jpg',function(err){
						if(!err){
							console.log('success!');
							fs.unlink('./movecar/car_result1.jpg');
						}else{
							console.log(err);
							console.log('error!');
						}
					})
			}else{
				console.log(err);
				console.log('error!result');
			}
		})
}
function setPathList(start,end,isDouble){
	var pathList = [];
	for(var i=start; i<=end;i++){
		if(isDouble){
			pathList.push(path+'/ct'+i+'.png');
		}
		pathList.push(path+'/ct'+i+'.png');
	}
	return pathList;
}
function pages(start,end){//目前只支持一版一版的生成，一版只能打印32个
	var qrList = setPathList(start,end,false);
	firstStep(qrList,start+'-'+end);
}
// pages(65,96);
//-------------------------------------------------------pageend-图片------------------------------------------------------
//-------------------------------------------------------pdfstart-------------------------------------------------------
// return;只能500个二维码一次的来
var pdf = require('pdfkit');
function createPDF(start){
	var doc = new pdf({
		size: 'A3'
	});
	var sourceUrl = 'movecar/ct1280/ct';
	doc.pipe(fs.createWriteStream('./movecar/pdf/'+start+'-'+(start+19)+'.pdf'));
	doc.image(sourceUrl+start+'.png',34.02,19.69,{
	   // fit: [250, 300],
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+1)+'.png',232.44,19.69,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+2)+'.png',430.87,19.69,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+3)+'.png',629.29,19.69,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+4)+'.png',34.02,254.96,{
	   // fit: [250, 300],
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+5)+'.png',232.44,254.96,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+6)+'.png',430.87,254.96,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+7)+'.png',629.29,254.96,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+8)+'.png',34.02,490.24,{
	   // fit: [250, 300],
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+9)+'.png',232.44,490.24,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+10)+'.png',430.87,490.24,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+11)+'.png',629.29,490.24,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+12)+'.png',34.02,725.51,{
	   // fit: [250, 300],
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+13)+'.png',232.44,725.51,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+14)+'.png',430.87,725.51,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+15)+'.png',629.29,725.51,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+16)+'.png',34.02,960.79,{
	   // fit: [250, 300],
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+17)+'.png',232.44,960.79,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+18)+'.png',430.87,960.79,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+19)+'.png',629.29,960.79,{
	   width: 158.74,
	   height: 158.74,
	   align: 'center',
	   valign: 'center'
	});
	doc.end();
}
//测试插入文字
function createPDFText(){
	var n = 1;
	var doc = new pdf({
		size: 'A3'
	});
	var sourceUrl = 'movecar/ct1280/ct';
	doc.pipe(fs.createWriteStream('./movecar/pdf/font.pdf'));
	doc.image('movecar/bg.png',0,0,{
	   width: 841.89*n,
	   height: 1190.55*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().fontSize(14).fillColor("#A5A3A2").text('1281-1300',100,100).stroke();
	doc.end();
}
//每个二维码都加上编号
function createPDFSetSizeFonthuihuanye(start){
	let n = 1;
	var doc = new pdf({
		size: 'A3'
	});
	var position = {
		bgW:161.139*n,
		bgH:212.162*n,
		bgX:32.817*n,
		bgY:18.644*n,
		bgSpaceX: 37.29*n,
		bgSpaceY: 23.11*n,
		spritW:158.74*n,
		spritH:158.74*n,
		spritX:34.02*n,
		spritY:19.69*n,
		spritSpaceX: 39.685*n,
		spritSpaceY: 76.535*n,
	}
	var sourceUrl = 'movecar/ct1280/ct';
	doc.pipe(fs.createWriteStream('./movecar/pdf/'+start+'-'+(start+19)+'font4.pdf'));
	doc.image('movecar/bgL.png',0,0,{
	   width: 841.89*n,
	   height: 1190.55*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().fontSize(7).text(start+'-'+(start+19),35,5).stroke().image('movecar/pdfbg.png',position.bgX,position.bgY,{
	   // fit: [250, 300],
	   width: position.bgW,
	   height: position.bgH,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+start+'.png',position.spritX,position.spritY,{
	   // fit: [250, 300],
	   width: position.spritW,
	   height: position.spritH,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',position.bgX,position.bgY,{
	   // fit: [250, 300],
	   width: position.bgW,
	   height: position.bgH,
	   align: 'center',
	   valign: 'center'
	}).stroke().fontSize(6).fillColor("#A5A3A2").text(start,position.spritX+120,position.spritY+195);
	let currentQRCode = start;
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 4; j++) {
			if(i==0&&j==0){
				continue;
			}else{
				currentQRCode++;
				let bgx_=j*position.bgW+position.bgX+j*position.bgSpaceX;
				let bgy_=i*position.bgH+position.bgY+i*position.bgSpaceY;
				let spritx_=j*position.spritW+position.spritX+j*position.spritSpaceX;
				let sprity_=i*position.spritH+position.spritY+i*position.spritSpaceY;
				let fontx_=spritx_+120;
				let fonty_=sprity_+195;
				if(i==4){
					fonty_=sprity_+150;
				}
				console.log('-------------------------'+i);
				console.log(fontx_);
				console.log(fonty_);
				doc.stroke().image('movecar/pdfbg.png',bgx_,bgy_,{
				   width: position.bgW,
				   height: position.bgH,
				   align: 'center',
				   valign: 'center'
				}).stroke().image(sourceUrl+currentQRCode+'.png',spritx_,sprity_,{
				   width: position.spritW,
				   height: position.spritH,
				   align: 'center',
				   valign: 'center'
				}).stroke().image('movecar/pdfinfo.png',bgx_,bgy_,{
				   width: position.bgW,
				   height: position.bgH,
				   align: 'center',
				   valign: 'center'
				}).stroke().fontSize(6).fillColor("#A5A3A2").text(currentQRCode,fontx_,fonty_);
			}
		};
	};
	doc.end();
}
function createPDFSetSizeFont(start){
	let n = 1;
	var doc = new pdf({
		size: 'A3'
	});
	var position = {
		bgW:161.139*n,
		bgH:212.162*n,
		bgX:32.817*n,
		bgY:18.644*n,
		bgSpaceX: 37.29*n,
		bgSpaceY: 23.11*n,
		spritW:158.74*n,
		spritH:158.74*n,
		spritX:34.02*n,
		spritY:19.69*n,
		spritSpaceX: 39.685*n,
		spritSpaceY: 76.535*n,
	}
	var sourceUrl = 'movecar/ct11/ct';/////////
	doc.pipe(fs.createWriteStream('./movecar/pdfL5/'+start+'-'+(start+19)+'.pdf'));/////////
	doc.image('movecar/bgL.png',0,0,{
	   width: 841.89*n,
	   height: 1190.55*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().fontSize(7).text(start+'-'+(start+19),35,5).stroke().image('movecar/pdfbg.png',position.bgX,position.bgY,{
	   // fit: [250, 300],
	   width: position.bgW,
	   height: position.bgH,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+start+'.png',position.spritX,position.spritY,{
	   // fit: [250, 300],
	   width: position.spritW,
	   height: position.spritH,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo3/pdfinfo'+start+'.png',position.bgX,position.bgY,{////////
	   // fit: [250, 300],
	   width: position.bgW,
	   height: position.bgH,
	   align: 'center',
	   valign: 'center'
	}).stroke();
	let currentQRCode = start;
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 4; j++) {
			if(i==0&&j==0){
				continue;
			}else{
				currentQRCode++;
				let bgx_=j*position.bgW+position.bgX+j*position.bgSpaceX;
				let bgy_=i*position.bgH+position.bgY+i*position.bgSpaceY;
				let spritx_=j*position.spritW+position.spritX+j*position.spritSpaceX;
				let sprity_=i*position.spritH+position.spritY+i*position.spritSpaceY;
				let fontx_=spritx_+120;
				let fonty_=sprity_+195;
				if(i==4){
					fonty_=sprity_+150;
				}
				doc.stroke().image('movecar/pdfbg.png',bgx_,bgy_,{
				   width: position.bgW,
				   height: position.bgH,
				   align: 'center',
				   valign: 'center'
				}).stroke().image(sourceUrl+currentQRCode+'.png',spritx_,sprity_,{
				   width: position.spritW,
				   height: position.spritH,
				   align: 'center',
				   valign: 'center'
				}).stroke().image('movecar/pdfinfo3/pdfinfo'+currentQRCode+'.png',bgx_,bgy_,{///////
				   width: position.bgW,
				   height: position.bgH,
				   align: 'center',
				   valign: 'center'
				}).stroke();
			}
		};
	};
	doc.end();
}
// createPDFSetSizeFont(10621);return;
// for (var i = 35621; i <= 36000; i++) {
// 	if(i%20==1){
// 		createPDFSetSizeFont(i);
// 	}
// };
// return;
function createPDFall11(start){
	var n = 1;
	var doc = new pdf({
		size: 'A3'
	});
	var sourceUrl = 'movecar/ct1280/ct';
	doc.pipe(fs.createWriteStream('./movecar/pdf/'+start+'-'+(start+19)+'1.pdf'));
	doc.image('movecar/bg.png',0,0,{
	   width: 841.89*n,//1000*n,
	   height: 1190.55*n,//1320*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().fontSize(7).text(start+'-'+(start+19),0,0).stroke().image('movecar/pdfbg.png',32.817*n,18.644*n,{
	   // fit: [250, 300],
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+start+'.png',34.02*n,19.69*n,{
	   // fit: [250, 300],
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',32.817*n,18.644*n,{
	   // fit: [250, 300],
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',231.242*n,18.644*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+1)+'.png',232.44*n,19.69*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',231.242*n,18.644*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',429.667*n,18.644*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+2)+'.png',430.87*n,19.69*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',429.667*n,18.644*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',628.093*n,18.644*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+3)+'.png',629.29*n,19.69*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',628.093*n,18.644*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',32.817*n,253.919*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+4)+'.png',34.02*n,254.96*n,{
	   // fit: [250, 300],
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',32.817*n,253.919*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',231.242*n,253.919*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+5)+'.png',232.44*n,254.96*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',231.242*n,253.919*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',429.667*n,253.919*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+6)+'.png',430.87*n,254.96*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',429.667*n,253.919*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',628.093*n,253.919*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+7)+'.png',629.29*n,254.96*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',628.093*n,253.919*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',32.817*n,489.195*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+8)+'.png',34.02*n,490.24*n,{
	   // fit: [250, 300],
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',32.817*n,489.195*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',231.242*n,489.195*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+9)+'.png',232.44*n,490.24*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',231.242*n,489.195*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',429.667*n,489.195*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+10)+'.png',430.87*n,490.24*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',429.667*n,489.195*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',628.093*n,489.195*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+11)+'.png',629.29*n,490.24*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',628.093*n,489.195*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',32.817*n,724.471*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+12)+'.png',34.02*n,725.51*n,{
	   // fit: [250, 300],
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',32.817*n,724.471*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',231.242*n,724.471*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+13)+'.png',232.44*n,725.51*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',231.242*n,724.471*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',429.667*n,724.471*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+14)+'.png',430.87*n,725.51*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',429.667*n,724.471*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',628.093*n,724.471*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+15)+'.png',629.29*n,725.51*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',628.093*n,724.471*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',32.817*n,959.746*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+16)+'.png',34.02*n,960.79*n,{
	   // fit: [250, 300],
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',32.817*n,959.746*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',231.242*n,959.746*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+17)+'.png',232.44*n,960.79*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',231.242*n,959.746*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',429.667*n,959.746*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+18)+'.png',430.87*n,960.79*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',429.667*n,959.746*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfbg.png',628.093*n,959.746*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+(start+19)+'.png',629.29*n,960.79*n,{
	   width: 158.74*n,
	   height: 158.74*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',628.093*n,959.746*n,{
	   width: 161.139*n,
	   height: 212.162*n,
	   align: 'center',
	   valign: 'center'
	});
	doc.end();
}
function createPDFSetSize(start){
	var n = 1;
	var doc = new pdf({
		size: 'A3'
	});
	var position = {
		bgW:161.139*n,
		bgH:212.162*n,
		bgX:32.817*n,
		bgY:18.644*n,
		bgSpaceX: 37.29*n,
		bgSpaceY: 23.11*n,
		spritW:158.74*n,
		spritH:158.74*n,
		spritX:34.02*n,
		spritY:19.69*n,
		spritSpaceX: 39.685*n,
		spritSpaceY: 76.535*n,
	}
	var sourceUrl = 'movecar/ct11/ct';
	doc.pipe(fs.createWriteStream('./movecar/pdfL5/'+start+'-'+(start+19)+'.pdf'));
	doc.image('movecar/bgL.png',0,0,{
	   width: 841.89*n,
	   height: 1190.55*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().fontSize(7).text(start+'-'+(start+19),35,5).stroke().image('movecar/pdfbg.png',position.bgX,position.bgY,{
	   // fit: [250, 300],
	   width: position.bgW,
	   height: position.bgH,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+start+'.png',position.spritX,position.spritY,{
	   // fit: [250, 300],
	   width: position.spritW,
	   height: position.spritH,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',position.bgX,position.bgY,{
	   // fit: [250, 300],
	   width: position.bgW,
	   height: position.bgH,
	   align: 'center',
	   valign: 'center'
	});
	var currentQRCode = start;
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 4; j++) {
			if(i==0&&j==0){
				continue;
			}else{
				currentQRCode++;
				var bgx_=j*position.bgW+position.bgX+j*position.bgSpaceX;
				var bgy_=i*position.bgH+position.bgY+i*position.bgSpaceY;
				var spritx_=j*position.spritW+position.spritX+j*position.spritSpaceX;
				var sprity_=i*position.spritH+position.spritY+i*position.spritSpaceY;
				doc.stroke().image('movecar/pdfbg.png',bgx_,bgy_,{
				   width: position.bgW,
				   height: position.bgH,
				   align: 'center',
				   valign: 'center'
				}).stroke().image(sourceUrl+currentQRCode+'.png',spritx_,sprity_,{
				   width: position.spritW,
				   height: position.spritH,
				   align: 'center',
				   valign: 'center'
				}).stroke().image('movecar/pdfinfo.png',bgx_,bgy_,{
				   width: position.bgW,
				   height: position.bgH,
				   align: 'center',
				   valign: 'center'
				}).stroke();
			}
		};
	};
	doc.end();
}
//每个二维码都加上刀模框
function createPDFSetSizeCut(start,fileNum){
	var n = 1;
	var doc = new pdf({
		size: 'A3'
	});
	var position = {
		bgW:161.139*n,
		bgH:212.162*n,
		bgX:32.817*n,
		bgY:18.644*n,
		bgSpaceX: 37.29*n,
		bgSpaceY: 23.11*n,////
		bgCW:170.079*n,
		bgCH:221.103*n,
		bgCX:28.347*n,
		bgCY:14.173*n,
		bgCSpaceX: 28.35*n,
		bgCSpaceY: 14.17*n,///
		spritW:158.74*n,
		spritH:158.74*n,
		spritX:34.02*n,
		spritY:19.69*n,
		spritSpaceX: 39.685*n,
		spritSpaceY: 76.535*n,
	}
	var sourceUrl = 'movecar/ct'+fileNum+'/ct';
	doc.pipe(fs.createWriteStream('./movecar/pdf/'+start+'-'+(start+19)+'.pdf'));
	doc.image('movecar/bgL.png',0,0,{
	   width: 841.89*n,
	   height: 1190.55*n,
	   align: 'center',
	   valign: 'center'
	}).stroke().fontSize(7).text(start+'-'+(start+19),35,5).stroke().image('movecar/pdfbg.png',position.bgX,position.bgY,{
	   // fit: [250, 300],
	   width: position.bgW,
	   height: position.bgH,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfcutline.png',position.bgCX,position.bgCY,{
	   // fit: [250, 300],
	   width: position.bgCW,
	   height: position.bgCH,
	   align: 'center',
	   valign: 'center'
	}).stroke().image(sourceUrl+start+'.png',position.spritX,position.spritY,{
	   // fit: [250, 300],
	   width: position.spritW,
	   height: position.spritH,
	   align: 'center',
	   valign: 'center'
	}).stroke().image('movecar/pdfinfo.png',position.bgX,position.bgY,{
	   // fit: [250, 300],
	   width: position.bgW,
	   height: position.bgH,
	   align: 'center',
	   valign: 'center'
	});
	var currentQRCode = start;
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 4; j++) {
			if(i==0&&j==0){
				continue;
			}else{
				currentQRCode++;
				var bgx_=j*position.bgW+position.bgX+j*position.bgSpaceX;
				var bgy_=i*position.bgH+position.bgY+i*position.bgSpaceY;
				var bgCx_=j*position.bgCW+position.bgCX+j*position.bgCSpaceX;
				var bgCy_=i*position.bgCH+position.bgCY+i*position.bgCSpaceY;
				var spritx_=j*position.spritW+position.spritX+j*position.spritSpaceX;
				var sprity_=i*position.spritH+position.spritY+i*position.spritSpaceY;
				doc.stroke().image('movecar/pdfbg.png',bgx_,bgy_,{
				   width: position.bgW,
				   height: position.bgH,
				   align: 'center',
				   valign: 'center'
				}).stroke().image('movecar/pdfcutline.png',bgCx_,bgCy_,{
				   width: position.bgCW,
				   height: position.bgCH,
				   align: 'center',
				   valign: 'center'
				}).stroke().image(sourceUrl+currentQRCode+'.png',spritx_,sprity_,{
				   width: position.spritW,
				   height: position.spritH,
				   align: 'center',
				   valign: 'center'
				}).stroke().image('movecar/pdfinfo.png',bgx_,bgy_,{
				   width: position.bgW,
				   height: position.bgH,
				   align: 'center',
				   valign: 'center'
				}).stroke();
			}
		};
	};
	doc.end();
}
/*for (var i = 10101; i <= 10600; i++) {
	if(i%20==1){
		createPDFSetSize(i);
		// createPDFSetSizeCut(i,1);
	}
};*/
// return;
// for (var i = 4601; i <= 5100; i++) {//目前生成到了5100
// 	if(i%20==1){
// 		createPDF(i);
// 	}
// };
//-------------------------------------------------------pdfend-------------------------------------------------------

