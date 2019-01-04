<template>
  <div style="width: 400px;margin: 10% auto;">
    <el-form ref="form" :model="theData" label-width="80px">
      <el-form-item label="手机号">
        <el-input v-model="theData.phone"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input type="password" v-model="theData.password"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" style="text-align: center;">
      <el-button type="primary" @click="login(theData)">登 路</el-button>
    </div>
  </div>
</template>
<style>
  
</style>

<script>
  export default {
    name: 'Login',
    data() {
      return {
        theData: {}
      }
    },
    mounted: function(){
      
    },
    methods: {
      login:function(lgdata) {
        var that = this;
        var _callback = function(_data){
          if(_data.errcode==0){
            that.setCookie("sessionName",lgdata.phone,7);
            that.setCookie("sessionId",_data.data.token,7);
            var callback = function(data){
              if(data.errcode==0){
                that.globalData.userData = data.data.userData;
                that.globalData.userName = data.data.userData.name;
                that.globalData.auth = data.data.userData.auth;
                that.$router.push({ path: '/home' });
                console.log(that.globalData.userData);
              }else{
                that.$message.error(data.msg);
              }
            }
            that.getMyData(callback);
          }else{
            that.$message.error('登录失败！'+_data.msg);
          }
        }
        that.requestAPI("/login",lgdata,_callback);
      },
    },
  };
</script>
