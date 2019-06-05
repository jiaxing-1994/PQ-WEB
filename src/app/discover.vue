<template>
  <Contain id="discover" direction="column">
    <Contain class="discover" direction="column">
      <Card :flex=0 class="nav">
        <img class="location" src=".././assets/imgs/discover/location.png">
        <span>
        <router-link to="/home">首页</router-link><span>&nbsp;&nbsp;>&nbsp;&nbsp;</span>
        <router-link to="/discover/system">发现</router-link><span>&nbsp;&nbsp;>&nbsp;&nbsp;</span>
      </span>
        <span>{{navTitle}}</span>
      </Card>
      <Card class="content" :flex=1>
        <div class="nav-tab">
          <template v-for="(item,index) in tabs">
            <nav-tab @showLoginNotice="showLoginNotice" :title="item.title" :url="item.url" :key="index"></nav-tab>
          </template>
        </div>
        <Card class="nav-content" :flex=1>
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </Card>
      </Card>
      <Card :flex=0 class="footer">
        2019-2020成都盈透科技有限公司&nbsp;版权所有@
      </Card>
    </Contain>
    <div class="layer-content" id="not-login">
      还未登录，无法查看签到信息，是否前去登录？
    </div>
  </Contain>
</template>

<script>
  import Contain from "../components/layout/contain";
  import Card from "../components/layout/card";
  import NavTab from "../components/tab/nav-tab";

  export default {
    components: {NavTab, Card, Contain},
    data() {
      return {
        navTitle: "7X24资讯",
        tabs: [
          {title: "系统公告", url: "/discover/system"},
          {title: "7X24资讯", url: "/discover/information"},
          {title: "财经日历", url: "/discover/calendar"},
          {title: "分享赚钱", url: "/discover/share"},
          {title: "新手任务", url: "/discover/task"},
          {title: "每日签到", url: "/my/sign"},
        ]
      }
    },
    watch: {
      '$route'(to) {
        this.tabs.forEach(item => {
          if (to.path == item.url) {
            this.navTitle = item.title;
          }
        });
      }
    },
    methods: {
      showLoginNotice() {
        this.$layer({
          headerText: '登录提示',
          isShowBg: true,
          contentText: '#not-login',
          btn: [{
            text: '取消',
            method: '关闭'
          }, {
            text: '确认',
            method: () => {
              this.$router.push("/login")
            }
          }]
        });
      }
    }
  }
</script>

<style lang="scss" scoped>

  #discover {
    background-color: $bgLowColor;
    width: 100%;

    .discover {
      min-width: 1200px;
      max-width: 1200px;
      margin: 0 auto;

      .nav {
        min-height: 50px;
        align-items: center;

        .location {
          width: 20px;
          height: 25px;
          margin-right: 10px;
        }

        span {
          color: #999999;
          font-size: 14px;
        }

        a {
          outline: none;
          text-decoration: none;
          color: #999999;
        }
      }

      .content {
        margin-bottom: 30px;

        .nav-tab {
          width: 300px;
        }

        .nav-content {
          margin-left: 10px;
          margin-bottom: 10px;
        }
      }

      .footer {
        min-height: 30px;
        display: flex;
        color: #6b7399;
        font-size: 12px;
        z-index: 99;
        position: fixed;
        width: 100%;
        bottom: 0;
        left: 0;
        align-items: center;
        justify-content: center;
        background-color: #131625;
      }
    }
  }
</style>
