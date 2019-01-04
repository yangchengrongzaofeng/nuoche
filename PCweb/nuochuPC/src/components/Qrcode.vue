<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16" style="text-align: left;;min-height: 2px;">
        <el-button type="primary" v-if="globalData.auth==1" @click="showAdd=true;">添加</el-button>
      </el-col>
      <el-col :span="8">
        <el-col :span="10"></el-col>
        <el-col :span="14">
          <el-input type="number" v-model="search" placeholder="输入小程序码编号查询车主记录" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="queryDetail"></el-button>
          </el-input>
        </el-col>
      </el-col>
    </el-row>
    <el-row :gutter="10" style="margin: 20px 0;" v-if="progress!=0">
      <el-col :span="10" style="text-align: left;">
        <el-progress :text-inside="true" :stroke-width="18" :percentage="progress" status="success"></el-progress>
      </el-col>
      <el-col :span="14"></el-col>
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
    <el-dialog title="添加" :visible.sync="showAdd" width="45%">
      <el-form ref="form" :model="theData" label-width="200px">
        <el-form-item label="所要添加的二维码数量">
          <el-input type="number" v-model="theData.num"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAdd = false">取 消</el-button>
        <el-button type="primary" @click="addQrcode(1,theData.num)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style>
  
</style>

<script>
  export default {
    name: 'Home',
    data() {
      return {
        tableData:{
          content: [],
        },
        search: '',
        showAdd: false,
        theData: {
          num: 0
        },
        progress: 0
      }
    },
    methods: {
      queryDetail: function(){
        var that = this;
        var callback = function(data){
          if(data.errcode==0){
            that.tableData = data.data;
          }else{
            that.$message.error(data.msg);
          }
        }
        that.requestAPI("/searchCarMByQrcode",{qrcodeId:that.search},callback);
      },
      addQrcode: function(start,end){
        var that = this;
        var callback = function(data){
          if(data.errcode==0){
            that.showAdd = false;
            that.progress = parseInt((start/end)*100);
            start++;
            if(start<=end){
              that.addQrcode(start,end);
            }else{
              that.$message({
                message: '全部添加完毕！！',
                type: 'success'
              });
            }
          }else{
            that.$message.error(data.msg);
          }
        }
        that.requestAPI("/AddQrcode",{},callback);
      }
    },
  };
</script>
