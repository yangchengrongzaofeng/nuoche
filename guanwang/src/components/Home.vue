<template>
  <div class="contentBody" style="background-color: #fff;">
    <div class="logo">
      <img class="logoimg" src="../assets/img/logo_.png">
      <div class="spit"></div>
      <img class="logoel" src="../assets/img/logoEL.png">
      <!-- <div class="logoname">早风科技</div> -->
      <div class="logotab">
        <span @click="scrollDiv(height1)">首页</span>
        <span @click="scrollDiv(height2)">产品</span>
        <span @click="scrollDiv(height3)">关于早风</span>
      </div>
    </div>
    <el-carousel id="bannerHead" :autoplay="true" :interval="2000" indicator-position="none" arrow="always">
      <el-carousel-item>
        <div class="img1">
          <img src="../assets/img/p1.jpg">
        </div>
      </el-carousel-item>
      <el-carousel-item>
        <div class="img1">
          <img src="../assets/img/p2.jpg">
        </div>
      </el-carousel-item>
      <el-carousel-item>
        <div class="img1">
          <img src="../assets/img/p3.jpg">
        </div>
      </el-carousel-item>
      <el-carousel-item>
        <div class="img1">
          <img src="../assets/img/p4.jpg">
        </div>
      </el-carousel-item>
    </el-carousel>
    <div class="info1"><span>热卖新品</span></div>
    <div id="img2">
      <el-carousel id="banner" :autoplay="true" :interval="2000" indicator-position="none" arrow="always">
        <el-carousel-item>
          <img src="../assets/img/5_.png">
          <div class="goods">
            <div class="goodsinfo" style="margin-left: 8%;width: 15%;" @click="toOutUrl(15)">
              <img src="../assets/img/2_15.png">
              <div class="goodsname">早风防水透气三合一冲锋衣</div>
              <div class="goodsvalue">649元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 5.5%;width: 15%;" @click="toOutUrl(14)">
              <img src="../assets/img/2_14.png">
              <div class="goodsname">早风专业四季露营帐</div>
              <div class="goodsvalue">399元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 5.5%;width: 15%;" @click="toOutUrl(13)">
              <img src="../assets/img/2_13.png">
              <div class="goodsname">早风亲肤防潮野餐垫</div>
              <div class="goodsvalue">99元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 5.5%;width: 15%;" @click="toOutUrl(12)">
              <img src="../assets/img/2_12.png">
              <div class="goodsname">早风便携烧烤炉</div>
              <div class="goodsvalue">169元</div>
            </div>
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <img src="../assets/img/5_.png">
          <div class="goods">
            <div class="goodsinfo" style="margin-left: 8%;width: 15%;" @click="toOutUrl(11)">
              <img src="../assets/img/2_11.png">
              <div class="goodsname">早风一次性烧烤炉</div>
              <div class="goodsvalue">39元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 5.5%;width: 15%;" @click="toOutUrl(10)">
              <img src="../assets/img/2_10.png">
              <div class="goodsname">早风户外折叠桌</div>
              <div class="goodsvalue">249元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 5.5%;width: 15%;" @click="toOutUrl(9)">
              <img src="../assets/img/2_9.png">
              <div class="goodsname">早风超轻铝合金折叠椅</div>
              <div class="goodsvalue">129元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 5.5%;width: 15%;" @click="toOutUrl(8)">
              <img src="../assets/img/2_8.png">
              <div class="goodsname">早风碳纤维金属外锁登山杖</div>
              <div class="goodsvalue">129元</div>
            </div>
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <img src="../assets/img/5_.png">
          <div class="goods">
            <div class="goodsinfo" style="margin-left: 9.5%;width: 17%;" @click="toOutUrl(7)">
              <img src="../assets/img/2_7.png">
              <div class="goodsname">早风多用全自动帐篷</div>
              <div class="goodsvalue">299元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 2%;width: 22%;" @click="toOutUrl(1)">
              <img src="../assets/img/2_1.png">
              <div class="goodsname">早风防潮野餐垫</div>
              <div class="goodsvalue">79元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 0.5%;width: 22%;" @click="toOutUrl(2)">
              <img src="../assets/img/2_2.png">
              <div class="goodsname">早风3-4人速开帐篷</div>
              <div class="goodsvalue">299元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 0.3%;width: 21.8%;" @click="toOutUrl(4)">
              <img src="../assets/img/2_4.png">
              <div class="goodsname">早风户外单人自动充气垫</div>
              <div class="goodsvalue">129元</div>
            </div>
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <img src="../assets/img/5_.png">
          <div class="goods">
            <div class="goodsinfo" style="margin-left: 11%;width: 19.6%;" @click="toOutUrl(5)">
              <img src="../assets/img/2_5.png">
              <div class="goodsname">早风户外吊床</div>
              <div class="goodsvalue">79元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 0.5%;width: 20%;" @click="toOutUrl(6)">
              <img src="../assets/img/2_6.png">
              <div class="goodsname">早风超轻羽绒睡袋</div>
              <div class="goodsvalue">369元</div>
            </div>
            <div class="goodsinfo" style="margin-left: 2%;width: 15.7%;margin-top: 1.05%;" @click="toOutUrl(16)">
              <img src="../assets/img/2_16.png">
              <div class="goodsname">早风HC户外登山包</div>
              <div class="goodsvalue">299元</div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="info1" style="padding: 50px 0 40px;"><span>关于早风</span></div>
    <div id="img3">
      <img src="../assets/img/3_.jpg">
      <div class="content2">
        <div class="c2text1">我们的愿景</div>
        <div class="c2text2">“让你的出行更加简单快乐，</div>
        <div class="c2text2">从计划开始就充满惊喜。”</div>
      </div>
    </div>
    <div id="img5">
      <img src="../assets/img/4_.jpg">
      <div class="content3">
        <div class="c3text1">加入早风</div>
        <div class="c3text2">不论你是做产品营销，还是做新品研发，只要你有一颗给用户完美产品的心，就联系我们吧</div>
        <div style="padding-left:9%;margin-top:6%;font-size:13px;">邮箱 wangjuan@zaofeng.cn</div>
      </div>
    </div>
    <div class="info1"><span>联系我们</span></div>
    <div class="pageBottom">
      <img src="../assets/img/5_.png">
      <div class="mytabs">
        <div class="tabsbody" style="margin-left: 25%;">
          <div>商务合作</div>
          <div>zhaowei@zaofeng.cn</div>
        </div>
        <div class="tabsbody">
          <div>加入早风</div>
          <div>wangjuan@zaofeng.cn</div>
        </div>
        <div class="tabsbody">
          <div>联系客服</div>
          <div>400-683-1169</div>
        </div>
      </div>
    </div>
    <div class="foot">
      <div>Copyright © 2017 深圳市早风科技有限公司 <span ng-click="openOutLink()">粤ICP备17097891号-2</span></div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Home',
  data () {
    return {
      topValue: 0,
      height1: 0,
      height2: 0,
      height3: 0
    }
  },
  mounted: function(){
    var that = this;
    var img = new Image();
    img.onload = function(){
      console.log('in');
      that.setBoxH();
    }
    img.src = "/static/img/2_.jpg";
    console.log(window.innerWidth);
    console.log(window.innerHeight);
    window.onresize = function(){
      that.setBoxH();
    }
  },
  methods: {
    setBoxH: function(){
      var bHB = $("#bannerHead").width()*876/1920;
      $("#bannerHead").height(bHB);//直接设置元素的高
      var bH = $("#banner").width()*524/1920;
      $("#banner").height(bH);//直接设置元素的高
      this.height2 = $("#img2")[0].offsetTop-150;
      this.height3 = $("#img3")[0].offsetTop-150;
    },
    scrollDiv: function(value){
      var that = this;
      var siv = setInterval(function(){
        that.topValue+=50;
        if(that.topValue>=value){
          clearInterval(siv);
          siv = null;
        }else{
          window.scrollTo(0,that.topValue);
        }
      },10);
    },
    toOutUrl: function(type){//1 防潮野餐垫,2 帐篷,3 登山杖
      var url = 'https://youpin.mi.com/detail?gid=101641&pid=9511';
      if(type==2){
        url = 'https://youpin.mi.com/detail?gid=101627&pid=9479';
      }else if(type==3){
        url = 'https://youpin.mi.com/detail?gid=101643&pid=9513';
      }else if(type==4){
        url = 'https://youpin.mi.com/detail?gid=101790&pid=10158';
      }else if(type==5){
        url = 'https://youpin.mi.com/detail?gid=102349&pid=12587';
      }else if(type==6){
        url = 'https://youpin.mi.com/detail?gid=102538&pid=13311';
      }else if(type==7){
        url = 'https://youpin.mi.com/detail?gid=102710';
      }else if(type==8){
        url = 'https://youpin.mi.com/detail?gid=103423';
      }else if(type==9){
        url = 'https://youpin.mi.com/detail?gid=103509';
      }else if(type==10){
        url = 'https://youpin.mi.com/detail?gid=103574';
      }else if(type==11){
        url = 'https://youpin.mi.com/detail?gid=103558';
      }else if(type==12){
        url = 'https://youpin.mi.com/detail?gid=103347';
      }else if(type==13){
        url = 'https://youpin.mi.com/detail?gid=103589';
      }else if(type==14){
        url = 'https://youpin.mi.com/detail?gid=103792';
      }else if(type==15){
        url = 'https://youpin.mi.com/detail?gid=104184';
      }else if(type==16){
        url = 'https://youpin.mi.com/detail?gid=104560';
      }
      window.open(url);
    }
  }
}
</script>
<style scoped>
  .logo{
    position: relative;
    background-color: #33383a;
    width: 100%;
  }
  .logoimg{
    width: 2.5%;
    padding: 8px 0;
    margin-left: 9.8%;
    vertical-align: middle;
  }
  .logoel{
    width: 3.5%;
    padding: 8px 0;
    vertical-align: middle;
  }
  .logo > div{
    vertical-align: middle;
    display: inline-block;
    color: #fff;
  }
  .logoname{
    font-size: 16px;
    margin-left: 0.1%;
  }
  .logotab{
    font-size: 16px;
    margin-left: 18%;
    width: 50%;
    text-align: right;
  }
  .logotab span{
    margin-left: 7%;
    cursor: pointer;
    display: inline-block;
  }
  .logotab span:hover{
    color: #09CCBE;
  }
  .spit{
    border-right: 1px solid #fff;
    display: inline-block;
    vertical-align: middle;
    color: #fff;
    height: 30px;
    margin-right: 6px;
  }
  .info1{
    background-color: #fff;
    font-size: 24px;
    text-align: center;
    padding-top: 100px;
  }
  .info1 span{
    border-bottom: 4px solid #000;
    display: inline-block;
    padding-bottom: 10px;
  }
  .content1{
    position: absolute;
    top: 31.5%;
    width: 100%;
    text-align: center;
  }
  .c1text1{
    font-size: 44px;
    color: #2a2f2e;
    font-weight: bold;
    letter-spacing: 6px;
    padding-left: 5%;
    margin-bottom: 1%;
  }
  .c1text2{
    font-size: 23px;
    color: #37393b;
    padding-left: 5%;
    letter-spacing: 1px;
  }
  .content2{
    position: absolute;
    top: 24%;
    right: 0;
    color: #fff;
    text-align: left;
    width: 50%;
  }
  .c2text1{
    font-size: 17px;
    letter-spacing: 1px;
    padding-left: 12.5%;
    margin-bottom: 1.5%;
  }
  .c2text2{
    font-size: 32px;
    font-weight: bold;
    padding-left: 13%;
    letter-spacing: 4px;
  }
  .content3{
    position: absolute;
    top: 26%;
    left: 1%;
    color: #fff;
    text-align: left;
    width: 43%;
  }
  .c3text1{
    font-size: 17px;
    letter-spacing: 1px;
    padding-left: 9.5%;
    margin-bottom: 2%;
  }
  .c3text2{
    font-size: 32px;
    font-weight: bold;
    padding-left: 9%;
    letter-spacing: 4px;
  }
  .goods{
    position: absolute;
    top: 10.5%;
    left: 0;
    width: 100%;
  }
  .goodsinfo{
    display: inline-block;
    vertical-align: top;
    font-size: 15px;
    font-weight: bold;
    text-align: center;
  }
  .goodsname{
    margin-bottom: 1%;
    color: #464646;
    cursor: pointer;
  }
  .goodsvalue{
    color: #c13f52;
    cursor: pointer;
  } 
  .img1,#img2,#img3,#img4,#img5{
    width: 100%;
  }
  .img1{
    position: relative;
  }
  #img3{
    position: relative;
  }
  #img5{
    position: relative;
  }
 .img1 img,#img2 img,#img3 img,#img4 img,#img5 img{
    width: 100%;
  }
  .pageBottom{
    position: relative;
    width: 100%;
  }
  .pageBottom > img{
    width: 100%;
  }
  .mytabs{
    position: absolute;
    top: 35%;
    width: 100%;
  }
  .tabsbody{
    display: inline-block;
    font-size: 16px;
    color: #666666;
    width: 20%;
  }
  .tabsbody > div:first-child{
    font-size: 22px;
    color: #000;
    margin-bottom: 10px;
  }
  .foot{
    height: 50px;
    width: 100%;
    text-align: center;
    margin-bottom: 200px;
  }
  .foot div{
    color: #808080;
    padding-top: 12px;
    font-size: 12px;
  }
  .foot div span:hover{
    cursor: pointer;
    color: #009fff;
  }
  @media screen and (min-width: 768px) and (max-width: 1200px){/* 屏幕大于等于768px小于1200px */
    .c1text1{
      font-size: 40px;
    }
    .c1text2{
      font-size: 19px;
    }
    .c2text2{
      font-size: 28px;
    }
    .content3{
      top: 10%;
    }
    .c3text2{
      font-size: 28px;
    }
    .spit{
      height: 16px;
      margin-right: 4px;
    }
  }
  @media screen and (min-width: 540px) and (max-width: 768px){/* 屏幕大于等于540px小于768px */
    .c1text1{
      font-size: 28px;
    }
    .c1text2{
      font-size: 14px;
    }
    .c2text2{
      font-size: 18px;
    }
    .content3{
      top: 10%;
    }
    .c3text2{
      font-size: 18px;
    }
    .goodsinfo{
      font-size: 13px;
    }
    .tabsbody{
      font-size: 12px;
      /*width: 32%;*/
    }
    .tabsbody:nth-of-type(1){
      margin-left: 19% !important;
    }
    .tabsbody:nth-of-type(2){
      margin-left: 3%;
    }
    .tabsbody:nth-of-type(3){
      width: 23%;
      margin-left: 6%;
    }
    .tabsbody > div:first-child{
      font-size: 18px;
    }
    .spit{
      height: 16px;
      margin-right: 4px;
    }
  }
  @media screen and (max-width: 540px){/* 屏幕小于540px */
    .logoimg{
      width: 6.5%;
    }
    .logoel{
      width: 9.5%;
    }
    .logoname{
      font-size: 13px;
    }
    .logotab{
      font-size: 13px;
      /* margin-left: 13%; */
      margin-left: 0%;
    }
    .content1{
      top:13.5%;
    }
    .c1text1{
      font-size: 20px;
    }
    .c1text2{
      font-size: 14px;
    }
    .info1{
      padding-top: 50px;
      font-size: 22px;
    }
    .c2text1{
      font-size: 12px;
    }
    .c2text2{
      font-size: 13px;
    }
    .content2,.content3{
      transform: scale(0.6);
      transform-origin: center top;
    }
    .c3text1{
      font-size: 12px;
    }
    .c3text2{
      font-size: 13px;
    }
    .goodsinfo{
      font-size: 12px;
      transform: scale(0.55);
      transform-origin: center top;
    }
    .tabsbody{
      font-size: 12px;
      width: 32%;
    }
    .tabsbody:nth-of-type(1){
      margin-left: 1% !important;
    }
    .tabsbody:nth-of-type(2){
      margin-left: 3%;
    }
    .tabsbody:nth-of-type(3){
      width: 23%;
      margin-left: 6%;
    }
    .tabsbody > div:first-child{
      font-size: 14px;
    }
    .foot{
      margin-bottom: 50px;
      transform: scale(0.8);
      transform-origin: center top;
    }
    .spit{
      height: 16px;
      margin-right: 3px;
    }
  }
</style>
<style>
  #bannerHead .el-carousel__container{
    height: 100%;
  }
  #bannerHead .el-carousel__item{
    height: 100%;
  }
  #bannerHead .el-carousel__arrow{
    width: 70px;
    height: 70px;
    font-size: 45px;
  }
  #img2 .el-carousel__container{
    height: 100%;
  }
  #img2 .el-carousel__item{
    height: 100%;
  }
  #img2 .el-carousel__arrow{
    width: 70px;
    height: 70px;
    font-size: 45px;
  }
  @media screen and (min-width: 768px) and (max-width: 1200px){
    #bannerHead .el-carousel__arrow{
      width: 50px;
      height: 50px;
      font-size: 30px;
    }
    #img2 .el-carousel__arrow{
      width: 50px;
      height: 50px;
      font-size: 30px;
    }
  }
  @media screen and (min-width: 540px) and (max-width: 768px){
    #bannerHead .el-carousel__arrow{
      width: 35px;
      height: 35px;
      font-size: 20px;
    }
    #img2 .el-carousel__arrow{
      width: 35px;
      height: 35px;
      font-size: 20px;
    }
  }
  @media screen and (max-width: 540px){
    #bannerHead .el-carousel__arrow{
      width: 30px;
      height: 30px;
      font-size: 18px;
    }
    #img2 .el-carousel__arrow{
      width: 30px;
      height: 30px;
      font-size: 18px;
    }
  }
</style>