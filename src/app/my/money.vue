<template>
  <Contain :flex=1 direction="column">
    <input :value="shareUrl" id="shareUrl" readonly type="hidden">
    <Contain v-show="!isShowDetail" id="money" :flex=1 direction="column">
      <div class="head">
        <img src="../.././assets/imgs/my/head.png">
        <span>{{userInfo.mobile.substr(0,4)}}****{{userInfo.mobile.substr(8,11)}}</span>
        <label>￥{{totalProfit}}</label>
      </div>
      <div class="title">
        <span>我要分享</span>
        <label>邀请码：{{shareCode}}</label>
      </div>
      <div class="share">
        <div @click="copyUrl" class="url">
          <img src="../.././assets/imgs/my/copyUrl.png">
          <span>复制链接</span>
        </div>
        <div @click="showCode" class="code">
          <img src="../.././assets/imgs/my/scanCode.png">
          <span>扫描二维码</span>
        </div>
      </div>
      <div class="title">
        <span>分享收益(T+1结算)</span>
        <u class="pointer" @click="toDetail">赚钱流水</u>
      </div>
      <div class="num">
        <label>
          <span>一级佣金</span>
          <span>{{firstLevelProfit}}</span>
        </label>
        <label>
          <span>二级佣金</span>
          <span>{{secLevelProfit}}</span>
        </label>
        <label>
          <span>一级注册</span>
          <span>{{firstLevelNum}}</span>
        </label>
        <label>
          <span>二级注册</span>
          <span>{{secLevelNum}}</span>
        </label>
      </div>
      <p>
        规则举例：<br><br>
        您所推荐的用户在结算方案后，佣金会自动按照比例增加到您的账户余额中，算法：<br><br>
        A.您推荐的一级用户，产生交易手续费1000元，您的收益为：1000元*6%=60元；<br>
        B.您推荐的二级用户，产生交易手续费1000元，您的收益为：1000元*2%=20元；<br><br>
        *本活动禁止通过如自己推荐自己等进行恶意刷手续费返利，违规获得的奖励本平台将有权力不予发放或追回，同时有权限制账号的推荐功
        能。
      </p>
    </Contain>
    <Contain v-show="isShowDetail" id="detail" :flex=1 direction="column">
      <div class="head">
        <span><span class="pointer" @click="isShowDetail=!isShowDetail">分享赚钱</span></span>
        <span class="total">收入总计：<span>￥{{totalProfit}}</span></span>
      </div>
      <div class="search-box">
        <span class="quick-time pointer" @click="changeTime(0)" :class="index==0?'active':''">7天</span>
        <span class="quick-time pointer" @click="changeTime(1)" :class="index==1?'active':''">1月</span>
        <label>
          <span>起始时间：</span>
          <span>
            <img src="../.././assets/imgs/my/calendar.png">
            <input v-model="form.beginDate" @focus="changeTime(2)" class="select-time start">
          </span>
          <span>
            <img src="../.././assets/imgs/my/calendar.png">
            <input v-model="form.endDate" @focus="changeTime(3)" class="select-time end">
          </span>
        </label>
        <u class="pointer" @click="search">查询</u>
      </div>
      <div class="content">
        <div class="scroll">
          <template v-if="detailList.length>0" v-for="(item,index) in detailList">
            <label v-if="item.profit != '0.00'" class="item">
              <span>{{item.profitTime}}</span>
              <span>+{{item.profit}}</span>
            </label>
          </template>
        </div>
      </div>
    </Contain>
    <div class="layer-content" id="code">

    </div>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import {mapState} from 'vuex';
  import {getFormalDate} from '../.././util';

  export default {
    name: "money",
    components: {Contain},
    computed: {
      ...mapState(['api','isLoginApp'])
    },
    activated() {
      if (this.api != "")
        this.getData();
    },
    mounted() {
      laydate.render({
        elem: ".start"
        , trigger: 'click'
        , showBottom: false
        , done: (value, date) => {
          this.form.beginDate = value;
        }
      });
      laydate.render({
        elem: ".end"
        , trigger: 'click'
        , showBottom: false
        , done: (value, date) => {
          this.form.endDate = value;
        }
      });
    },
    watch: {
      isLoginApp(val) {
        if (val)
          this.getData();
      }
    },
    data() {
      return {
        userInfo: JSON.parse(localStorage.getItem("userInfo")),
        mobile: "",
        isShowDetail: false,
        shareCode: 0,
        totalProfit: 0,
        firstLevelNum: 0,
        firstLevelProfit: 0,
        secLevelNum: 0,
        secLevelProfit: 0,
        startTime: "",
        endTime: "",
        index: 0,
        form: {
          beginDate: "",
          endDate: "",
          pageNo: 1,
          pageSize: 20
        },
        detailList: [],
        shareUrl: "https://adspq.dktai.cn/?shareCode="
      }
    },
    methods: {
      showCode(){
        this.$layer({
          headerText: '分享二维码',
          isShowBg: true,
          contentText: '#code',
          btn: [{
            text: '了解了',
            method: '关闭'
          }]
        });
      },
      copyUrl() {
        const Url2 = document.getElementById("shareUrl").value;
        const oInput = document.createElement('input');
        oInput.value = Url2;
        document.body.appendChild(oInput);
        oInput.select(); // 选择对象
        document.execCommand("Copy"); // 执行浏览器复制命令
        oInput.className = 'oInput';
        oInput.style.display = 'none';
        this.$toast({content: "已复制到剪贴板，可粘贴发送", position: "middle"});
      },
      getData() {
        this.$utils.shareDetail(res => {
          this.firstLevelNum = res.firstLevelNum ? res.firstLevelNum : 0;
          this.firstLevelProfit = res.firstLevelProfit ? res.firstLevelProfit : 0;
          this.secLevelNum = res.secLevelNum ? res.secLevelNum : 0;
          this.secLevelProfit = res.secLevelProfit ? res.secLevelProfit : 0;
          this.shareCode = res.shareCode;
          this.totalProfit = res.totalProfit ? res.totalProfit : 0;
          this.shareUrl += this.shareCode;

          new QRCode("code", {
            text: this.shareUrl,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });
        });
      },
      changeTime(type) {
        this.index = type;
        const now = new Date();
        this.form.pageNo = 1;
        this.form.endDate = getFormalDate(now, "yyyy-mm-dd");
        if (type == 0) {
          this.form.beginDate = getFormalDate(now.valueOf() - 3600 * 24 * 7 * 1000, "yyyy-mm-dd");
          this.getDetail();
        } else if (type == 1) {
          this.form.beginDate = getFormalDate(now.valueOf() - 3600 * 24 * 30 * 1000, "yyyy-mm-dd");
          this.getDetail();
        }
      },
      toDetail() {
        this.isShowDetail = true;
        this.changeTime(0)
      },
      search() {
        this.form.pageNo = 1;
        this.getDetail();
      },
      getDetail() {
        this.$utils.shareProfit(this.form, res => {
          this.detailList = res.profitList;
          this.totalProfit = res.totalProfit ? res.totalProfit : 0;
        });
      }
    }
  }
</script>

<style lang="scss" scoped>
  #money {
    .head {
      width: 100%;
      height: 100px;
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin-bottom: 10px;

      img {
        position: absolute;
        left: 20px;
        width: 60px;
        height: 60px;
      }

      span {
        position: absolute;
        font-size: 16px;
        color: #999999;
        left: 90px;
      }

      label {
        font-size: 24px;
        color: #333333;
      }
    }

    .title {
      height: 50px;
      background-color: white;
      display: flex;
      align-items: center;
      border-top: 1px solid #f2f2f2;
      border-bottom: 1px solid #f2f2f2;
      justify-content: space-between;

      span {
        flex: 1;
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

      label, u {
        color: #ff7e00;
        font-size: 14px;
        padding-right: 20px;
      }

      u {
        color: #1873f2;
      }
    }

    .share {
      background-color: white;
      display: flex;
      align-items: center;
      padding: 10px 20px;
      justify-content: space-between;

      div {
        width: 420px;
        height: 130px;
        display: flex;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        span {
          margin-top: 10px;
          color: white;
          font-size: 16px;
        }

        &.url {
          background: url("../.././assets/imgs/my/url.png") no-repeat;
          background-size: 100% 100%;
        }

        &.code {
          background: url("../.././assets/imgs/my/code.png") no-repeat;
          background-size: 100% 100%;
        }
      }
    }

    .num {
      padding: 20px;
      background-color: white;
      display: flex;
      align-items: center;

      label {
        flex: 1;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background-color: #f2f3f5;

        span {
          &:first-child {
            font-size: 16px;
            color: #666666;
          }

          &:last-child {
            font-size: 16px;
            color: #333333;
            margin-top: 5px;
          }
        }
      }
    }

    p {
      text-align: left;
      flex: 1;
      margin-top: 0;
      margin-bottom: 10px;
      padding: 20px;
      background-color: white;
    }
  }

  #detail {
    background-color: white;
    margin-bottom: 10px;

    .head {
      padding: 0 20px;
      height: 49px;
      border-bottom: 1px solid #f2f2f2;
      align-items: center;
      display: flex;
      background-color: white;
      color: #999999;
      justify-content: space-between;
      font-size: 14px;

      span:first-child {
        span {
          position: relative;
          padding-left: 10px;

          &:before {
            left: 0;
            position: absolute;
            content: '';
            width: 3px;
            top: 0;
            height: 100%;
            background-color: #1873f2;
          }
        }
      }

      .total {
        font-size: 16px;
        color: #999999;

        span {
          color: #333333;
          font-size: 20px;
          position: relative;
        }
      }
    }

    .search-box {
      height: 79px;
      border-bottom: 1px solid #f2f2f2;
      display: flex;
      align-items: center;
      padding: 0 20px;

      .quick-time {
        margin-right: 20px;

        &.active {
          color: #1873f2;
        }
      }

      label {
        display: flex;
        align-items: center;
        height: 40px;

        span {
          display: flex;
          padding-left: 20px;
          align-items: center;
          margin-left: 20px;
          background-color: #f2f3f4;

          &:nth-child(1) {
            background-color: white;
          }

          &:nth-child(2) {
            height: 40px;
          }

          &:nth-child(3) {
            height: 40px;
            margin-left: 10px;
          }

          input {
            height: 100%;
            width: 100px;
            color: #333333;
            font-size: 14px;
            display: flex;
            padding-left: 20px;
            align-items: center;
          }
        }
      }

      u {
        margin-left: 20px;
        color: #1873f2;
        font-size: 14px;
      }
    }

    .content {
      flex: 1;
      overflow-y: auto;
      position: relative;

      .scroll {
        width: calc(100% - 40px);
        position: absolute;
        padding: 20px;

        .item:nth-child(even) {
          background-color: #f2f3f4;
        }

        .item {
          display: block;
          width: calc(100% - 40px);
          padding: 0 20px;
          height: 50px;
          line-height: 50px;

          span {
            font-size: 14px;

            &:first-child {
              float: left;
              color: #666666;
            }

            &:last-child {
              float: right;
              color: #ff5959;
            }
          }
        }
      }
    }
  }
</style>
