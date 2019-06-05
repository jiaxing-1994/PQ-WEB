<template>
  <Contain id="setting" :flex=1 direction="column">
    <div class="tabs">
      <span class="pointer" @click="changeTab(index)" :class="selectIndex==index?'selected':''"
            v-for="(item,index) in tabs" :key="index">{{item}}</span>
    </div>
    <Contain v-show="selectIndex==0" :flex=1 direction="column" class="content">
      <div class="input-item">
        <label>手机号:</label>
        <input readonly :value="userInfo.mobile" type="text">
      </div>
      <div class="input-item">
        <label>验证码:</label>
        <input v-model="modifyForm.code" type="text">
        <u class="code pointer" @click="getCode(1)">{{codeOldText}}</u>
      </div>
      <div class="input-item">
        <label>旧密码:</label>
        <input v-model="modifyForm.oldPassword" :type="isShowOld?'text':'password'">
        <img @click="changeShow(1)" class="open-close pointer" :src="isShowOld?close:open">
      </div>
      <div class="input-item">
        <label>新密码:</label>
        <input v-model="modifyForm.newPassword" :type="isShowNew?'text':'password'">
        <img @click="changeShow(2)" class="open-close pointer" :src="isShowNew?close:open">
      </div>
      <div class="input-item">
        <label>确认密码:</label>
        <input v-model="modifyForm.surePassword" :type="isShowSure?'text':'password'">
        <img @click="changeShow(3)" class="open-close pointer" :src="isShowSure?close:open">
      </div>
      <div class="input-item">
        <label></label>
        <input type="button" @click="modifyPassword" class="btn pointer" value="确认修改">
      </div>
    </Contain>
    <Contain v-show="selectIndex==1" :flex=1 direction="column" class="content">
      <div class="input-item">
        <label>原手机号:</label>
        <input readonly :value="userInfo.mobile" type="text">
      </div>
      <div class="input-item">
        <label>验证码:</label>
        <input v-model="phoneForm.oldCode" type="text">
        <u class="code pointer" @click="getCode(2)">{{phoneCodeOld}}</u>
      </div>
      <div class="input-item">
        <label>新手机号:</label>
        <input v-model="phoneForm.newMobile" :type="isShowOld?'text':'password'">
        <img @click="changeShow(4)" class="open-close pointer" :src="isShowPhone?close:open">
      </div>
      <div class="input-item">
        <label>验证码:</label>
        <input v-model="phoneForm.newCode" :type="isShowNew?'text':'password'">
        <u class="code pointer" @click="getCode(3)">{{phoneCodeNew}}</u>
      </div>
      <div class="input-item">
        <label></label>
        <input type="button" @click="modifyPhone" class="btn pointer" value="确认修改">
      </div>
    </Contain>
    <Contain v-show="selectIndex==2" :flex=1 direction="column" class="content">
      <div class="input-item">
        <label>手机号:</label>
        <input readonly :value="userInfo.mobile" type="text">
      </div>
      <div class="input-item">
        <label>验证码:</label>
        <input v-model="cashForm.code" type="text">
        <u class="code pointer" @click="getCode(4)">{{cashCodeText}}</u>
      </div>
      <div class="input-item">
        <label>密码:</label>
        <input v-model="cashForm.password" :type="isShowCash?'text':'password'">
        <img @click="changeShow(5)" class="open-close pointer" :src="isShowCash?close:open">
      </div>
      <div class="input-item">
        <label>确认密码:</label>
        <input v-model="cashForm.surePassword" :type="isShowCashSure?'text':'password'">
        <img @click="changeShow(6)" class="open-close pointer" :src="isShowCashSure?close:open">
      </div>
      <div class="input-item">
        <label></label>
        <input type="button" @click="modifyCash" class="btn pointer" value="确认修改">
      </div>
    </Contain>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";

  const PHONE = new RegExp(/^[1][0-9]{10}$/);
  const timerCount = 60;
  export default {
    name: "setting",
    components: {Contain},
    data() {
      return {
        selectIndex: 0,
        open: require("../.././assets/imgs/my/open.png"),
        close: require("../.././assets/imgs/my/close.png"),
        tabs: ["修改密码", "修改手机号", "修改提现密码"],
        modifyForm: {
          code: "",
          newPassword: "",
          oldPassword: "",
          surePassword: ""
        },
        phoneForm: {
          newMobile: "",
          oldCode: "",
          newCode: ""
        },
        cashForm: {
          code: "",
          password: "",
          surePassword: ""
        },
        codeOldText: "获取验证码",
        phoneCodeOld: "获取验证码",
        phoneCodeNew: "获取验证码",
        cashCodeText: "获取验证码",
        isShowOld: false,
        isShowNew: false,
        isShowSure: false,
        isShowPhone: false,
        isShowCash: false,
        isShowCashSure: false,
        userInfo: JSON.parse(localStorage.getItem("userInfo"))
      }
    },
    mounted() {
      if (this.$route.query.index)
        this.selectIndex = this.$route.query.index;
    },
    methods: {
      resetForm() {
        for (let i in this.modifyForm) {
          this.modifyForm[i] = "";
        }
        for (let i in this.cashForm) {
          this.cashForm[i] = "";
        }
        for (let i in this.phoneForm) {
          this.phoneForm[i] = "";
        }
      },
      modifyCash() {
        this.$utils.setCashPassword(this.cashForm, () => {
          this.$toast({content: "提现密码设置成功", position: "middle"});
        });
      },
      modifyPhone() {
        this.$utils.updatePhone(this.phoneForm, () => {
          localStorage.removeItem("userInfo");
          localStorage.removeItem("token");
          localStorage.removeItem("secret");
          this.$toast({content: "密码修改成功，请重新登录", position: "middle"});
          setTimeout(() => {
            this.resetForm();
            this.$router.push({path: "/login", query: {tabIndex: 1}});
          }, 1000);
        });
      },
      modifyPassword() {
        if (this.modifyForm.newPassword != this.modifyForm.surePassword) {
          this.modifyForm.newPassword = this.modifyForm.surePassword = "";
          this.$toast({content: "两次密码不一致，请重新输入", position: "middle"});
        } else {
          this.$utils.updatePassword(this.modifyForm, () => {
            let loginInfo = {loginName: this.mobile, password: ""};
            localStorage.setItem("loginInfo", JSON.stringify(loginInfo));
            localStorage.removeItem("userInfo");
            localStorage.removeItem("token");
            localStorage.removeItem("secret");
            this.$toast({content: "密码修改成功，请重新登录", position: "middle"});
            setTimeout(() => {
              this.resetForm();
              this.$router.push({path: "/login", query: {tabIndex: 1}});
            }, 1000);
          });
        }
      },
      changeShow(type) {
        switch (type) {
          case 1:
            this.isShowOld = !this.isShowOld;
            break;
          case 2:
            this.isShowNew = !this.isShowNew;
            break;
          case 3:
            this.isShowSure = !this.isShowSure;
            break;
          case 4:
            this.isShowPhone = !this.isShowPhone;
            break;
          case 5:
            this.isShowCash = !this.isShowCash;
            break;
          case 6:
            this.isShowCashSure = !this.isShowCashSure;
            break;
        }
      },
      getCode(type) {
        if (type == 1) {
          if (this.passwordTimer)
            return;
          let count = timerCount;
          let data = {type: "030", mobile: this.userInfo.mobile};
          this.$utils.checkCode(data, () => {
            this.passwordTimer = setInterval(() => {
              if (count === 0) {
                clearInterval(this.passwordTimer);
                this.passwordTimer = null;
                this.codeOldText = "重新发送";
              } else {
                count--;
                this.codeOldText = count;
              }
            }, 1000);
            this.$toast({content: "验证码发送成功", position: "middle"});
          });
        } else if (type == 2) {
          if (this.oldTimer)
            return;
          let count = timerCount;
          let data = {type: "060", mobile: this.userInfo.mobile};
          this.$utils.checkCode(data, () => {
            this.oldTimer = setInterval(() => {
              if (count === 0) {
                clearInterval(this.oldTimer);
                this.oldTimer = null;
                this.phoneCodeOld = "重新发送";
              } else {
                count--;
                this.phoneCodeOld = count;
              }
            }, 1000);
            this.$toast({content: "验证码发送成功", position: "middle"});
          });
        } else if (type == 3) {
          if (this.newTimer)
            return;
          let count = timerCount;
          let data = {type: "050", mobile: this.userInfo.mobile};
          this.$utils.checkCode(data, () => {
            this.newTimer = setInterval(() => {
              if (count === 0) {
                clearInterval(this.newTimer);
                this.newTimer = null;
                this.phoneCodeOld = "重新发送";
              } else {
                count--;
                this.phoneCodeOld = count;
              }
            }, 1000);
            this.$toast({content: "验证码发送成功", position: "middle"});
          });
        } else if (type == 4) {
          if (this.cashForm.cashPassword != this.cashForm.cashSurePassword) {
            this.cashForm.cashPassword = this.cashForm.cashSurePassword = "";
          } else {
            if (this.cashTimer)
              return;
            let count = timerCount;
            let data = {type: "040", mobile: this.userInfo.mobile};
            this.$utils.checkCode(data, () => {
              this.cashTimer = setInterval(() => {
                if (count === 0) {
                  clearInterval(this.cashTimer);
                  this.cashTimer = null;
                  this.cashCodeText = "重新发送";
                } else {
                  count--;
                  this.cashCodeText = count;
                }
              }, 1000);
              this.$toast({content: "验证码发送成功", position: "middle"});
            });
          }
        }
      },
      changeTab(index) {
        this.selectIndex = index;
      }
    }
  }
</script>

<style lang="scss" scoped>
  #setting {
    margin-bottom: 10px;

    .tabs {
      height: 50px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      background-color: white;

      span {
        width: auto;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #333333;
        font-size: 16px;
        position: relative;
        margin-right: 20px;

        &.selected {
          font-weight: bold;

          &:after {
            content: '';
            width: 100%;
            height: 4px;
            position: absolute;
            bottom: 0;
            background-color: #1873f2;
          }
        }
      }
    }

    .content {
      margin-top: 1px;
      display: flex;
      align-items: center;
      flex-direction: column;
      padding-top: 50px;
      background-color: white;
    }

    .input-item {
      width: 500px;
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
          border: 1px solid #1873f2;
        }

        &.btn {
          font-size: 16px;
          color: white;
          background-color: #1873f2;
        }
      }
    }
  }
</style>
