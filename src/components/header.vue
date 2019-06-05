<template>
  <div :class="['header',tabIndex==0||tabIndex==-1?'':tabIndex==1?'vtrade-header':'header-low']">
    <div class="left-wrap">
      <div class="logo" @click="toDesktop()">
        <img class="logo-icon" src="@/assets/imgs/header/logo.png"/>
        <!-- <span>佩奇大赛</span> -->
        <img class="logo-text" v-show="tabIndex==0||tabIndex==-1||tabIndex==1" src="@/assets/imgs/header/text1.png"/>
        <img class="logo-text" v-show="tabIndex!=0&&tabIndex!=-1&&tabIndex!=1" src="@/assets/imgs/header/text2.png"/>
      </div>
      <div class="tabs-wrap">
        <ul class="tabs">
          <li
            :class="['tab-item',tabIndex==index?'tab-item-active':'']"
            v-for="(item,index) in tabs" :key="index"
            @click="switchTab(item,index)"
          >
            <!-- <span v-if="item.name=='领红包'" class="new-tip">
                <span class="tip-text">
                    New
                    <span class="triangle"></span>
                </span>
            </span> -->
            {{item.name}}
          </li>
        </ul>
      </div>
    </div>
    <div class="func-btn" v-show="isLoginApp">
      <div class="inmoney" v-show="tradeType==1" @click="goToPage({path:'/my/recharge',query:{}})">充值入金</div>
      <div class="moni-money" v-show="tradeType==0" @click="getMoniMoney">领取模拟金</div>
      <div class="user-icon" @click="goToPage({path:'/my/detail',query:{}})">
        <img :src="require(`@/assets/imgs/header/user${tabIndex==0||tabIndex==1?'':'2'}.png`)"/>
      </div>
      <span class="notice-icon">
        <img @click="goToPage({path:'/discover/system',query:{}})"
             :src="require(`@/assets/imgs/header/notice${tabIndex==0||tabIndex==1?'':2}.png`)"/>
      </span>
    </div>
    <div class="func-btn" v-show="!isLoginApp">
      <span class="login-btn" @click="goToPage({path:'/login',query:{tabIndex:1}})">登录</span>
      <span class="register-btn" @click="goToPage({path:'/login',query:{tabIndex:0}})">注册</span>
      <span class="notice-icon">
        <img @click="goToPage({path:'/discover/system',query:{}})"
             :src="require(`@/assets/imgs/header/notice${tabIndex==0||tabIndex==1?'':2}.png`)"/>
      </span>
    </div>
    <div class="header-hover" v-show="isShowHover">
      <div class="header-hover-title">
        <img :src="require('@/assets/imgs/header/user3.png')" @click="goToPage({path:'/my/detail',query:{}})"/>
        <span>
          {{userInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/,"$1****$2")}}
        </span>
      </div>
      <div
        class="header-hover-item"
        v-for="(item,index) in hoverBtn"
        :key="index"
        @click="goToPage(item)"
      >
        <img v-show="tabIndex!=0&&tabIndex!=-1&&tabIndex!=1"
             :src="require('@/assets/imgs/header/hover/t'+index+'.png')"/>
        <img v-show="tabIndex==0||tabIndex==-1||tabIndex==1"
             :src="require('@/assets/imgs/header/hover/'+index+'.png')"/>
        <span>
          {{item.name}}
        </span>
      </div>
    </div>
    <div class="notice-hover" v-show="isShowNotiveHover">
      <div
        class="notice-hover-item"
        v-for="(item,index) in noticeList"
        :key="index"
        v-html="item.title"
        @click="goToPage({path:'/discover/system',query:{index:index}})"
      >
      </div>
    </div>
    <login ref="login" id="login" class="layer-content"></login>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import Login from "../app/login";

  export default {
    components: {Login},
    data() {
      return {
        tabs: [{
          name: '首页',
          route: '/home'
        }, {
          name: '模拟交易',
          route: '/home'
        }, {
          name: '7x24资讯',
          route: '/discover/information'
        }, {
          name: '新手指引',
          route: '/other/guide'
        }, {
          name: '领红包',
          route: '/discover/task'
        },],
        isShowHover: false,
        isShowNotiveHover: false,
        noticeList: [],
        hoverBtn: [{
          name: '历史成交',
          path: '/my/history',
          query: {},
        }, {
          name: '资金明细',
          path: '/my/detail',
          query: {},
        }, {
          name: '提现出金',
          path: '/my/cash',
          query: {},
        }, {
          name: '我的红包',
          path: '/my/red',
          query: {},
        }, {
          name: '分享赚钱',
          path: '/my/money',
          query: {},
        }, {
          name: '退出',
          path: '/login',
          query: {},
        }],
        tabIndex: 0,
        isSendData: false,
        waitTime: 1000,
      }
    },
    mounted() {
      const url = this.$route.path;
      if (url.indexOf("home") > -1) {
        this.tabIndex = 0;
        this.$store.state.tradeType = 1;
      }
      if (url.indexOf("discover") > -1) {
        this.tabIndex = 2;
      }
      if (url.indexOf("my") > -1) {
        this.tabIndex = -2;
      }
      if (url.indexOf('login') > -1) {
        this.tabIndex = -1;
      }
      if (url.indexOf("other") > -1)
        this.tabIndex = -3;
      this.hoverEvent();
      if (this.api != '') {
        this.getNotice();
      }
    },
    computed: {
      ...mapState([
        'isLoginApp',
        'userInfo',
        'tradeType',
        'api',
        'simPrice'
      ])
    },
    watch: {
      '$route'(to) {
        if (document.getElementsByClassName('jx-layer')[0]) {
          document.body.removeChild(document.getElementsByClassName('jx-layer')[0]);
        }
        if (to.path == "/login" || to.path == "/register" || to.path == "/forget")
          this.tabIndex = -1;
        if (to.path.indexOf("my") > -1) {
          if (to.path == "/my/task") {
            this.tabIndex = 5;
          } else {
            this.tabIndex = -2;
          }
        }
        if (to.path.indexOf("other") > -1) {
          if (to.path == "/other/guide")
            this.tabIndex = 3;
          else
            this.tabIndex = -3;
        }
        if (to.path.indexOf("home") > -1) {
          if (this.$store.state.tradeType == 1) {
            this.tabIndex = 0;
          }
          if (this.$store.state.tradeType == 0) {
            this.tabIndex = 1;
          }
        }
        if (to.path.indexOf("discover") > -1) {
          if (to.path == "/discover/information")
            this.tabIndex = 2;
          if (to.path != "/discover/information")
            this.tabIndex = -4;
        }
      },
      api: function () {
        if (this.api != '') {
          this.getNotice();
        }
      }
    },
    methods: {
      switchTab(item, index) {
        if (this.tabIndex != index) {
          if (item.name == "领红包" && !this.isLoginApp) {
            // this.$layer({
            //   headerText: '',
            //   isShowBg: true,
            //   isShowCloseBtn: true,
            //   contentText: '#login'
            // });
            // this.$router.push({path: "/login"});
            this.tabIndex = index;
            this.$router.push({path: item.route});
          } else {
            this.tabIndex = index;
            if (item.name == '首页') {
              this.$store.state.tradeType = 1;
            } else if (item.name == '模拟交易') {
              this.$store.state.tradeType = 0;
            }
            this.$router.push({path: item.route});
          }
        }
      },
      goToPage(item) {
        if (item.name && item.name == '退出') {
          this.quitApp();
          return;
        }
        if (item.path == "/login") {
          this.$store.state.loginTabIndex = item.query.tabIndex;
          this.$layer({
            headerText: '',
            isShowBg: true,
            isShowCloseBtn: true,
            contentText: '#login',
            closeFunc: () => {
              this.$store.state.isShowForget = false;
            }
          });
          return;
        }
        this.isShowHover = false;
        this.isShowNotiveHover = false;
        this.$router.push({
          path: item.path,
          query: item.query
        })
      },
      quitApp() {
        localStorage.removeItem('userInfo');
        this.$store.state.isLoginApp = false;
        this.$store.state.userInfo = {
          mobile: '',
          password: '',
          token: '',
          secret: '',
        };
        this.$store.state.loginInfo = {
          balance: 0,
          isAuth: "010",
          register: "010",
        };
        this.isShowHover = false;
        this.isShowNotiveHover = false;
        this.$store.state.market.marketSocket.close();
        this.$store.state.trade.tradeSocket.close();
        this.$store.state.vtrade.tradeSocket.close();
        this.$store.state.tradeType = 1;
        this.$router.push({
          path: '/home'
        })
      },
      //鼠标悬浮事件
      hoverEvent(classname1, classname2) {
        var timer = null;
        var timer2 = null;
        document.getElementsByClassName('user-icon')[0].onmouseover = () => {
          clearTimeout(timer);
          if (this.isLoginApp) {
            this.isShowHover = true;
          }
        };
        document.getElementsByClassName('user-icon')[0].onmouseout = () => {
          timer = setTimeout(() => {
            this.isShowHover = false;
          }, 100)
          document.getElementsByClassName('header-hover')[0].onmouseover = () => {
            if (this.isLoginApp) {
              clearTimeout(timer);
              this.isShowHover = true;
            }
          };
          document.getElementsByClassName('header-hover')[0].onmouseout = () => {
            if (this.isLoginApp) {
              clearTimeout(timer);
              this.isShowHover = false;
            }
          };
        };

        document.getElementsByClassName('notice-icon')[0].onmouseover = () => {
          clearTimeout(timer2);
          if (this.isLoginApp) {
            this.isShowNotiveHover = true;
          }
        };
        document.getElementsByClassName('notice-icon')[0].onmouseout = () => {
          timer2 = setTimeout(() => {
            this.isShowNotiveHover = false;
          }, 100)
          document.getElementsByClassName('notice-hover')[0].onmouseover = () => {
            if (this.isLoginApp) {
              clearTimeout(timer2);
              this.isShowNotiveHover = true;
            }
          };
          document.getElementsByClassName('notice-hover')[0].onmouseout = () => {
            if (this.isLoginApp) {
              clearTimeout(timer2);
              this.isShowNotiveHover = false;
            }
          };
        };
      },
      //领取模拟金
      getMoniMoney() {
        if (this.isSendData) {
          return;
        }
        this.isSendData = true;
        this.$http.post(this.api + '/receiveSimulatedMoney', {
          amount: this.simPrice
        }, {
          token: this.userInfo.token,
          secret: this.userInfo.secret,
        }).then((res) => {
          if (res.success && res.code == '010') {
            this.$toast({
              content: '领取成功'
            })
            setTimeout(function () {
              this.isSendData = false;
            }.bind(this), this.waitTime)
          } else {
            this.$toast({
              content: res.message
            })
            setTimeout(function () {
              this.isSendData = false;
            }.bind(this), this.waitTime)
          }
        }).catch((err) => {
          setTimeout(function () {
            this.isSendData = false;
          }.bind(this), this.waitTime)
        })
      },
      //获取公告
      getNotice() {
        this.$http.post(this.api + '/noticeList', {
          pageNo: 1,
          pageSize: 5,
          typeCode: '010'
        }).then((res) => {
          if (res.success && res.code == '010') {
            this.noticeList = res.data[0].noticeList;
          } else {
            this.$toast({
              content: res.message,
            })
          }
        }).catch((err) => {
          console.log(err);
        })
      },
      toDesktop() {
        this.$router.push({
          path: '/home'
        })
        // try {
        //   var sUrl = location.href;
        //   var sName = "佩奇大赛";
        //   var WshShell = new ActiveXObject("WScript.shell");
        //   var oUrlLink = WshShell.CreateShortcut(WshShell.SpecialFolders("Desktop")     + "\\" + sName + ".url");
        //   oUrlLink.TargetPath = sUrl;
        //   oUrlLink.Save();
        // }  
        // catch(e)  {
        //   console.log(e);
        //   alert("当前IE安全级别不允许操作！");  
        // }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .header {
    height: 50px;
    background: $tabColor;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    width: 100%;
    box-sizing: border-box;
    position: relative;

    .header-hover {
      position: absolute;
      top: 50px;
      right: 0;
      width: 295px;
      z-index: 999;
      background: $mainColor;
      color: $normalFontColor;

      .header-hover-title {
        padding: 0 20px;
        height: 80px;
        display: flex;
        align-items: center;
        border-bottom: solid 1px $positionBorderColor;

        img {
          cursor: pointer;
          width: 40px;
          height: 40px;
          margin-right: 10px;
        }
      }

      .header-hover-item {
        height: 50px;
        display: flex;
        align-items: center;
        padding-left: 20px;
        cursor: pointer;
        border-bottom: solid 1px $positionBorderColor;

        img {
          width: 16px;
          height: 16px;
          margin-right: 16px;
        }
      }

      .header-hover-item:hover {
        background: $tabColor;
      }
    }

    .notice-hover {
      position: absolute;
      top: 50px;
      right: 0;
      width: 295px;
      z-index: 999;
      background: $mainColor;
      color: $normalFontColor;

      .notice-hover-item {
        cursor: pointer;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: 50px;
        padding-left: 20px;
        border-bottom: solid 1px $positionBorderColor;
      }

      .notice-hover-item:hover {
        background: $tabColor;
      }
    }

    .left-wrap {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      color: $logoColor;
      font-size: 20px;
      display: flex;
      align-items: center;
      margin-right: 80px;

      .logo-icon {
        width: 30px;
        height: 30px;
        margin-right: 10px;
      }

      .logo-text {
        width: 80px;
        height: 20px;
      }
    }

    .tabs-wrap {
      height: 100%;

      .tabs {
        height: 100%;
        display: flex;
        color: $normalFontColor;
        font-size: 16px;

        .tab-item {
          height: 100%;
          display: flex;
          align-items: center;
          margin-right: 40px;
          position: relative;
          cursor: pointer;
        }

        .tab-item:hover {
          color: $activeFontColor;
        }

        .tab-item:last-child {
          margin-right: 0px;
        }

        .tab-item-active {
          color: $activeFontColor;
          position: relative;
          font-weight: bold;
        }

        .tab-item-active::after {
          content: '';
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 4px;
          background: $activeTabColor;
          left: 0;
        }

        .new-tip {
          position: absolute;
          top: 0;
          right: -10px;

          .tip-text {
            font-size: 12px;
            background: $tipBgColor;
            color: $tipFontColor;
            text-align: center;
            position: relative;

            .triangle {
              top: 8px;
              right: 2px;
              position: absolute;
              width: 0;
              height: 0;
              border: solid 6px rgba(0, 0, 0, 0);
              border-bottom-color: $tipBgColor2;
              transform: rotate(-45deg);
            }
          }
        }
      }
    }

    .func-btn {
      float: right;
      display: flex;

      .inmoney {
        background: $activeTabColor;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 10px;
        cursor: pointer;
      }

      .moni-money {
        display: flex;
        justify-content: center;
        align-items: center;
        color: $normalRiskColor;
        text-decoration: underline;
        margin-left: 20px;
        cursor: pointer;
      }

      .user-icon {
        margin: 0 20px;

        img {
          width: 30px;
          height: 30px;
          cursor: pointer;
        }
      }

      .notice-icon {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 40px;
        border-left: solid 1px $borderColor;

        img {
          cursor: pointer;
          width: 20px;
          height: 20px;
        }
      }

      .login-btn {
        color: $normalFontColor;
        display: flex;
        align-items: center;
        margin-right: 20px;
        cursor: pointer;
      }

      .register-btn {
        width: 60px;
        height: 30px;
        background: $activeTabColor;
        display: flex;
        justify-content: center;
        align-items: center;
        color: $activeFontColor;
        cursor: pointer;
      }
    }
  }

  .vtrade-header {
    background: $vtradeTabColor;
  }

  .header-low {
    background: $mainLowColor;
    // padding: 0;
    // border-bottom: solid 1px $borderLowColor;
    // width: 1200px;

    .header-hover {
      background: $mainLowColor;
      color: $normalLowFontColor;

      .header-hover-title {
        border-bottom: solid 1px $lowBorderLineColor;
      }

      .header-hover-item {
        border-bottom: solid 1px $lowBorderLineColor;
      }

      .header-hover-item:hover {
        background: $lowBorderLineColor;
      }
    }

    .notice-hover {
      background: $mainLowColor;
      color: $normalLowFontColor;

      .notice-hover-item {
        border-bottom: solid 1px $lowBorderLineColor;
      }

      .notice-hover-item:hover {
        background: $lowBorderLineColor;
      }
    }

    .logo {
      color: $logoLowColor;
    }

    .tabs-wrap {
      .tabs {
        color: $normalLowFontColor;

        .tab-item:hover {
          color: $activeLowFontColor;
        }

        .tab-item-active {
          color: $activeLowFontColor;
        }

        .tab-item-active::after {
          background: $activeLowTabColor;
        }
      }
    }

    .func-btn {
      .inmoney {
        background: $activeLowTabColor;
      }

      .notice-icon {
        border-left: solid 1px $borderLowColor;
      }

      .login-btn {
        color: $normalLowFontColor;
      }
    }
  }
</style>

