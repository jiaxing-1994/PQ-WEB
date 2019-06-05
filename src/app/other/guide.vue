<template>
  <Contain id="guide" :flex=1 direction="column">
    <div class="head"><span>完整使用流程</span><u @click="goTask">完成新手任务，领现金红包</u></div>
    <div class="content">
      <div class="scroll">
        <div class="step">
          <div>
            <img src="../.././assets/imgs/common/step1.png">
            <img src="../.././assets/imgs/common/step2.png">
            <img src="../.././assets/imgs/common/step3.png">
          </div>
        </div>
        <div class="title">
          <h2>1、极速开户</h2>
          <span>只需手机号即可完成快速开户</span>
        </div>
        <div class="img">
          <img src="../.././assets/imgs/common/1.png">
        </div>
        <div class="title">
          <h2>2、充值入金</h2>
          <span>支持支付宝等多种入金方式</span>
        </div>
        <div class="img">
          <img src="../.././assets/imgs/common/2.png">
        </div>
        <div class="title">
          <h2>3、交易</h2>
          <span>专业交易系统，支持自定义止盈止损</span>
        </div>
        <div class="img">
          <img src="../.././assets/imgs/common/3.png">
        </div>
      </div>
    </div>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";

  export default {
    name: "guide",
    components: {Contain},
    methods: {
      goTask() {
        this.$router.push({path: '/discover/task'});
      }
    }
  }
</script>

<style lang="scss" scoped>
  /*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
  ::-webkit-scrollbar {
    width: 4px;
    height: 8px;
    left: 0;
    position: absolute;
    background-color: $scrollBgColor;
  }

  /*定义滚动条轨道 内阴影+圆角*/
  ::-webkit-scrollbar-track {
    border-radius: 0;
    background-color: #fafafa;
  }

  /*定义滑块 内阴影+圆角*/
  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: #cccccc;
  }

  #guide {
    .head {
      height: 50px;
      background-color: white;
      position: relative;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f2f2f2;

      span {
        height: 100%;
        display: flex;
        align-items: center;
        position: relative;
        padding-left: 20px;

        &:before {
          content: '';
          position: absolute;
          width: 4px;
          left: 0;
          height: 60%;
          top: 20%;
          background-color: #1873f2;
        }
      }

      u {
        right: 20px;
        cursor: pointer;
        position: absolute;
        color: #1873f2;
      }
    }

    .content {
      flex: 1;
      display: flex;
      background-color: white;
      flex-direction: column;
      position: relative;
      overflow-y: auto;

      .scroll {
        width: 100%;
        position: absolute;
        padding-bottom: 10px;

        .step {
          height: 90px;
          padding: 0 20px;

          div {
            height: 100%;
            border-bottom: 1px solid #f2f2f2;
            display: flex;
            align-items: center;
            background-color: white;
          }
        }

        .title {
          padding: 0 20px;
          text-align: left;
          color: #333333;

          h2 {
            font-size: 16px;
          }

          span {
            font-size: 14px;
          }
        }

        .img {
          margin-top: 10px;
          padding: 0 20px;

          img {
            width: 100%;
          }
        }
      }
    }
  }
</style>
