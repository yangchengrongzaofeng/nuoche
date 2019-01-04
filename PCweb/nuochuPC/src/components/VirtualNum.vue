<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16" style="text-align: left;min-height: 2px;">
        <el-button type="primary" @click="edit({})" v-if="globalData.auth==1">新增</el-button>
        <el-button type="danger" @click="lockNum(selectList)" v-if="selectList.length>0&&statusValue==0">批量锁定</el-button>
        <el-button type="success" @click="freeNum(selectList)" v-if="selectList.length>0&&statusValue==2">批量解锁</el-button>
      </el-col>
      <el-col :span="8">
        <el-col :span="10">
          <el-select v-model="statusValue" placeholder="请选择" @change="queryWhiteList()">
            <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="14">
          <el-input v-model="search" placeholder="请输入虚拟号" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-col>
    </el-row>
    <el-table :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" :selectable="isCanSelect" width="55"></el-table-column>
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="virtualNum" label="虚拟号" width="200"></el-table-column>
      <el-table-column prop="statusV" label="状态"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column fixed="right" label="操作" width="200">
        <template slot-scope="scope">
          <!-- <el-button type="text" size="small" @click="edit(scope.row)">编辑</el-button> -->
          <el-button type="text" size="small" style="color:red;" v-if="scope.row.status==0" @click="lockNum([scope.row])">锁定</el-button>
          <el-button type="text" size="small" style="color:#67c23a;" v-if="scope.row.status==2" @click="freeNum([scope.row])">解锁</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="编辑" :visible.sync="showEdit" width="45%">
      <el-form ref="form" :model="theData" label-width="80px">
        <el-form-item label="虚拟号">
          <el-input v-model="theData.virtualNum"></el-input>
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
    name: 'VirtualNum',
    data() {
      return {
        dialogVisible: false,
        selectList:[],
        tableData: [],
        search: '',
        showEdit:false,
        theData: {},
        statusValue: 2,
        statusList: [{
          value: null,
          label: "全部"
        },{
          value: 0,
          label: "闲置中"
        },{
          value: 1,
          label: "使用中"
        },{
          value: 2,
          label: "已锁定"
        },]
      }
    },
    computed:{},
    mounted: function(){
      this.queryWhiteList();
      // for (var i = 0; i < 10; i++) {
      //   const item = {
      //     id: i+1,
      //     virtualNum: '13714059174',
      //     status: 2,
      //     statusV: '已锁定',
      //     createTime:'2018-11-20 14:36:00'
      //   };
      //   this.tableData.push(item);
      // };
    },
    methods: {
      isCanSelect(row,index){
        if(row.status==0&&this.statusValue==0 || row.status==2&&this.statusValue==2){
          return true;
        }else{
          return false;
        }
      },
      handleSelectionChange(val) {
        console.log(val)
        this.selectList = val;
      },
      lockNum:function(list) {
        var that = this;
        that.$confirm('确认锁定？')
          .then(_ => {
            const loading = this.$loading({
              lock: true,
              text: '正在锁定中，请稍等...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            });
            var callback = function(data){
              loading.close();
              if(data.errcode==0){
                that.queryWhiteList();
                that.$message({
                  message: '锁定成功！',
                  type: 'success'
                });
              }else{
                that.$message.error(data.msg);
              }
            }
            list.status=0;
            var pools = [];
            for (var i = 0; i < list.length; i++) {
              pools.push({id:list[i].id,virtualNum:list[i].virtualNum});
            };
            that.requestAPI("/lockPools",{pools:pools},callback);
          })
          .catch(_ => {});
      },
      freeNum:function(list) {
        var that = this;
        that.$confirm('确认解锁？')
          .then(_ => {
            const loading = this.$loading({
              lock: true,
              text: '正在解锁中，请稍等...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            });
            var callback = function(data){
              loading.close();
              if(data.errcode==0){
                that.queryWhiteList();
                that.$message({
                  message: '解锁成功！',
                  type: 'success'
                });
              }else{
                that.$message.error(data.msg);
              }
            }
            list.status=0;
            var pools = [];
            for (var i = 0; i < list.length; i++) {
              pools.push({id:list[i].id,virtualNum:list[i].virtualNum});
            };
            that.requestAPI("/freePools",{pools:pools},callback);
          })
          .catch(_ => {});
      },
      queryWhiteList: function(){
        var that = this;
        that.selectList = [];
        var callback = function(data){
          for (var i = 0; i < data.data.content.length; i++) {
            if(data.data.content[i].status==1){
              data.data.content[i].statusV = "使用中";
            }else if(data.data.content[i].status==2){
              data.data.content[i].statusV = "已锁定";
            }else{
              data.data.content[i].statusV = "闲置中";
            }
          };
          that.tableData = data.data.content;
        }
        that.requestAPI("/queryPools",{phone:that.search,status:that.statusValue},callback);
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
          that.requestAPI("/AddPools",data,callback);
        }else{
          that.requestAPI("/updatePools",data,callback);
        }
      },
    },
  };
</script>
