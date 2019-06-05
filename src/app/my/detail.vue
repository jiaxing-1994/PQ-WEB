<template>
  <Contain id="detail" :flex=1 direction="column">
    <div class="head">
      <label><span>收入：</span><span>{{incomeCount}}&nbsp;<span>笔</span></span><span>{{incomeMoney}}&nbsp;<span>元</span></span></label>
      <label><span>支出：</span><span>{{outCount}}&nbsp;<span>笔</span></span><span>{{outMoney}}&nbsp;<span>元</span></span></label>
    </div>
    <Contain class="content" :flex=1 direction="column">
      <Contain class="scroll" direction="column">
        <template v-if="list.length > 0" v-for="(item,index) in list">
          <div class="item">
            <span>{{item.date}}</span>
            <span>{{item.describe}}</span>
            <span :class="item.type == '1'?'plus':'reduce'">{{item.type=='1'?'+':'-'}}{{item.amount}}元</span>
          </div>
        </template>
      </Contain>
    </Contain>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import {mapState} from 'vuex';

  export default {
    name: "detail",
    components: {Contain},
    computed: {
      ...mapState(['api', 'isLoginApp'])
    },
    data() {
      return {
        incomeMoney: 0,
        incomeCount: 0,
        outMoney: 0,
        outCount: 0,
        list: []
      }
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
    },
    methods: {
      getData() {
        this.$utils.moneyDetail({urlType: "050"}, res => {
          this.incomeCount = res.incomeNum;
          this.incomeMoney = res.incomeMoney.toFixed(2);
          this.outMoney = res.outlayMoney.toFixed(2);
          this.outCount = res.outlayNum;
          this.list = res.capitalDetails;
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


  #detail {
    margin-bottom: 10px;

    .head {
      display: flex;
      height: 100px;
      align-items: center;
      padding: 0 20px;
      flex-direction: column;
      background-color: white;

      label {
        flex: 1;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        span {
          color: #333333;
          font-size: 16px;
          flex: 1;

          &:first-child {
            text-align: left;
          }

          &:last-child {
            text-align: right;
          }

          span {
            color: #999999;
          }
        }

        &:first-child {
          border-bottom: 1px solid #f2f2f2;
        }
      }
    }

    .content {
      position: relative;
      margin-top: 10px;
      background-color: white;
      overflow-y: auto;

      .scroll {
        position: absolute;
        width: 100%;
        padding-bottom: 10px;

        .item {
          margin: 0 20px;
          padding: 0 20px;
          display: flex;
          height: 50px;
          color: #333333;
          font-size: 14px;
          align-items: center;
          justify-content: space-between;

          &:nth-child(even) {
            background-color: #f2f3f4;
          }

          span.plus {
            color: #ff4c4c;
          }

          span.reduce {
            color: #39bf93;
          }
        }
      }
    }
  }
</style>
