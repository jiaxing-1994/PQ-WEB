<template>
  <Contain id="cash" :flex=1 direction="column">
    <div class="head">
      <span>账户余额：</span><span>￥{{balance}}</span><span>(${{dollar}})</span><u @click="goBank">{{bankName}}>></u>
    </div>
    <div class="free-cash">累计免提现金额为{{freeFee}}元</div>
    <Contain :flex=1 direction="column" class="content">
      <div class="input-item">
        <label>提现金额:</label>
        <input v-model="form.money" type="text">
      </div>
      <div class="input-item">
        <label>体现手续费:</label>
        <input v-model="form.fee" readonly>
      </div>
      <div class="input-item">
        <label>实际到账:</label>
        <input v-model="cash" readonly>
      </div>
      <div class="input-item">
        <label>提现密码:</label>
        <input v-model="form.withdrawPwd" :type="isShowPassword?'text':'password'">
        <img @click="changeShow" class="open-close pointer" :src="isShowPassword?close:open">
        <u class="set-password pointer" @click="goSet">设置/修改提现密码</u>
      </div>
      <div class="input-item">
        <label></label>
        <input type="button" @click="applyCash" class="btn pointer" value="确认提现">
      </div>
    </Contain>
    <p>
      温馨提示：<br><br>
      1.到账时间：工作日09:00-16:30申请，24小时内到账，最快5分钟到账，其余时间申请将在下个工作日到账。<br><br>
      2.提现手续费：（a）1%（适用于充值后，未实际操盘金额）；（b）0元（适用于操盘用户提现）。<br><br>
      3.提现处理时间：每个工作日固定时间进行提现处理。具体为10:00，14:00，16:00，17:30
    </p>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import {mapState} from 'vuex';

  export default {
    name: "Cash",
    components: {Contain},
    computed: {
      ...mapState(['api', 'selectBank', 'rateList','isLoginApp'])
    },
    data() {
      return {
        balance: 0,
        freeFee: 0,
        form: {
          money: "",
          withdrawPwd: "",
          fee: "0.00",
          bankId: ""
        },
        feeRate: 1,
        cash: "0.00",
        bankName: "我的银行卡",
        isShowPassword: false,
        dollar: 0,
        open: require("../.././assets/imgs/my/open.png"),
        close: require("../.././assets/imgs/my/close.png"),
      }
    },
    activated(){
      if(this.api != "")
      this.getData();
    },
    watch: {
      isLoginApp(val) {
        if (val)
          this.getData();
      },
      'form.money'(n) {
        let v = n == '' ? 0 : parseInt(n);
        this.form.fee = ((v - this.freeFee) * this.feeRate).toFixed(2);
        this.cash = (v - this.form.fee).toFixed(2);
      }
    },
    methods: {
      applyCash() {
        if (parseInt(this.form.money) > this.balance)
          this.$toast({content: "提现金额不能大于余额", position: "middle", styleType: 2});
        else if (this.form.bankId == -1)
          this.$toast({content: "请选择提现银行卡", position: "middle", styleType: 2});
        else if (this.form.money == "")
          this.$toast({content: "请输入提现金额", position: "middle", styleType: 2});
        else if (this.form.withdrawPwd == "")
          this.$toast({content: "请输入提现密码", position: "middle", styleType: 2});
        else {
          this.$utils.applyCash(this.form, () => {
            this.$toast({content: "提现申请成功，请耐心等待1或2个工作日", position: "middle", styleType: 2});
          });
        }
      },
      goSet() {
        this.$router.push({path: '/my/setting', query: {index: "2"}});
      },
      goBank() {
        this.$router.push({path: '/my/bank'});
      },
      getData() {
        this.$utils.getInitCash(res => {
          this.balance = res.balance ? res.balance : 0;
          this.freeFee = res.freeFee ? res.freeFee : 0;
          this.feeRate = res.feeRate ? res.feeRate : 1;
          this.dollar = (this.rateList['CNY'].exchangeRate * this.balance).toFixed(2);
          res.bankList.forEach(item => {
            if (item.defaulted == "020") {
              this.bankName = item.bankName;
              this.form.bankId = item.id;
            }
          });
        });
      },
      changeShow() {
        this.isShowPassword = !this.isShowPassword;
      }
    }
  }
</script>

<style lang="scss" scoped>
  #cash {
    background-color: white;
    margin-bottom: 10px;
    padding: 40px;

    .head {
      height: 50px;
      display: flex;
      align-items: center;

      span {
        &:nth-child(1) {
          font-size: 16px;
          color: #333333;
          position: relative;
          padding-left: 10px;

          &:before {
            content: '';
            position: absolute;
            width: 4px;
            left: 0;
            height: 100%;
            background-color: #ff7e00;
          }
        }

        &:nth-child(2) {
          font-size: 20px;
          color: #333333;
          margin: 0 10px;
        }

        &:nth-child(3) {
          flex: 1;
          text-align: left;
        }
      }

      u {
        color: #1873f2;
        cursor: pointer;
      }
    }

    .free-cash {
      display: flex;
      align-items: center;
      color: #666666;
      font-size: 14px;
      height: 40px;
      padding-left: 10px;
      background-color: #f2f3f4;
    }

    .content {
      margin: 20px 0;
      display: flex;
      border-bottom: 1px solid #f2f2f2;
    }

    p {
      color: #747474;
      font-size: 14px;
      text-align: left;
    }

    .input-item {
      width: 500px;
      margin-left: 70px;
      min-height: 50px;
      height: 50px;
      display: flex;
      margin-bottom: 20px;
      align-items: center;
      position: relative;

      .code {
        width: auto;
        height: 100%;
        display: inline-block;
        position: absolute;
        right: 20px;
        color: #999999;
        font-size: 12px;
        line-height: 50px;
      }

      .open-close {
        width: 20px;
        height: 12px;
        display: inline-block;
        position: absolute;
        right: 20px;
        color: #999999;
        font-size: 12px;
      }

      label {
        min-width: 100px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666666;
        font-size: 14px;
      }

      input {
        flex: 1;
        height: 100%;
        border-radius: 5px;
        border: 1px solid #e5e5e5;
        color: #333333;
        font-size: 14px;
        padding: 0 20px;

        &:focus {
          border: 1px solid #ff7e00;
        }

        &.btn {
          font-size: 16px;
          color: white;
          background-color: #ff7e00;
        }
      }

      .set-password {
        position: absolute;
        right: px2vw(-140px);
        font-size: 12px;
        color: #999999;
      }
    }
  }
</style>
