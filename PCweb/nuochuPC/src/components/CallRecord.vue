<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16" style="text-align: left;height: 2px;"></el-col>
      <el-col :span="8">
        <el-col :span="10"></el-col>
        <el-col :span="14">
          <el-input v-model="search" placeholder="请输入被叫方号码" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="queryList()"></el-button>
          </el-input>
        </el-col>
      </el-col>
    </el-row>
    <el-table :data="tableData.content">
      <el-table-column prop="calling" label="主叫方" width="200"></el-table-column>
      <el-table-column prop="called" label="被叫方" width="200"></el-table-column>
      <el-table-column prop="virtualNumber" label="虚拟号" width="200"></el-table-column>
      <el-table-column prop="callIdentifier" label="请求ID"></el-table-column>
      <el-table-column prop="timestart" label="开始时间" width="200"></el-table-column>
      <el-table-column prop="timestamp" label="结束时间" width="200"></el-table-column>
      <el-table-column prop="duration" label="通话时长" width="100"></el-table-column>
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
    name: 'CallRecord',
    data() {
      return {
        tableData:{
          currentPage: 1,//从1开始
          pageSize: 10,
          total:0,
          content: [],
        },
        search: '',
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
          that.tableData.content = data.data.content;
          that.tableData.currentPage = data.data.currentPage;
          that.tableData.pageSize = data.data.pageSize;
          that.tableData.total = data.data.total;
        }
        that.requestAPI("/queryCallRecord",{currentPage:that.tableData.currentPage,pageSize:that.tableData.pageSize,keyword:that.search},callback);
      },
    },
  };
</script>
