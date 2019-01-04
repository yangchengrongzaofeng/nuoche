<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16" style="text-align: left;">
        <el-button type="primary" @click="edit({})">新增</el-button>
      </el-col>
      <el-col :span="8">
        <el-input v-model="search" placeholder="请输入手机号" class="input-with-select">
          <el-button slot="append" icon="el-icon-search"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <el-table :data="tableData">
      <el-table-column prop="id" label="ID" width="60">
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="200">
      </el-table-column>
      <el-table-column prop="statusV" label="状态">
      </el-table-column>
      <el-table-column prop="reason" label="事由">
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="edit(scope.row)">编辑</el-button>
          <el-button type="text" size="small" @click="del(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="编辑" :visible.sync="showEdit" width="45%">
      <el-form ref="form" :model="theData" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="theData.phone"></el-input>
        </el-form-item>
        <el-form-item label="启用状态" v-if="theData.id">
          <el-switch v-model="theData.statusTF"></el-switch>
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
    name: 'WhiteList',
    data() {
      return {
        tableData: [],
        search: '',
        showEdit:false,
        theData: {}
      }
    },
    mounted: function(){
      this.queryWhiteList();
    },
    methods: {
      del:function(data) {
        var that = this;
        var callback = function(data){
          if(data.errcode==0){
            that.queryWhiteList();
             that.$message({
              message: '删除成功！',
              type: 'success'
            });
          }else{
            that.$message.error('删除失败！');
          }
        }
        that.requestAPI("/delWhiteList",{id:data.id},callback);
      },
      queryWhiteList: function(){
        var that = this;
        var callback = function(data){
          for (var i = 0; i < data.data.content.length; i++) {
            if(data.data.content[i].status==1){
              data.data.content[i].statusV = "生效中";
              data.data.content[i].statusTF = true;
            }else{
              data.data.content[i].statusV = "已失效";
              data.data.content[i].statusTF = false;
            }
          };
          that.tableData = data.data.content;
        }
        that.requestAPI("/queryWhiteList",{phone:that.search},callback);
      },
      edit:function(data){
        console.log(data)
        this.theData = data;
        this.showEdit = true;
      },
      saveData: function(data){
        var that = this;
        if(data.statusTF){
          data.status = 1;
        }else{
          data.status = 0;
        }
        var callback = function(data){
          if(data.errcode==0){
            that.showEdit = false;
            that.theData = {};
            that.queryWhiteList();
             that.$message({
              message: '保存成功！',
              type: 'success'
            });
          }else{
            that.$message.error('保存失败！');
          }
        }
        if(!data.id){
          that.requestAPI("/AddWhiteList",data,callback);
        }else{
          that.requestAPI("/updateWhiteList",data,callback);
        }
      },
    },
  };
</script>
