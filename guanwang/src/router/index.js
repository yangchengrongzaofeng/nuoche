import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'

import {Carousel,CarouselItem} from 'element-ui';
Vue.use(Carousel);
Vue.use(CarouselItem);

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
	      path: '/',
	      name: 'Home',
	      component: Home
	    }
	]
})
