// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import { 
	Container, 
	Aside, 
	Menu,
	Submenu,
	Header,
	Dropdown,
	Main,
	Table,
	DropdownMenu,
	DropdownItem,
	TableColumn,
	MenuItem,
  	MenuItemGroup,
  	Button,
  	Input,
  	Row,
  	Col,
  	Dialog,
  	Form,
  	FormItem,
  	Switch,
  	Select,
  	Option,
  	Message,
  	MessageBox,
  	Loading,
  	Pagination,
  	Progress,
} from 'element-ui';
Vue.use(Container);
Vue.use(Aside);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(Header);
Vue.use(Dropdown);
Vue.use(Main);
Vue.use(Table);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(TableColumn);
Vue.use(MenuItem);
Vue.use(MenuItemGroup);
Vue.use(Button);
Vue.use(Input);
Vue.use(Row);
Vue.use(Col);
Vue.use(Dialog);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Switch);
Vue.use(Select);
Vue.use(Option);
Vue.use(Pagination);
Vue.use(Progress);

Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$message = Message;
Vue.prototype.$loading = Loading.service;

Vue.config.productionTip = false;

//设置cookie
Vue.prototype.setCookie = function(c_name,value,expiredays) {//单位是天
  var exdate = new Date()
  exdate.setDate(exdate.getDate()+expiredays)
  document.cookie=c_name+ "=" +escape(value)+
    ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
};
//获取cookie
Vue.prototype.getCookie=function(c_name) {
  if (document.cookie.length>0){
    var  c_start=document.cookie.indexOf(c_name + "=")
    if (c_start!=-1){
      c_start=c_start + c_name.length+1
     var c_end=document.cookie.indexOf(";",c_start)
      if (c_end==-1) c_end=document.cookie.length
      return unescape(document.cookie.substring(c_start,c_end))
    }
  }
  return ""
};
//删除cookie
Vue.prototype.delCookie=function(name){
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval = Vue.prototype.getCookie(name);
	if (cval != null)
		document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
};

var reg = RegExp(/localhost/);
Vue.prototype.$apipath = reg.test(location.hostname)?'http://localhost:8080/carNumManager':'http://test.xccnet.com/carNumManager';

Vue.prototype.$requestH = {
	// 'X-TOKEN': Vue.prototype.getCookie('token')
}
Vue.prototype.requestAPI = function(url,params,callback,callbackE,type,contentType){
	if(!contentType || contentType=='application/json'){
		if(!params){
			params = {};
		}
		params = JSON.stringify(params);
	}
	$.ajax({
	    type: !type?"POST":type,
	    headers: Vue.prototype.$requestH,
	    url: Vue.prototype.$apipath+url,
	    data: params,
	    contentType: !contentType?'application/json':contentType,//application/x-www-form-urlencoded默认值，或application/json(data要to string)
	    dataType: "json",
	    success: function(data){
	      if(data.errcode!=0){
	      	if(data.errcode==30007){ //未认证授权
				Vue.prototype.delCookie('sessionName');
				Vue.prototype.delCookie('sessionId');
				Vue.prototype.refreshAllParams();
	      		router.push({ path: '/login' });
	      	}else{
	        	// Vue.prototype.$Message.error(data.errmsg);
	        	callback(data);
	      	}
	      }else{
	      	callback(data);
	      }
	    },
	    error: function(data){
        	if(!!callbackE)callbackE(data);
        }
	});
}
function toBool(string){
	if(string=='true'){
		return true;
	}else{
		return false;
	}
}
Vue.prototype.globalData = {
	userData: {},
	userName: "",
	auth: 0
}
Vue.prototype.getMyData = function(callback){
  Vue.prototype.requestAPI("/getMyData",{},callback);
}
//刷新全局变量
Vue.prototype.refreshAllParams=function(){
	// Vue.prototype.globalData['userData'] = Vue.prototype.globalData.userData;
	Vue.prototype.$forceUpdate();
};

// 注册---时间格式转化
Vue.filter('formatDate', function (date, fmt) {
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
})

Vue.prototype.formatTime=function(date, fmt){
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
};

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
