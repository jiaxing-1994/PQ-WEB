<template>
    <router-view/>
</template>

<script>
export default {
  name: 'App',
  beforeCreate(){
    if(isMobile()){
      window.location.href = "http://mpt.dktai.cn/"
    }
    function isMobile(){
      var ua = navigator.userAgent;
      var ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      isAndroid = ua.match(/(Android)\s+([\d.]+)/),
      isMobile = isIphone || isAndroid;
      if(isMobile) {
          return true;
      }else {
          return false;
      }
    }
  }
}
</script>

<style lang="scss">
html,body,a{
  height: 100%;
  width: 100%;
  text-align: center;
  margin: 0;
  min-width: 1280px;
  // min-height: 720px;
}
ul,li{
  margin: 0;
  padding: 0;
  list-style: none;
}
input{
  background: none;
  border: none;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type="number"]{
  -moz-appearance: textfield;
}
input:focus{
  outline: none;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 14px;
}
/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar
{
    width: 8px;
    height: 8px;
    background-color: $scrollBgColor;
}
/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track
{
    border-radius: 0px;
    background-color: $scrollBgColor;
}
/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb
{
    border-radius: 5px;
    background-color: $scrollBarColor;
}
/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
.history-scroll-warp::-webkit-scrollbar
{
    width: 8px;
    height: 8px;
    background-color: $scrollLowBgColor;
}
/*定义滚动条轨道 内阴影+圆角*/
.history-scroll-warp::-webkit-scrollbar-track
{
    border-radius: 0px;
    background-color: $scrollLowBgColor;
}
/*定义滑块 内阴影+圆角*/
.history-scroll-warp::-webkit-scrollbar-thumb
{
    border-radius: 5px;
    background-color: $scrollLowBarColor;
}
//仓位操作按钮样式
.position-btn-warp{
    height:20px;
    display: flex;
    align-items: center;
    .position-btn{
        color: $activeFontColor;
        cursor: pointer;
        height: 30px;
        width: 70px;
        background: $btnBgColor;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 10px;
        border-radius: 5px;
    }
}
.no-data{
  width: 100%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
}
.layer-content{
  display: none!important;
}
.no-money-layer{
    .need-money-title{
        color:#666666;
    }
    .need-money-tip{
        color:#999999;
    }
}
</style>
