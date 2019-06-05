<template>
  <Contain id="other" direction="column">
    <Contain class="other" direction="column">
      <Card :flex=0 class="nav">
        <img class="location" src=".././assets/imgs/discover/location.png">
        <span>
        <router-link to="/home">首页</router-link><span>&nbsp;&nbsp;>&nbsp;&nbsp;</span>
        <span class="back" @click="back">极速开户</span><span>&nbsp;&nbsp;>&nbsp;&nbsp;</span>
      </span>
        <span>开户协议</span>
      </Card>
      <Card :flex=1 class="content">
        <div class="nav-tab">
          <template v-for="(item,index) in tabs">
            <nav-tab :title="item.title" :url="item.url" :key="index"></nav-tab>
          </template>
        </div>
        <Card :flex=1 class="nav-content">
          <router-view></router-view>
        </Card>
      </Card>
      <Card :flex=0 class="footer">
        2019-2020成都盈透科技有限公司&nbsp;版权所有@
      </Card>
    </Contain>
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
        tabs: [
          {title: "新手指引", url: "/other/guide"},
          {title: "开户协议", url: "/other/agreement"}
        ]
      }
    },
    methods: {
      back() {
        this.$router.back();
      }
    }
  }
</script>

<style lang="scss" scoped>
  #other {
    background-color: $bgLowColor;
    width: 100%;

    .other {
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

        .back {
          cursor: pointer;
        }
      }

      .content {
        margin-bottom: 50px;

        .nav-tab {
          width: 300px;
        }

        .nav-content {
          margin-left: 10px;
          margin-bottom: 10px;
          /*margin-top: 0;*/
          /*text-align: left;*/
          /*color: #666666;*/
          /*font-size: 14px;*/
          /*padding: 20px;*/
          /*background-color: white;*/
        }
      }

      .footer {
        min-height: 30px;
        display: flex;
        color: #6b7399;
        font-size: 12px;
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
