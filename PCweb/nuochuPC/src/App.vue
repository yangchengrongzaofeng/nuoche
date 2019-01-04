<template>
  <div id="app">
    <el-container style="height: 100%; border: 1px solid #eee">
      <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
        <el-menu :default-openeds="['1','2']" :default-active="$route.path.split('/')[1]" :router="true" :unique-opened="true">
          <el-menu-item index="home">
            <i class="el-icon-info"></i>
            <span slot="title">首页</span>
          </el-menu-item>
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-setting"></i>辅助功能</template>
            <el-menu-item-group>
              <template slot="title">辅助功能</template>
              <el-menu-item index="whiteList">白名单设置</el-menu-item>
              <el-menu-item index="virtualNum">虚拟号设置</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title"><i class="el-icon-menu"></i>管理功能</template>
            <el-menu-item-group>
              <el-menu-item index="carUser">车主列表</el-menu-item>
              <el-menu-item index="carUserSearch">车主查询</el-menu-item>
              <el-menu-item index="callRecord" v-if="globalData.auth==1">通话记录</el-menu-item>
              <el-menu-item index="business" v-if="globalData.auth==1">商家列表</el-menu-item>
              <el-menu-item index="qrcode">小程序码</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header style="text-align: right; font-size: 12px">
          <el-dropdown @command="handleCommand">
            <i class="el-icon-setting" style="margin-right: 15px"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="out">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span>{{globalData.userName}}</span>
        </el-header>
        <el-main style="position: relative;">
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    color: #2c3e50;
  }
  .el-header {
    background-color: #B3C0D1;
    color: #333;
    line-height: 60px;
  }
  
  .el-aside {
    color: #333;
  }
</style>
<script>
export default {
  name: 'App',
  data(){
    return {
      currentRoute: this.$route.path.split("/")[1]
    }
  },
  mounted: function(){
    var that = this;
    if(!!that.getCookie("sessionName")){
      if(!that.$route.path.split("/")[1]){
        that.$router.push({ path: '/home' });
      }
      if(!that.globalData.userData.phone){
        var callback = function(data){
          if(data.errcode==0){
            that.globalData.userData = data.data.userData;
            that.globalData.userName = data.data.userData.name;
            that.globalData.auth = data.data.userData.auth;
            that.$forceUpdate();
          }else{
            that.$message.error(data.msg);
          }
        }
        that.getMyData(callback);
      }
    }else{
      that.$router.push({ path: '/login' });
    }
  },
  methods: {
      logout:function() {
        var callback = function(){}
        this.requestAPI("/logout",{},callback);
      },
      handleCommand: function(command){
        console.log(command);
        if(command=="out" && this.getCookie("sessionName")){
          this.logout();
        }
      }
    }
}
</script>