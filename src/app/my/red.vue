<template>
  <Contain id="red" direction="column">
    <Contain :flex=0 class="type-tab">
      <template v-for="(item,index) in typeList">
        <span class="pointer" @click="changeType(item,index)" :key="index"
              :class="index == typeIndex?'selected':''">{{item.title}}</span>
      </template>
    </Contain>
    <Contain class="content" direction="column">
      <Contain class="scroll" direction="column" id="sortable">
        <template v-if="list[typeIndex].length > 0 " v-for="(item,index) in list[typeIndex]">
          <div class="coupon-item" :key="index">
            <div class="coupon-detail"
                 :class="(item.useStatus=='030'||item.useStatus=='040')?'used':item.couponType == '010'?'cash':'cost'">
              <label class="coupon-name"><span>{{item.couponName}}</span><span><img @click="showNote(item)"
                                                                                    v-if="item.couponType=='020'"
                                                                                    src="../.././assets/imgs/my/note.png">&nbsp;&nbsp;({{item.couponType=='010'?'现金红包':'手续费红包'}})</span></label>
              <label class="coupon-value"><span>￥</span><span>{{item.faceValue}}<span>(剩余面额{{item.remainValue}})</span></span></label>
              <label>使用后自动充值到账户余额</label>
              <label>有效期限{{item.beginTime}}&nbsp;-&nbsp;{{item.endTime}}</label>
              <label v-if="typeIndex==0" @click="useCoupon(item,index)" class="use"
                     :class="item.couponType=='010'?'cash':'cost'">立即使用</label>
              <label class="mark" v-if="item.useStatus=='030'||item.useStatus=='040'">{{item.useStatus=='030'?"已使用":"已失效"}}</label>
            </div>
            <div v-show="typeIndex==1" class="drag"></div>
          </div>
        </template>
        <template v-if="list[typeIndex].length == 0">
          <span style="padding-top: 50px">当前暂无可用红包</span>
        </template>
      </Contain>
    </Contain>
    <div class="layer-content" id="note">
      <p>本活动可用于{{showContract}}品种的手续费抵扣</p>
    </div>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import Card from "../../components/layout/card";
  import {mapState} from 'vuex';
  import {getFormalDate} from '../.././util'

  export default {
    name: "red",
    components: {Card, Contain},
    computed: {
      ...mapState(['api','isLoginApp'])
    },
    data() {
      return {
        ids: [],
        typeIndex: 0,
        useStatus: "010",
        list: [[], [], []],
        typeList: [{status: "010", title: "未使用"}, {status: "020", title: "使用中"}, {status: "030,040", title: "已失效"}],
        showContract: ''
      }
    },
    watch: {
      isLoginApp(val) {
        if (val)
          this.getData();
      }
    },
    activated(){
      if(this.api != "")
      this.getData();
    },
    methods: {
      showNote(item) {
        this.showContract = item.useVariety ? item.useVariety.join(",") : "全部";
        this.$layer({
          headerText: '红包说明',
          isShowBg: true,
          contentText: '#note',
          btn: [
            {
              text: '了解了',
              method: '关闭'
            }]
        });
      },
      getData() {
        const allContract = JSON.parse(localStorage.getItem("allContract"));
        this.$utils.couponList({useStatus: this.useStatus}, res => {
          res.forEach(item => {
            item.beginTime = getFormalDate(item.beginTime, "yyyy-mm-dd");
            item.endTime = getFormalDate(item.endTime, "yyyy-mm-dd");
            if (item.useVariety) {
              let arr = [];
              if (item.useVariety.indexOf(",") == -1)
                arr.push(item.useVariety);
              else {
                let value = item.useVariety.split(",");
                for (let k = 0; k < allContract.length; k++) {
                  for (let j = 0; j < value.length; j++) {
                    if (value[j] == allContract[k].contractCode)
                      arr.push(allContract[k].contractName);
                  }
                }
              }
              item.useVariety = arr;
            }
            if (this.typeIndex == 1)
              this.ids.push(item.couponId);
          });
          this.$set(this.list, this.typeIndex, res);
          if (this.typeIndex == 1 && this.list[this.typeIndex].length != 0) {
            this.$nextTick(() => {
              if (res.length > 0) {
                const el = document.getElementById('sortable');
                new Sortable(el, {
                  scroll: false,
                  animation: 150,
                  handle: ".coupon-item",
                  onEnd: (e) => { // 拖拽结束
                    let newIndex = e.newIndex;
                    let oldIndex = e.oldIndex;
                    if (newIndex == oldIndex)
                      return;
                    let oldItem = this.ids[oldIndex];
                    let newItem = this.ids[newIndex];
                    this.ids.splice(oldIndex, 1, newItem);
                    this.ids.splice(newIndex, 1, oldItem);
                    this.$utils.couponSort({ids: this.ids.join(",")}, () => {
                      this.$toast({content: "排序成功", position: "middle"});
                    });
                  }
                });
              }
            });
          }
        });
      },
      useCoupon(item, index) {
        this.$utils.useCoupon({couponId: item.couponId}, () => {
          this.$toast({content: "使用成功", position: "middle"});
          this.list[this.typeIndex].splice(index, 1);
          if (item.couponType == "020")
            this.list[1].splice(0, 0, item);
          else {
            item.useStatus = "030";
            this.list[2].splice(0, 0, item);
          }
        });
      },
      changeType(item, index) {
        if (this.typeIndex == index)
          return;
        this.typeIndex = index;
        this.useStatus = item.status;
        if (this.list[index].length == 0)
          this.getData();
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

  .pointer {
    cursor: pointer;
  }

  #red {

    .type-tab {
      width: 100%;
      min-height: 50px;
      background-color: white;
      display: flex;
      align-items: center;

      span {
        padding: 0 20px;
        position: relative;
        color: #333333;
        font-size: 16px;
        display: inline-block;
        height: 100%;
        line-height: 50px;

        &.selected {
          font-weight: bold;

          &:after {
            content: '';
            position: absolute;
            left: 50%;
            margin-left: -25%;
            width: 50%;
            height: 4px;
            bottom: 0;
            background-color: #1873f2;
          }
        }
      }
    }

    .content {
      width: auto;
      margin-top: 1px;
      background-color: white;
      overflow-y: auto;
      position: relative;
      margin-bottom: 10px;

      .scroll {
        position: absolute;
        padding-bottom: 20px;

        .coupon-item {
          margin-top: 20px;
          display: flex;
          padding: 0 20px;
          align-items: center;
          justify-content: space-between;

          .coupon-detail {
            width: 580px;
            height: 100px;
            padding: 10px;
            color: white;
            position: relative;

            label {
              display: flex;
            }

            .coupon-name {
              span {
                &:first-child {
                  flex: 1;
                  text-align: left;
                  font-size: 16px;
                }

                &:last-child {
                  cursor: pointer;
                  font-size: 14px;
                  display: flex;
                  align-items: center;
                }
              }
            }

            .coupon-value {
              margin-top: 5px;
              font-size: 14px;
              align-items: flex-end;
              position: relative;

              span {
                &:first-child {
                  bottom: 3px;
                  position: absolute;
                }

                &:last-child {
                  margin-left: 15px;
                  font-size: 30px;

                  span{
                    font-size: 14px;
                  }
                }
              }
            }

            &.cash {
              background: url("../.././assets/imgs/my/cash_bg.png") no-repeat;
              background-size: 100% 100%;
            }

            &.cost {
              background: url("../.././assets/imgs/my/cost_bg.png") no-repeat;
              background-size: 100% 100%;
            }

            &.used {
              background: url("../.././assets/imgs/my/used.png") no-repeat;
              background-size: 100% 100%;
            }

            .mark {
              position: absolute;
              bottom: 10px;
              right: 10px;
            }

            .use {
              position: absolute;
              bottom: 10px;
              cursor: pointer;
              right: 10px;
              display: block;
              width: 90px;
              height: 30px;
              text-align: center;
              line-height: 30px;
              background-color: white;
              font-size: 16px;
              border-radius: 15px;

              &.cash {
                color: #ff4c5b;
              }

              &.cost {
                color: #ff9f19;
              }
            }
          }

          .drag {
            width: 20px;
            height: 21px;
            cursor: -webkit-grabbing;
            background: url("../.././assets/imgs/my/drag.png") no-repeat;
            background-size: 100% 100%;
          }
        }
      }
    }
  }
</style>
