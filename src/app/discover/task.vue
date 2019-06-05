<template>
  <Contain id="task" direction="column">
    <img src="../../assets/imgs/discover/gift_bg.png">
    <div class="title">新手大礼包</div>
    <div class="content">
      <template v-if="list.length>0" v-for="(item,index) in list">
        <div :key="index" class="item" @click="goComplete(item)"
             :class="(item.complatedStatus == '010'||item.received=='010')?'':'completed'">
          <img :src="require(`../.././assets/imgs/discover/gift${index+1}.png`)">
          <span>{{item.activityName}}</span>
          <label class="pointer">{{item.complatedStatus == '010'?'去完成':item.complatedStatus ==
            '030'?'无法完成':item.received ==
            '010'?'去领取':'已完成'}}</label>
        </div>
      </template>
    </div>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import {mapState} from 'vuex';

  export default {
    name: "task",
    components: {Contain},
    computed: {
      ...mapState(['api', 'userInfo', 'isLoginApp'])
    },
    activated() {
      if (this.api != "")
        this.getData();
    },
    watch: {
      api() {
        this.getData()
      }
    },
    data() {
      return {
        list: []
      }
    },
    methods: {
      goComplete(item) {
        if (item.complatedStatus == '010' || item.received == '010') {
          if (item.activityType == '050'){
            this.$store.state.loginTabIndex = 0;
            this.$layer({
              headerText: '',
              isShowBg: true,
              isShowCloseBtn: true,
              contentText: '#login',
              closeFunc:()=>{
                this.$store.state.isShowForget = false;
              }
            });
          } else if (item.activityType == '020') {
            this.$store.state.tradeType = 0;
            this.$router.push({path: '/home'});
          } else if (item.activityType == '021') {
            if (this.isLoginApp)
              this.$router.push({path: '/my/recharge'});
            else
              this.$toast({content: "请先登录", position: "middle"});
          } else if (item.activityType == '022') {
            this.$store.state.tradeType = 1;
            this.$router.push({path: '/home'});
          }
        }
      },
      getData() {
        this.$utils.activityList({activityType: "050,020,021,022"}, res => {
          this.list = res;
          this.list.forEach(item => {
            if (!item.complatedStatus)
              item.complatedStatus = "010";
          });
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  #task {
    background-color: white;
    margin-bottom: 10px;

    > img {
      height: 110px;
    }

    .title {
      height: 49px;
      display: inline-block;
      line-height: 49px;
      color: #333333;
      font-size: 16px;
      padding-left: 20px;
      text-align: left;
      background-color: white;
      position: relative;
      border-bottom: 1px solid #f2f2f2;

      &:before {
        position: absolute;
        content: '';
        display: inline-block;
        width: 4px;
        height: 50px;
        left: 0;
        background-color: #1873f2;
      }
    }

    .content {
      padding: 0 20px;

      .item {
        display: flex;
        align-items: center;
        height: 60px;
        position: relative;
        border-bottom: 1px solid #f2f2f2;

        img {
          width: 20px;
          height: 20px;
          float: left;
          margin-right: 10px;
        }

        span {
          font-size: 16px;
          color: #333333;
        }

        label {
          right: 0;
          display: inline-block;
          position: absolute;
          width: 90px;
          height: 30px;
          color: white;
          text-align: center;
          line-height: 30px;
          font-size: 16px;
          background: linear-gradient(#fd5c1f, #fe3024);

        }

        &.completed {
          span {
            font-size: 14px;
            color: #999999;
          }

          label {
            background: linear-gradient(#ffb369, #ff9791);
          }
        }
      }
    }
  }
</style>
