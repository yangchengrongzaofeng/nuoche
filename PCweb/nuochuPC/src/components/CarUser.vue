<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16" style="text-align: left;height: 2px;"></el-col>
      <el-col :span="8">
        <el-col :span="10">
          <el-select v-model="statusValue" @change="queryList()" placeholder="请选择">
            <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select></el-col>
        <el-col :span="14">
          <el-input v-model="search" placeholder="请输入手机号或者车牌号" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="queryList()"></el-button>
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
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="tableData.currentPage"
        :page-sizes="[10, 50, 100]"
        :page-size="tableData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.total">
      </el-pagination>
  </div>
</template>
<style>
  
</style>

<script>
  export default {
    name: 'CarUser',
    data() {
      return {
        tableData:{
          currentPage: 1,//从1开始
          pageSize: 10,
          total:0,
          content: [],
        },
        search: '',
        statusValue: 1,
        statusList: [{
          value: null,
          label: "全部"
        },{
          value: 0,
          label: "已关闭"
        },{
          value: 1,
          label: "已开启"
        },{
          value: 2,
          label: "已注销"
        },]
      }
    },
    mounted: function(){
      var that = this;
      that.queryList();
    },
    methods: {
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
        var that = this;
        that.tableData.pageSize = val;
        that.tableData.currentPage = 1;
        that.queryList();
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
        var that = this;
        that.tableData.currentPage = val;
        that.queryList();
      },
      queryList: function(){
        var that = this;
        var callback = function(data){
          for (var i = 0; i < data.data.content.length; i++) {
            if(data.data.content[i].status==1){
              data.data.content[i].statusV = "已开启";
            }else if(data.data.content[i].status==2){
              data.data.content[i].statusV = "已注销";
            }else{
              data.data.content[i].statusV = "已关闭";
            }
          };
          that.tableData.content = data.data.content;
          that.tableData.currentPage = data.data.currentPage;
          that.tableData.pageSize = data.data.pageSize;
          that.tableData.total = data.data.total;
        }
        that.requestAPI("/queryCarMaster",{currentPage:that.tableData.currentPage,pageSize:that.tableData.pageSize,status:that.statusValue,keyword:that.search},callback);
      },
    },
  };
</script>
