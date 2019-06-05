<template>
  <Contain id="my" direction="column">
    <Contain class="my" direction="column">
      <Card :flex=0 class="nav">
        <img class="location" src=".././assets/imgs/discover/location.png">
        <span>
        <router-link to="/home">首页</router-link><span>&nbsp;&nbsp;>&nbsp;&nbsp;</span>
        <router-link to="/my/detail">个人中心</router-link><span>&nbsp;&nbsp;>&nbsp;&nbsp;</span>
      </span>
        <span>{{navTitle}}</span>
      </Card>
      <Card class="content" :flex=1>
        <Card :flex=0 class="nav-head">
          <Card :flex=0 :min-width="`260px`" class="my-head">
            <img class="logo" src=".././assets/imgs/my/logo.png">
            <span class="phone">{{userInfo.mobile.substr(0,4)}}****{{userInfo.mobile.substr(8,11)}}</span>
            <div class="sign-btn">
              <img class="pointer" @click="sign"
                   :src="loginInfo.register=='010'?require(`.././assets/imgs/my/sign_btn.png`):require(`.././assets/imgs/my/signed_btn.png`)">
            </div>
          </Card>
          <div class="balance-detail">
            <span class="balance">账户余额<img @click="showNote" class="pointer" src=".././assets/imgs/my/mark.png"></span>
            <div>
              <span>￥{{balance}}</span>
              <label><span class="pointer" :class="selectIndex==-1?'border':''" @click="goCash">提现/出金</span>
                <span class="pointer" :class="selectIndex==-2?'bg':''" @click="goRecharge">充值/入金</span></label>
            </div>
          </div>
          <template v-for="(item,index) in tabs">
            <div class="tab-item pointer" @click="changeTab(item,index)" :class="selectIndex == index ?'selected':''"
                 :key="index">
              <img :src="item.icon">
              <span>{{item.title}}</span>
              <img src=".././assets/imgs/discover/arrow.png">
            </div>
          </template>
        </Card>
        <Card :flex=1 class="nav-content">
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </Card>
      </Card>
      <Card :flex=0 class="footer">
        2019-2020成都盈透科技有限公司&nbsp;版权所有@
      </Card>
    </Contain>
    <div class="layer-content" id="balance-note">
      账户余额：当前账户除去持仓所占用的保证金和盈亏外的资金，相当于您的可用现金，可用于新开仓或提现。
    </div>
  </Contain>
</template>

<script>
  import Contain from "../components/layout/contain";
  import Card from "../components/layout/card";
  import NavTab from "../components/tab/nav-tab";
  import {mapState} from "vuex";
  import {getFormalDate} from ".././util";

  export default {
    components: {NavTab, Card, Contain},
    computed: {
      ...mapState(['api', 'loginInfo', 'isShowPayBox', 'userInfo', 'isLoginApp'])
    },
    data() {
      return {
        navTitle: "分享赚钱",
        selectIndex: 0,
        tabs: [
          {title: "资金明细", url: "/my/detail", icon: require(".././assets/imgs/my/detail.png")},
          {title: "历史成交", url: "/my/history", icon: require(".././assets/imgs/my/history.png")},
          {title: "我的红包", url: "/my/red", icon: require(".././assets/imgs/my/red.png")},
          // {title: "新手任务", url: "/my/task", icon: require(".././assets/imgs/my/task.png")},
          {title: "每日签到", url: "/my/sign", icon: require(".././assets/imgs/my/sign.png")},
          {title: "绑定银行卡", url: "/my/bank", icon: require(".././assets/imgs/my/bank.png")},
          {title: "安全设置", url: "/my/setting", icon: require(".././assets/imgs/my/setting.png")},
          {title: "分享赚钱", url: "/my/money", icon: require(".././assets/imgs/my/share.png")}
        ],
        balance: 0,
        isCanChange: true
      }
    },
    mounted() {
      this.tabs.forEach((item, index) => {
        if (item.url == this.$route.path) {
          this.navTitle = item.title;
          this.selectIndex = index;
        }
      });
      if (this.$route.path.indexOf("recharge") > -1) {
        this.navTitle = "充值入金";
        this.selectIndex = -2;
      } else if (this.$route.path.indexOf("cash") > -1) {
        this.selectIndex = -1;
        this.navTitle = "提现出金";
      }
    },
    activated() {
      if (this.api != "") {
        this.getData();
      }
    },
    methods: {
      showNote() {
        this.$layer({
          headerText: '说明',
          isShowBg: true,
          contentText: '#balance-note',
          btn: [{
            text: '了解了',
            method: '关闭'
          }]
        });
      },
      sign() {
        if (this.loginInfo.register == '010'){
          this.$utils.sign({signinDate: getFormalDate(new Date(), "yyyy-mm-dd")}, (res) => {
            if (res.faceValue) {
              this.$store.state.loginInfo.register = "020";
              let type = res.couponType == "010" ? "现金红包" : "手续费红包";
              this.$toast({content: "签到成功,获得" + res.faceValue + "元" + type, position: 'middle', styleType: 2});
            } else {
              this.$store.state.loginInfo.register = "020";
              this.$toast({content: "签到成功", position: 'middle', styleType: 2});
            }
          });
        }
      },
      goCash() {
        this.selectIndex = -1;
        this.navTitle = "提现出金";
        this.$router.push({path: "/my/cash"});
      },
      goRecharge() {
        this.selectIndex = -2;
        this.navTitle = "充值入金";
        this.$router.push({path: "/my/recharge"});
      },
      changeTab(item, index) {
        if (this.selectIndex == index)
          return;
        if (this.isCanChange) {
          this.isCanChange = false;
          const timer = setTimeout(() => {
            clearTimeout(timer);
            this.isCanChange = true;
          }, 500);
          if (item.url == "/my/bank" && this.userInfo.isAuth == '010') {
            this.$toast({content: "需要先实名认证后才能绑定银行卡", position: "middle"});
          }
          this.selectIndex = index;
          this.$router.push({path: item.url});
        }
      },
      getData() {
        this.$utils.balance(res => {
          this.balance = res.balance;
          this.$store.state.loginInfo = res;
          this.isAuth = res.isAuth;
        });
      }
    },
    watch: {
      '$route'(to) {
        this.tabs.forEach((item, index) => {
          if (to.path == item.url) {
            this.navTitle = item.title;
            this.selectIndex = index;
          }
        });
        if (to.path.indexOf("recharge") > -1) {
          this.navTitle = "充值入金";
          this.selectIndex = -2;
        } else if (to.path.indexOf("cash") > -1) {
          this.selectIndex = -1;
          this.navTitle = "提现出金";
        }
      },
      isLoginApp(val) {
        if (val)
          this.getData();
      }
    }
  }
</script>

<style lang="scss" scoped>

  .pointer {
    cursor: pointer;
  }

  #balance-note {
    font-size: 14px;
    color: #666666;
    padding: 0 20px;
  }

  #my {
    background-color: $bgLowColor;
    width: 100%;

    .my {
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

        .nav-head {
          background-color: white;
          margin-bottom: 10px;
          flex-direction: column;
          align-items: center;

          .my-head {
            min-height: 100px;
            display: flex;
            padding: 0 20px;
            align-items: center;
            background-color: white;
            border-bottom: 1px solid #f2f2f2;

            .logo {
              width: 60px;
              height: 60px;
            }

            .phone {
              font-size: 16px;
              color: #333333;
              margin-left: 10px;
            }

            .sign-btn {
              flex: 1;
              display: flex;
              justify-content: flex-end;
            }
          }

          .balance-detail {
            width: 260px;
            height: 129px;
            padding: 0 20px;
            margin-top: 1px;
            display: flex;
            flex-direction: column;
            background-color: white;

            .balance {
              font-size: 14px;
              color: #666666;
              display: flex;
              height: 29px;
              background-color: white;
              align-items: center;
              justify-content: center;
              border-bottom: 1px solid #f2f2f2;

              img {
                margin-left: 10px;
              }
            }

            div {
              flex: 1;
              display: flex;
              padding-top: 15px;
              padding-bottom: 20px;
              flex-direction: column;
              justify-content: space-between;

              > span {
                font-size: 20px;
                color: #333333;
              }

              label {
                display: flex;
                align-items: center;
                justify-content: center;

                span {
                  width: 118px;
                  height: 28px;
                  text-align: center;
                  line-height: 28px;
                  border-radius: 15px;

                  &:first-child {
                    border: 1px solid #1873f2;
                    color: #1873f2;
                    margin-right: 10px;

                    &.border {
                      color: #ff7e00;
                      border: 1px solid #ff7e00;
                    }
                  }

                  &:last-child {
                    color: white;
                    margin-left: 10px;
                    border: 1px solid #1873f2;
                    background-color: #1873f2;

                    &.bg {
                      border: 1px solid #ff7e00;
                      background-color: #ff7e00;
                    }
                  }
                }
              }
            }
          }

          .tab-item {
            border-top: 1px solid #f2f2f2;
            height: 49px;
            width: 260px;
            padding: 0 20px;
            background-color: white;
            display: flex;
            align-items: center;

            &:last-child {
              border-bottom: 1px solid #f2f2f2;
            }

            span {
              flex: 1;
              margin-left: 10px;
              text-align: left;
            }

            &.selected {
              background-color: #f2f3f5;
            }
          }
        }

        .nav-content {
          margin-left: 10px;
          margin-bottom: 10px;
          height: 100%;
        }
      }

      .footer {
        min-height: 30px;
        display: flex;
        z-index: 99;
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
