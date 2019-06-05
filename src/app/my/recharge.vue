<template>
  <Contain :flex=1 id="recharge" direction="column">
    <div v-show="!isShowPay" class="recharge-box">
      <label><span>我的余额：</span><span>￥{{balance}}</span><span>(${{(balance*rate).toFixed(2)}})</span></label>
    </div>
    <div v-show="!isShowPay" class="input-box">
      <div class="input">
        <span>请输入充值金额：<span>￥</span></span>
        <input placeholder="0.00" @focus="addBorder" @blur="removeBorder" v-model="selectMoney">
        <span>(≈${{(selectMoney*rate).toFixed(2)}})</span>
        <span>(1人民币={{rate}}美元)</span>
      </div>
    </div>
    <div v-show="!isShowPay" class="recharge-after">
      <span>充值后余额：<span>￥{{(parseFloat(balance)+ (selectMoney==""?0:parseFloat(selectMoney)))}}</span><span>&nbsp;&nbsp;(≈${{((parseFloat(balance)+(selectMoney==""?0:parseFloat(selectMoney)))*rate).toFixed(2)}})</span></span>
    </div>
    <div v-show="!isShowPay" class="num-box">
      <template v-if="rechargeList.length > 0" v-for="(item,index) in rechargeList">
        <span @click="changeMoney(item)" :class="selectMoney==item?'active':''" :key="index">{{item}}</span>
      </template>
    </div>
    <div v-show="!isShowPay" class="contract-box">
      <div class="tabs">
        <span class="pointer" @click="changeTab(index)" :class="selectTab==index?'selected':''"
              v-for="(item,index) in tabs"
              :key="index">{{item.title}}</span>
        <label class="notice">（注意：请勿在交易时间外持仓，以免被系统强平）</label>
      </div>
      <div class="content">
        <table class="thead">
          <thead>
          <tr>
            <td>期货产品</td>
            <td>交易手续费(单边)</td>
            <td>初始可持仓手数</td>
            <td>交易时间</td>
            <td>简介</td>
          </tr>
          </thead>
        </table>
        <div class="scroll">
          <div class="tbody">
            <table>
              <thead>
              <tr v-if="(selectTab+1).toString()==item.typeCode" v-for="(item,index) in contractList" :key="index">
                <td>{{item.contractName}}</td>
                <td>
                  {{(((item.fee*(rateList[item.currencyNo].exchangeRate)))/(rateList['CNY'].exchangeRate)).toFixed(2)}}元/手
                </td>
                <td>{{Math.floor((parseFloat(balance)+
                  (selectMoney==""?0:parseFloat(selectMoney)))*rate/(rateList[item.currencyNo].exchangeRate)/(item.deposit+item.fee))}}手
                </td>
                <td><span v-for="i in item.tradingTime.split('，')" :key="i">{{i}}</span></td>
                <td>最小变动单位{{item.miniTikeSize}}，跳动一下±{{item.miniTikeSize}}{{rateList[item.currencyNo].currencyName}}
                </td>
              </tr>
              </thead>
            </table>
          </div>
        </div>
      </div>
      <div class="btn pointer" @click="recharge">立即充值</div>
    </div>
    <!--    <div class="pay-box" v-show="isShowPayBox">-->
    <!--      <iframe :src="payUrl"></iframe>-->
    <!--    </div>-->
    <div v-show="isShowPay" class="pay-title"><img class="pointer" @click="closePay"
                                                   src="../.././assets/imgs/common/close.png"><span>充值</span></div>
    <iframe v-show="isShowPay" :src="payUrl" class="pay-iframe"></iframe>

    <div class="layer-content" id="layer-recharge">
      <p>首次充值可获得{{couponValue}}元{{couponName}}</p>
      <div :class="couponName.indexOf('现金') != -1 ? 'coupon':'coupon discount'">
        <span>￥&nbsp;<span>{{couponValue}}</span></span>
        <span>{{couponName}}</span>
      </div>
      <p><span>Tip:</span>完成充值后奖励将自动发送</p>
    </div>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import {mapState} from 'vuex';

  export default {
    name: "recharge",
    components: {Contain},
    computed: {
      ...mapState(['api', 'rateList', 'payApi', 'isShowPayBox', 'isLoginApp'])
    },
    watch: {
      isLoginApp(val) {
        if (val)
          this.getData();
      }
    },
    activated() {
      if (this.api != "")
        this.getData();
      if (this.$route.query.money)
        this.queryMoney = this.$route.query.money.toFixed(2);
    },
    mounted() {
      if (this.$route.query.money)
        this.queryMoney = this.$route.query.money.toFixed(2);
    },
    data() {
      return {
        rate: 1,
        balance: 0,
        payUrl: "",
        selectTab: 0,
        queryMoney: 0,
        selectMoney: 0,
        isShowPay: false,
        rechargeList: [],
        contractList: [],
        couponName: "",
        couponValue: 0,
        activityId: "",
        isCompleted: "010",//充值活动是否完成
        tabs: [{title: "国际期货", type: 1}, {title: "国内期货", type: 2}]
      }
    },
    methods: {
      removeBorder() {
        $(".input").removeClass("input-border");
      },
      addBorder() {
        $(".input").addClass("input-border");
      },
      closePay() {
        this.isShowPay = false;
      },
      recharge() {
        if (this.isCompleted == "010") {
          if (this.activityId == "") {
            this.$utils.activityList({
              activityType: "021"
            }, result => {
              if (result[0].activeStatus == '010') {
                this.isCompleted = "020";
                return;
              }
              this.activityId = result[0].id;
              this.$utils.isCompleted = result[0].complatedStatus ? result[0].complatedStatus : "010";
              this.$utils.activityCoupon({activityId: result[0].id}, ret => {
                this.couponValue = ret.amount;
                this.couponName = ret.typeName;
                this.showLayer();
              });
            });
          } else
            this.showLayer();
        } else
          this.showPay();
      },
      showPay() {
        const data = {
          money: this.selectMoney,
          token: localStorage.getItem("token"),
          returnUrl: "http://" + window.location.host + "/static/html/paySuccess.html"
        };
        this.payUrl = `${this.payApi}/toRecharge.html?returnUrl=${data.returnUrl}&money=${data.money}&token=${data.token}`;
        this.isShowPay = true;
      },
      showLayer() {
        this.$layer({
          headerText: '充值提示',
          isShowBg: true,
          contentText: '#layer-recharge',
          btn: [
            {
              text: '残忍放弃',
              method: '关闭'
            }, {
              text: '马上充值',
              isClose: true,
              active: true,
              method: this.showPay
            }]
        });
      },
      changeMoney(money) {
        this.selectMoney = money;
      },
      changeTab(index) {
        this.selectTab = index;
      },
      getData() {
        this.$utils.initRecharge(res => {
          this.balance = res.balance;
          this.rechargeList = res.amountList;
          this.selectMoney = this.queryMoney == 0 ? this.rechargeList[0] : this.queryMoney;
          this.contractList = res.contractList;
          this.rate = res.exchangeRate;
        });
      }
    }
  }
</script>

<style lang="scss" scoped>

  input::-webkit-input-placeholder { /* WebKit browsers */
    color: #ff7e00;
  }

  input:-moz-placeholder { /* Mozilla Firefox 4 to 18 */
    color: #ff7e00;
  }

  input::-moz-placeholder { /* Mozilla Firefox 19+ */
    color: #ff7e00;
  }

  input:-ms-input-placeholder { /* Internet Explorer 10+ */
    color: #ff7e00;
  }

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

  #layer-recharge {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .coupon {
      width: 80%;
      height: 70px;
      display: flex;
      background: url("../.././assets/imgs/my/cash.png") no-repeat;
      background-size: 100% 100%;

      &.discount {
        background: url("../.././assets/imgs/my/cost.png") no-repeat;
        background-size: 100% 100%;
      }

      > span {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;

        &:last-child {
          font-size: 14px;
        }

        span {
          font-size: 30px;
        }
      }
    }


    p {
      span {
        color: #8f8f94;
      }
    }
  }

  .pay-box {
    width: 375px;
    height: 700px;
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 10;
    margin-left: -177.5px;
    margin-top: -350px;

    iframe {
      width: 100%;
      height: 680px;
      border: none;
    }
  }

  .pay-title {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: white;

    img {
      position: absolute;
      left: 20px;
      width: 16px;
      height: 16px;
    }

    span {
      font-size: 20px;
    }
  }

  .pay-iframe {
    flex: 1;
    margin-bottom: 10px;
    border: none;
  }

  #recharge {

    .recharge-box {
      background-color: white;
      padding: 40px 40px 0 40px;
      text-align: left;

      label {
        span {
          &:nth-child(1) {
            color: #333333;
            font-size: 16px;
            position: relative;
            padding-left: 15px;

            &:before {
              content: '';
              position: absolute;
              width: 4px;
              height: 100%;
              left: 0;
              top: 0;
              background-color: #ff7e00;
            }
          }

          &:nth-child(2) {
            color: #333333;
            font-size: 20px;
          }

          &:nth-child(3) {
            color: #666666;
            font-size: 14px;
            margin-left: 10px;
          }
        }
      }
    }

    .input-box {
      background-color: white;
      padding: 10px 40px 10px 40px;

      .input {
        height: 38px;
        border-radius: 2px;
        padding: 0 20px;
        border: 1px solid #f2f2f2;
        display: flex;
        align-items: center;

        &.input-border {
          border: 1px solid #ff7e00;
        }

        span {
          font-size: 14px;

          &:nth-child(1) {
            color: #666666;

            span {
              font-size: 20px;
              color: #ff7e00;
            }
          }

          &:nth-child(3) {
            color: #999999;
            margin-right: 10px;
          }

          &:nth-child(4) {
            color: #666666;
          }
        }

        input {
          flex: 1;
          height: 100%;
          color: #ff7e00;
          font-size: 20px;
        }
      }
    }

    .recharge-after {
      background-color: white;
      padding: 0 40px;

      > span {
        height: 40px;
        display: flex;
        padding: 0 20px;
        color: #666666;
        font-size: 14px;
        align-items: center;
        background-color: #f2f3f4;

        span {
          &:first-child {
            color: #333333;
          }

          &:last-child {
            color: #999999;
          }
        }
      }
    }

    .num-box {
      display: flex;
      padding: 0 40px 10px 40px;
      background-color: white;
      flex-wrap: wrap;
      align-items: center;

      span {
        width: 160px;
        height: 30px;
        margin-top: 10px;
        text-align: center;
        color: #333333;
        cursor: pointer;
        font-size: 20px;
        line-height: 30px;
        margin-right: 10px;
        border: 1px solid #e5e5e5;
        position: relative;

        &:after {
          content: '';
          right: 0;
          bottom: 0;
          width: 20px;
          height: 20px;
          background: url("../.././assets/imgs/my/select.png") no-repeat;
          background-size: 100% 100%;
          position: absolute;
        }

        &.active {
          border: 1px solid #ff7e00;
          color: #ff7e00;
        }

        &.active:after {
          background: url("../.././assets/imgs/my/selected.png") no-repeat;
          background-size: 100% 100%;
        }
      }
    }

    .contract-box {
      flex: 1;
      margin: 20px 0 10px 0;
      background-color: white;
      position: relative;
      display: flex;
      flex-direction: column;

      .tabs {
        padding: 0 40px;
        height: 49px;
        display: flex;
        position: relative;
        align-items: center;
        border-bottom: 1px solid #e5e5e5;

        .notice {
          color: #666666;
          font-size: 14px;
          position: absolute;
          right: 40px;
        }

        span {
          display: flex;
          height: 100%;
          margin-right: 40px;
          align-items: center;
          position: relative;
          color: #333333;
          font-size: 16px;

          &.selected {
            font-weight: bold;
          }

          &.selected:after {
            content: '';
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 4px;
            background-color: #ff7e00;
          }
        }
      }

      .content {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 10px 40px 40px;

        .thead {
          border-top: 1px solid #f2f2f2;
          border-left: 1px solid #f2f2f2;

          thead {
            tr {
              text-align: left;

              td {
                min-height: 28px;
                color: #666666;
                font-size: 14px;
                padding: 0 10px;
                border-bottom: 1px solid #f2f2f2;
                border-right: 1px solid #f2f2f2;

                &:nth-child(1) {
                  min-width: 99px;
                  max-width: 99px;
                }

                &:nth-child(2) {
                  min-width: 144px;
                  max-width: 144px;
                }

                &:nth-child(3) {
                  min-width: 134px;
                  max-width: 134px;
                }

                &:nth-child(4) {
                  min-width: 129px;
                  max-width: 129px;
                }

                &:nth-child(5) {
                  min-width: 186px;
                  max-width: 186px;
                }
              }
            }
          }
        }

        .scroll {
          flex: 1;
          overflow-y: auto;
          position: relative;
          margin-top: -3px;
          overflow-x: hidden;
        }

        .tbody {
          position: absolute;

          table {
            border-left: 1px solid #f2f2f2;

            thead {
              tr {
                text-align: left;

                td {
                  min-height: 28px;
                  padding: 0 10px;
                  color: #333333;
                  font-size: 14px;
                  border-bottom: 1px solid #f2f2f2;
                  border-right: 1px solid #f2f2f2;

                  &:nth-child(1) {
                    min-width: 99px;
                    max-width: 99px;
                  }

                  &:nth-child(2) {
                    min-width: 144px;
                    max-width: 144px;
                  }

                  &:nth-child(3) {
                    min-width: 134px;
                    max-width: 134px;
                  }

                  &:nth-child(4) {
                    min-width: 129px;
                    max-width: 129px;
                    display: flex;
                    padding: 10px;
                    justify-content: center;
                    flex-direction: column;
                  }

                  &:nth-child(5) {
                    min-width: 186px;
                    max-width: 186px;
                  }
                }
              }
            }
          }
        }
      }

      .btn {
        width: 100%;
        height: 30px;
        text-align: center;
        line-height: 30px;
        color: white;
        font-size: 16px;
        position: absolute;
        bottom: 0;
        background-color: #ff7e00;
      }
    }
  }
</style>
