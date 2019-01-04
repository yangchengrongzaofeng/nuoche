<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16" style="text-align: left;"></el-col>
      <el-col :span="8">
        <el-col :span="10"></el-col>
        <el-col :span="14">
          <el-input v-model="search" placeholder="请输入手机号" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="queryList"></el-button>
          </el-input>
        </el-col>
      </el-col>
    </el-row>
    <el-table :data="tableData.content">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="qrcodeId" label="小程序码编号" width="200"></el-table-column>
      <el-table-column prop="carNum" label="车牌号" width="200"></el-table-column>
      <el-table-column prop="phone" label="手机号" width="200"></el-table-column>
      <el-table-column prop="remainTime" label="剩余时长" width="200"></el-table-column>
      <el-table-column prop="allCallDuration" label="使用时长" width="200"></el-table-column>
      <el-table-column prop="statusV" label="状态"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
    </el-table>
  </div>
</template>
<style>
  
</style>

<script>
  export default {
    name: 'CarUserSearch',
    data() {
      return {
        tableData:{
          content: [],
        },
        search: ''
      }
    },
    mounted: function(){
     
    },
    methods: {
      checkPhone: function (phone) {
        var result = false;
        var express = /^(14[0-9]|13[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])\d{8}$/;
        result = express.test(phone);
        return result;
      },
      queryList: function(){
        var that = this;
        if(!!that.search && that.search.length==11 && that.checkPhone(that.search)){
          var callback = function(data){
            if(data.errcode==0){
              for (var i = 0; i < data.data.content.length; i++) {
                if(data.data.content[i].status==1){
                  data.data.content[i].statusV = "开启中";
                }else if(data.data.content[i].status==0){
                  data.data.content[i].statusV = "已关闭";
                }else{
                  data.data.content[i].statusV = "已删除";
                }
              };
              that.tableData.content = data.data.content;
            }else{
              that.$message.error(data.msg);
            }
          }
          that.requestAPI("/queryCarMasterByPhone",{phone: that.search},callback);
        }else{
          this.$message({
            message: '请输入正确的手机号',
            type: 'warning'
          });
        }
      },
    },
  };
</script>
