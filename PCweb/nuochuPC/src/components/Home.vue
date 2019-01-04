<template>
  <div>
    <div>
      欢迎使用挪车号码牌商户管理平台。
      <el-button style="margin: 0 50px;" type="primary" @click="getMaxConcurrency()">获取最大并发量</el-button>
      <span style="margin-right: 10px;" v-if="maxNum>0">最大并发量:</span><span style="font-size: 30px;color: red;vertical-align: middle;" v-if="maxNum>0">{{maxNum}}</span>
    </div>
    <div style="margin-top: 50px;">目前已有<span style="font-size: 30px;color: red;">{{total.userNum||0}}</span>人使用！！</div>
    <div>目前已有<span style="font-size: 30px;color: red;">{{total.callNum||0}}</span>使用人次！！</div>
    <div>目前已有<span style="font-size: 30px;color: red;">{{total.codeNum||0}}</span>个小程序码！！</div>
    <div>目前总通话时间为<span style="font-size: 30px;color: red;">{{total.timeNum||0}}</span>分种（这是阿里供应商，按分钟计费，从2018-12-17开始）！！</div>
    <div style="margin-top: 30px;">今日已有<span style="font-size: 30px;color: red;">{{dayNum.userNumDay||0}}</span>人注册！！</div>
    <div>今日已有<span style="font-size: 30px;color: red;">{{dayNum.callNumDay||0}}</span>使用人次！！</div>
    <el-row>
      <el-col :span="9"><div class="grid-content bg-purple" style="min-height: 2px;"></div></el-col>
      <el-col :span="9">
        <el-button v-for="(item, index) in btnList" :key="item.name" :type="item.btn" @click="changeType(index)">{{item.name}}</el-button>
      </el-col>
      <el-col :span="6"><div class="grid-content bg-purple" style="min-height: 2px;"></div></el-col>
    </el-row>
    <div id="myChart"></div>
  </div>
</template>
<style>
  #myChart {
    width: 95%;
    height: 300px;
    margin: 20px auto;
    border: 1px solid #CCC
  }
</style>

<script>
  var echarts = equire([
    // 写上你需要的
    'line',
    "tooltip",
    'legend',
    'title',
  ]);
  export default {
    name: 'Home',
    data() {
      // const item = {
      //   id: '1',
      //   phone: '13714059174',
      //   status: '生效中',
      //   reason: '用于免短信验证码注册和修改',
      //   createTime:'2018-11-20 14:36:00'
      // };
      return {
        // tableData: Array(10).fill(item),
        total: {},
        maxNum: 0,
        dayNum: {},
        btnList:[{name:"一周内",btn:"primary"},{name:"15天内",btn:"default"},{name:"一个月内",btn:"default"}]
      }
    },
    mounted: function(){
      this.changeType(0);
      this.queryCount();
      var day = this.formatTime(new Date(),'yyyy-MM-dd');
      this.queryCountDay(day);
    },
    methods: {
      changeType: function(num){
        var that = this;
        for (var i = 0; i < that.btnList.length; i++) {
          if(num==i){
            that.btnList[i].btn = "primary";
          }else{
            that.btnList[i].btn = "default";
          }
        };
        var now = new Date().getTime();
        var offset = 7*24*60*60*1000;
        if(num==1){
          offset = 15*24*60*60*1000;
        }else if(num==2){
          offset = 30*24*60*60*1000;
        }
        var day = that.formatTime(new Date(now-offset),'yyyy-MM-dd');
        that.queryDaysData(day);
      },
      draw:function (theData) {
        // 实例化echarts对象
        var myChart = echarts.init(document.getElementById('myChart'));
        var option = {
          title: {
              text: '数据统计'
          },
          tooltip: {
              trigger: 'axis'
          },
          legend: {
              data:['注册人数','使用人次']
          },
          grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
          },
          toolbox: {
              feature: {
                  saveAsImage: {}
              }
          },
          xAxis: {
              type: 'category',
              boundaryGap: false,
              data: ['周一','周二','周三','周四','周五','周六','周日']
          },
          yAxis: {
              type: 'value'
          },
          series: [
            {
                name:'注册人数',
                type:'line',
                // stack: '总量',//启用后Y轴量级单位就会变成注册人数和使用人次的总和
                data:[120, 132, 101, 134, 90, 230, 210]
            },
            {
                name:'使用人次',
                type:'line',
                // stack: '总量',
                data:[220, 182, 191, 234, 290, 330, 310]
            }
          ]
        };
        var times = [];
        for (var i = theData.userList.length-1; i >= 0; i--) {
          times.push(theData.userList[i].time);
        };
        option.xAxis.data = times;
        var value1 = [];
        var value2 = [];
        for (var i = theData.userList.length-1; i >= 0; i--) {
          value1.push(theData.userList[i].count);
          value2.push(theData.callList[i].count);
        };
        option.series[0].data = value1;
        option.series[1].data = value2;
        myChart.setOption(option);
      },
      queryCount: function(){
        var that = this;
        var callback = function(data){
          if(data.errcode==0){
            that.total = data.data;
          }else{
            that.$message.error(data.msg);
          }
        }
        that.requestAPI("/queryTotalNum",{},callback);
      },
      queryCountDay: function(day){
        var that = this;
        var callback = function(data){
          if(data.errcode==0){
            that.dayNum = data.data;
          }else{
            that.$message.error(data.msg);
          }
        }
        that.requestAPI("/queryDayNum",{day:day},callback);
      },
      queryDaysData: function(day){
        var that = this;
        var callback = function(data){
          if(data.errcode==0){
            that.draw(data.data);
          }else{
            that.$message.error(data.msg);
          }
        }
        that.requestAPI("/queryDaysList",{day:day},callback);
      },
      getMaxConcurrency: function(){
        var that = this;
        var callback = function(data){
          if(data.errcode==0){
            that.maxNum = data.data.maxNum;
          }
        }
        that.requestAPI("/queryMaxConcurrency",{},callback);
      }
    },
  };
</script>
