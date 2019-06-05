<template>
  <Contain id="share" direction="column">
    <div class="head">分享赚钱玩法<u class="pointer" @click="goMoney">赚钱中心>></u></div>
    <div class="scroll">
      <div class="content">
        <img class="head-img" src="../.././assets/imgs/discover/share_head.png">
        <div class="method">
          <div class="title">玩法介绍</div>
          <p>玩法：分享自己的邀请码，好友通过邀请码注册并交易，
            产生的手续费可按比例提成到自己的账户余额。余额可用于开户保证金、
            手续费的抵扣，或者满足要求直接提现。<br>
            参与对象：所有注册用户<br>
            分享层级：2级；用户A分享给B为1级，B分享给C为2级，此时A可以同时享受B和C的交易手续费提成。
          </p>
        </div>
        <div class="detail">
          <div class="share-channel">
            <div class="title">分享渠道</div>
            <Contain>
              <template v-for="(item,index) in channels">
                <Contain direction="column" class="item" :key="index">
                  <img :src="item.icon">
                  <span>{{item.title}}</span>
                </Contain>
              </template>
            </Contain>
          </div>
          <div class="example">
            <div class="title">图解示例</div>
            <img src="../.././assets/imgs/discover/group.png">
          </div>
          <div class="example">
            <div class="title">案例说明</div>
            <p>
              小A是平台注册用户，通过二维码分享给B1，B1在平台上交易了国际原油，产生了1000元手续费，此时，
              小A可以获得的手续费提 成为1000元*6%=60元。 接着，B1通过分享邀请码给C1，C1交易了美黄金产生
              了1000元手续费，此时小A还能够新获得1000元*2%=20元的手续费提成。 同时，B1还可以获得C1交易费
              的6%，即60元。
            </p>
          </div>
          <div class="notice">*提成的金额直接充值到账户余额，可用于各项支出，也可满足条件后直接提现</div>
        </div>
      </div>
    </div>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import {mapState} from 'vuex';

  export default {
    name: "share",
    components: {Contain},
    computed: {
      ...mapState(['isLoginApp'])
    },
    data() {
      return {
        channels: [{icon: require("../.././assets/imgs/discover/url_share.png"), title: "链接分享"},
          {icon: require("../.././assets/imgs/discover/qr_code.png"), title: "二维码分享"},
          {icon: require("../.././assets/imgs/discover/inviting_code.png"), title: "推荐码分享"},
          {icon: require("../.././assets/imgs/discover/media.png"), title: "社交媒体分享"}]
      }
    },
    methods: {
      goMoney() {
        if (this.isLoginApp) {
          this.$router.push({path: "/my/money"});
        } else {
          this.$toast({content: "请先登录", position: "middle"});
        }
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

  #share {
    position: relative;

    .head {
      height: 50px;
      line-height: 50px;
      width: 100%;
      top: 0;
      z-index: 2;
      position: absolute;
      text-align: center;
      background-color: white;
      color: #333333;
      font-size: 16px;

      u {
        right: 10px;
        width: auto;
        height: auto;
        min-width: auto;
        min-height: auto;
        position: absolute;
        color: #1873f2;
        font-size: 14px;
      }
    }

    .scroll {
      flex: 1;
      overflow-y: auto;
      position: relative;

      .content {
        top: 50px;
        width: 100%;
        z-index: 1;
        position: absolute;

        .head-img {
          width: 100%;
          height: 480px;
          position: relative;
          z-index: 1;
        }

        .method {
          width: 100%;
          height: 180px;
          z-index: 2;
          margin-top: -60px;
          padding-top: 20px;
          position: relative;
          background: url("../.././assets/imgs/discover/bg.png") no-repeat;
          background-size: 100% 100%;

          p {
            color: #793b02;
            font-size: 14px;
            padding: 20px;
            line-height: 24px;
            text-align: left;
            width: auto;
            height: auto;
            min-width: auto;
            min-height: auto;
          }
        }

        .detail {
          padding: 20px;
          background-color: #fff1a2;

          .share-channel {
            background-color: white;
            padding: 20px 0;

            > .contain {
              align-items: center;
              justify-content: space-around;
              margin-top: 20px;

              .item {
                align-items: center;
                justify-content: center;

                img {
                  width: 60px;
                  height: 60px;
                  margin-bottom: 10px;
                }
              }
            }
          }

          .example {
            padding: 20px;
            margin-top: 20px;
            background-color: white;

            img {
              margin-top: 20px;
            }

            p {
              color: #793b02;
              font-size: 14px;
              padding: 20px;
              line-height: 24px;
              text-align: left;
              width: auto;
              height: auto;
              min-width: auto;
              min-height: auto;
            }
          }
        }

        .notice {
          margin-top: 20px;
          color: #e74a29;
          font-size: 14px;
        }
      }
    }

    .title {
      width: 165px;
      height: 40px;
      margin: 0 auto;
      text-align: center;
      line-height: 40px;
      color: white;
      font-size: 20px;
      background: url("../.././assets/imgs/discover/text_bg.png") no-repeat;
      background-size: 100% 100%;
    }
  }
</style>
