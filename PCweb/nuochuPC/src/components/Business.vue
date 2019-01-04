<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16" style="text-align: left;">
      	<el-button type="primary" @click="edit({})">新增</el-button>
      </el-col>
      <el-col :span="8"></el-col>
    </el-row>
    <el-table :data="tableData.content">
      <el-table-column prop="id" label="ID" width="200"></el-table-column>
      <el-table-column prop="name" label="姓名" width="200"></el-table-column>
      <el-table-column prop="phone" label="手机号" width="200"></el-table-column>
      <el-table-column prop="password" label="密码" width="200"></el-table-column>
      <el-table-column prop="reason" label="事由"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column fixed="right" label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="edit(scope.row)">编辑</el-button>
          <el-button type="text" size="small" @click="del(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="编辑" :visible.sync="showEdit" width="45%">
      <el-form ref="form" :model="theData" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="theData.name"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="theData.phone"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="theData.password"></el-input>
        </el-form-item>
        <el-form-item label="事由">
          <el-input type="textarea" v-model="theData.reason"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEdit = false">取 消</el-button>
        <el-button type="primary" @click="saveData(theData)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style>
  
</style>

<script>
  export default {
    name: 'Business',
    data() {
      return {
        tableData:{
          currentPage: 1,//从1开始
          pageSize: 10,
          total:0,
          content: [],
        },
        search: '',
        showEdit: false,
        theData: {}
      }
    },
    mounted: function(){
      var that = this;
      that.queryList();
    },
    methods: {
      queryList: function(){
        var that = this;
        var callback = function(data){
          that.tableData.content = data.data.content;
        }
        that.requestAPI("/queryBusiness",{},callback);
      },
      edit:function(data){
        console.log(data)
        this.theData = data;
        this.showEdit = true;
      },
      saveData: function(data){
        var that = this;
        var callback = function(data){
          if(data.errcode==0){
            that.showEdit = false;
            that.theData = {};
            that.queryList();
             that.$message({
              message: '保存成功！',
              type: 'success'
            });
          }else{
            that.$message.error('保存失败！');
          }
        }
        if(!data.id){
          that.requestAPI("/addBUser",data,callback);
        }else{
          that.requestAPI("/updateBUser",data,callback);
        }
      },
      del:function(data) {
        var that = this;
        var callback = function(data){
          if(data.errcode==0){
            that.queryList();
             that.$message({
              message: '删除成功！',
              type: 'success'
            });
          }else{
            that.$message.error('删除失败！');
          }
        }
        that.requestAPI("/delBusiness",{id:data.id},callback);
      },
    },
  };
</script>
