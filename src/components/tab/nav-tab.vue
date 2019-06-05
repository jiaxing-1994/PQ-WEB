<template>
  <div :class="$route.path == url?'selected':''" @click="changeTab" class="tab">
    <span>{{title}}</span>
    <img
      :src="$route.path == url?require('../.././assets/imgs/discover/arrow_w.png'):require('../.././assets/imgs/discover/arrow.png')">
  </div>
</template>

<script>
  import Card from "../layout/card";
  import {mapState} from 'vuex';

  export default {
    name: "nav-tab",
    components: {Card},
    computed:{
      ...mapState(['isLoginApp'])
    },
    props: {
      title: {
        type: String,
        default: ''
      },
      url: {
        type: String,
        default: '/discover/system'
      }
    },
    methods: {
      changeTab() {
        if((this.url == "/my/sign" || this.url == "/my/task") && !this.isLoginApp){
          // this.$emit('showLoginNotice')
          this.$store.state.loginTabIndex = 1;
          this.$layer({
            headerText: '',
            isShowBg: true,
            isShowCloseBtn: true,
            contentText: '#login',
            closeFunc:()=>{
              this.$store.state.isShowForget = false;
            }
          });
        } else
          this.$router.push({path: this.url});
      }
    }
  }
</script>

<style lang="scss" scoped>
  .tab {
    cursor: pointer;
    padding: 0 20px;
    min-height: 50px;
    display: flex;
    width: 260px;
    align-items: center;
    margin-bottom: 10px;
    border-radius: 5px;
    font-size: 16px;
    background-color: white;
    color: $normalLowFontColor;
    justify-content: space-between;

    &.selected {
      color: white;
      background-color: #383f66;
    }
  }
</style>
