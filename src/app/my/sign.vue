<template>
  <Contain id="sign" direction="column">
    <div id="calendar" v-cloak>
      <div class="calendar-title">
        {{currentYear}}年{{currentMonth}}月
        <u @click="showBox">已领取奖励</u>
      </div>
      <div class="calendar-week">
        <span class="calendar-week-item">日</span>
        <span class="calendar-week-item">一</span>
        <span class="calendar-week-item">二</span>
        <span class="calendar-week-item">三</span>
        <span class="calendar-week-item">四</span>
        <span class="calendar-week-item">五</span>
        <span class="calendar-week-item">六</span>
      </div>
      <div class="calendar-day">
                <span :class="['calendar-item',item.isToday?'calendar-today':'']"
                      v-for="(item,index) in calendarData" :key="index">
                    <span
                      :class="['calendar-item-day',item.isMonth?'':'calendar-other-item',item.isToday?'calendar-today-mark':'',item.isMark?'calendar-mark':'',item.year==currentYear&&item.month==currentMonth&&item.day==currentDay?'calendar-choose-day':'']">
                        <span class="calendar-value">{{(item.isToday && !isTodayMark) ?'今':item.day}}</span>
                    </span>
                </span>
      </div>
    </div>
    <div class="sign-btn">
      <label @click="sign" :class="isTodayMark ? 'signed':''">{{isTodayMark?"已签到":"签到"}}</label>
    </div>
    <div class="layer-content" id="layer-content">
      <div class="tabs">
        <span @click="changeTab(0)" :class="tabIndex==0?'selected':''">已领取</span>
        <span @click="changeTab(1)" :class="tabIndex==1?'selected':''">已使用/已失效</span>
      </div>
      <div class="scroll-box">
        <div class="scroll-list">
          <template v-if="couponList[tabIndex].length>0" v-for="(item,index) in couponList[tabIndex]">
            <div :key="index" class="item" :class="tabIndex==0?(item.couponType=='010'?'cash':'cost'):'used'">
              <span>￥<span>{{item.faceValue}}</span></span>
              <span>({{item.couponType=='010'?'现金红包':'手续费红包'}})</span>
            </div>
          </template>
          <template v-if="couponList[tabIndex].length==0">
            <span style="padding-top: 50px">当前暂无可用红包</span>
          </template>
        </div>
      </div>
      <div class="go"><span>去&nbsp;<u @click="goPage">我的红包</u>&nbsp;使用>></span></div>
    </div>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import {mapState} from 'vuex';
  import {getFormalDate} from "../../util";

  export default {
    name: "sign",
    components: {Contain},
    computed: {
      ...mapState(['api', 'isLoginApp', 'loginInfo'])
    },
    data() {
      return {
        currentYear: currentYear,//当前年
        currentMonth: currentMonth,//当前月
        currentDay: [],//当前日
        calendarData: [],//日历数据,
        isTodayMark: false,
        form: {
          beginDate: "",
          endDate: ""
        },
        tabIndex: 0,
        activityId: "",
        couponList: [[], []]
      }
    },
    activated() {
      this.isTodayMark = false;
      this.initDate();
    },
    watch: {
      isLoginApp(val) {
        if (val)
          this.getData();
      },
      "loginInfo.register"(val) {
        if (val == '020') {
          this.isTodayMark = true;
        }
      }
    },
    methods: {
      goPage() {
        this.$store.state.canCloseLayer = false;
        this.$store.state.canCloseLayer = true;
        this.$router.push({path: "/my/red"});
      },
      changeTab(index) {
        this.tabIndex = index;
        if (this.couponList[index].length == 0)
          this.getCouponList();
      },
      initDate() {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        let firstDay = new Date(year, month - 1, 1);//这个月的第一天
        // let currentMonth = firstDay.getMonth(); //取得月份数
        // let lastDay = new Date(firstDay.getFullYear(), currentMonth + 1, 0);//是0而不是-1
        this.form.beginDate = getFormalDate(firstDay.valueOf(), "yyyy-mm-dd");//格式化
        this.form.endDate = getFormalDate(new Date(), "yyyy-mm-dd");//格式化
        if (this.api != "")
          this.getData();
      },
      getCouponList() {
        if (this.activityId == "")
          return;
        this.$utils.couponList({
          activityId: this.activityId,
          useStatus: this.tabIndex == 0 ? "010" : "030,040"
        }, ret => {
          this.$set(this.couponList, this.tabIndex, ret);
        });
      },
      showBox() {
        this.getCouponList();
        this.$layer({
          headerText: '',
          isShowBg: true,
          isShowCloseBtn: false,
          contentText: '#layer-content',
          btn: [
            {
              text: '取消',
              method: '关闭',
            }]
        });
      },
      getData() {
        this.$utils.signDetail(this.form, res => {
          calendarData.forEach(c => {
            res.signinList.forEach(s => {
              if (c.time.replace(/\//g, "-") == s.signinDate) {
                c.isMark = true;
                if (s.signinDate == this.form.endDate) {
                  this.isTodayMark = true;
                  this.$store.state.loginInfo.register = "020";
                }
              }
            });
          });
          this.calendarData = calendarData;
          const timer = setTimeout(() => {
            clearTimeout(timer);
            this.$utils.activityList({activityType: "030"}, res => {
              this.activityId = res[0].id;
            });
          }, 500);
        });
      },
      sign() {
        this.$utils.sign({signinDate: this.form.endDate}, (res) => {
          if (res.faceValue) {
            this.isTodayMark = true;
            this.$store.state.loginInfo.register = "020";
            let type = res.couponType == "010" ? "现金红包" : "手续费红包";
            this.$toast({content: "签到成功,获得" + res.faceValue + "元" + type, position: 'middle', styleType: 2});
          } else {
            this.isTodayMark = true;
            this.$store.state.loginInfo.register = "020";
            this.$toast({content: "签到成功", position: 'middle', styleType: 2});
          }
        });
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

  #sign {
    #calendar {
      width: 100%;

      .calendar-title {
        text-align: center;
        background-color: white;
        height: 50px;
        line-height: 50px;
        font-size: 16px;
        color: #333333;
        position: relative;
        z-index: 10;

        u {
          right: 10px;
          width: auto;
          height: auto;
          min-width: auto;
          min-height: auto;
          position: absolute;
          color: #1873f2;
          font-size: 14px;
          cursor: pointer;
        }
      }

      .calendar-week {
        display: flex;
        background: #f0f4fc;
        height: 60px;
        font-size: 16px;
        padding: 0 25px;
        width: 100%;

        .calendar-week-item {
          height: 100%;
          min-width: 120px;
          color: #666666;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .calendar-day {
        display: flex;
        flex-wrap: wrap;
        background: #fff;
        position: relative;
        z-index: 9;
        color: #333;
        padding: 0 25px;
      }

      .calendar-today {
        position: relative;
      }

      .calendar-item {
        width: 120px;
        height: 65px;
        display: flex;
        justify-content: center;
        align-items: center;

        .calendar-item-day {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          .calendar-value {
            line-height: 30px;
            color: #333333;
            font-size: 20px;
          }

          .calendar-china-value {
            font-weight: normal;
            font-size: 12px;
            color: #9b9b9b;
          }
        }

        .calendar-other-item {
          .calendar-value {
            color: #cccccc;
            font-size: 20px;
          }
        }

        .calendar-mark {
          background: #FCF6D7;
        }

        .calendar-choose-day {
          background: #FCF6D7;
        }

        .calendar-today-mark {
          background: #FCE365;
        }
      }
    }

    .sign-btn {
      height: 90px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border-top: 1px solid #f2f2f2;

      label {
        display: block;
        height: 50px;
        width: 200px;
        cursor: pointer;
        text-align: center;
        line-height: 50px;
        color: white;
        background-color: #ff7e00;

        &.signed {
          color: #999999;
          background-color: #f2f2f2;
        }
      }
    }
  }

  #layer-content {
    width: 100%;

    .tabs {
      display: flex;
      align-items: center;
      height: 50px;
      background-color: white;
      border-bottom: 1px solid #f2f2f2;

      span {
        flex: 1;
        height: 100%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &.selected {
          color: #1873f2;
        }

        &.selected:after {
          position: absolute;
          content: "";
          width: 100%;
          height: 2px;
          bottom: 0;
          background-color: #1873f2;
        }
      }
    }

    .go {
      height: 50px;
      bottom: 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      span {
        font-size: 14px;
        margin-right: 20px;
        color: #999999;

        u {
          color: #333333;
          cursor: pointer;
        }
      }
    }

    .scroll-box {
      position: relative;
      height: 200px;
      width: 100%;
      overflow-y: auto;

      .scroll-list {
        width: 100%;
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        .item {
          width: 360px;
          height: 80px;
          margin-top: 20px;
          display: flex;
          color: white;

          > span {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;

            &:first-child {
              font-size: 20px;

              span {
                font-size: 40px;
              }
            }
          }

          &.cash {
            background: url("../.././assets/imgs/my/cash.png") no-repeat;
            background-size: 100% 100%;
          }

          &.cost {
            background: url("../.././assets/imgs/my/cost.png") no-repeat;
            background-size: 100% 100%;
          }

          &.used {
            background: url("../.././assets/imgs/my/invalid.png") no-repeat;
            background-size: 100% 100%;
          }
        }
      }
    }
  }
</style>
