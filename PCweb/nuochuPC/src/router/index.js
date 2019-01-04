import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Login from '@/components/Login'
import WhiteList from '@/components/WhiteList'
import VirtualNum from '@/components/VirtualNum'
import CarUser from '@/components/CarUser'
import CarUserSearch from '@/components/CarUserSearch'
import CallRecord from '@/components/CallRecord'
import Business from '@/components/Business'
import Qrcode from '@/components/Qrcode'

Vue.use(Router)

export default new Router({
	mode: 'hash',//该模式下会将路径格式化为 #! 开头history
	scrollBehavior (to, from, savedPosition) {// return 期望滚动到哪个的位置  
	    if (savedPosition) {
		    return savedPosition
		} else {
		    return { x: 0, y: 0 }
		}
	},
    routes: [
	    {
	      path: '/login',
	      name: 'Login',
	      component: Login
	    },{
	      path: '/home',
	      name: 'Home',
	      component: Home
	    },
	    {
	      path: '/whiteList',
	      name: 'WhiteList',
	      component: WhiteList
	    },
	    {
	      path: '/virtualNum',
	      name: 'VirtualNum',
	      component: VirtualNum
	    },
	    {
	      path: '/carUser',
	      name: 'CarUser',
	      component: CarUser
	    },
	    {
	      path: '/carUserSearch',
	      name: 'CarUserSearch',
	      component: CarUserSearch
	    },
	    {
	      path: '/callRecord',
	      name: 'CallRecord',
	      component: CallRecord
	    },
	    {
	      path: '/business',
	      name: 'Business',
	      component: Business
	    },
	    {
	      path: '/qrcode',
	      name: 'Qrcode',
	      component: Qrcode
	    }
    ]
})
