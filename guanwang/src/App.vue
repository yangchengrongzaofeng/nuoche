<template>
  <div class="contentBox">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
  html,body{
    width: 100%;
    margin: 0;
    padding: 0;
  }
  ::-webkit-scrollbar{width:0px;}
  .contentBox {
    position: relative;
    width: 100%;
    /*overflow: hidden;*/
    margin: 0;
    padding: 0;
    color: #000;
  }
  .contentBody{
    width: 100%;
    /*overflow-x: hidden;
    overflow-y: scroll;*/
    /*-webkit-overflow-scrolling: touch;*/
  }
</style>
