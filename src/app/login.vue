<template>
  <div id="login">
    <div v-show="!isShowForget" class="box">
      <!--      <span class="title">{{title}}</span>-->
      <div class="tab">
        <span @click="changeTab(0)" :class="loginTabIndex==0?'selected':''">手机开户</span>
        <span @click="changeTab(1)" :class="loginTabIndex==1?'selected':''">手机登录</span>
      </div>
      <form class="input-box register" v-show="loginTabIndex==0">
        <div class="input-item">
          <label>手机号</label>
          <input autocomplete="off" v-model="registerForm.mobile" type="tel" @blur="inputEnd($event)"
                 @focus="startAnimate($event)">
        </div>
        <div class="input-item">
          <label>验证码</label>
          <input autocomplete="off" v-model="registerForm.code" type="text" @blur="inputEnd($event)"
                 @focus="startAnimate($event)">
          <u @click="getImageCode(1)" class="code">{{registerCodeText}}</u>
        </div>
        <div class="input-item">
          <label>密码</label>
          <input autocomplete="new-password" v-model="registerForm.password" type="password" @blur="inputEnd($event)"
                 @focus="startAnimate($event)">
        </div>
        <div class="input-item">
          <label>邀请码(非必填)</label>
          <input autocomplete="off" v-model="registerForm.inviteCode" type="text" @blur="inputEnd($event)"
                 @focus="startAnimate($event)">
        </div>
        <div class="agreement">
          <img @click="changeCheck"
               :src="isChecked?require('.././assets/imgs/common/checked.png'):require('.././assets/imgs/common/check.png')"><span>我已阅读，并同意
          <router-link to="/other/agreement">《开户协议》</router-link></span>
        </div>
        <div class="btn" @click="openAccount">极速开户</div>
      </form>
      <form class="input-box login" v-show="loginTabIndex==1">
        <div class="input-item">
          <label>手机号</label>
          <input autocomplete="off" v-model="loginForm.loginName" type="tel" @blur="inputEnd($event)"
                 @focus="startAnimate($event)">
        </div>
        <div class="input-item">
          <label>密码</label>
          <input autocomplete="new-password" v-model="loginForm.password" type="password" @blur="inputEnd($event)"
                 @focus="startAnimate($event)">
        </div>
        <u @click="showForget">忘记密码?</u>
        <div class="btn" @click="loginAccount(1)">立即登录</div>
      </form>
    </div>
    <div class="activity">
      <div class="activity-title">
        <span>开户大礼包</span>
        <span>赶紧开户领取奖励吧</span>
      </div>
      <div class="coupon-item">
        <span class="gift-item one">
            <span>1</span>
        </span>
        <div class="coupon cash">
          <span>￥<span>{{imitate}}</span></span>
          <span>(模拟金)</span>
        </div>
      </div>
      <template v-if="openActivity != null">
        <div class="coupon-item">
          <span class="gift-item" :class="openActivity.typeName.indexOf('现金') > -1 ? 'one':'two'">
            <span>2</span>
          </span>
          <div class="coupon" :class="openActivity.typeName.indexOf('现金') > -1 ? 'cash':'cost'">
            <span>￥<span>{{openActivity != null ?openActivity.amount:0}}</span></span>
            <span>({{openActivity != null ?openActivity.typeName:'现金红包'}})</span>
          </div>
        </div>
      </template>
    </div>
    <div v-show="isShowForget" class="forget-box">
      <Card :flex=0 class="nav">
        <img class="location" src=".././assets/imgs/discover/location.png">
        <span class="back" @click="back">登录</span>&nbsp;&nbsp;>&nbsp;&nbsp;
        <span>找回密码</span>
      </Card>
      <form class="input-box forget">
        <div class="input-item">
          <label>手机号</label>
          <input autocomplete="off" v-model="forgetForm.mobile" type="tel" @blur="inputEnd($event)"
                 @focus="startAnimate($event)">
        </div>
        <div class="input-item">
          <label>验证码</label>
          <input autocomplete="new-password" v-model="forgetForm.code" type="text" @blur="inputEnd($event)"
                 @focus="startAnimate($event)">
          <u class="code" @click="getImageCode(3)">{{forgetCodeText}}</u>
        </div>
        <div class="input-item">
          <label>新密码</label>
          <input autocomplete="new-password" v-model="forgetForm.password" type="password" @blur="inputEnd($event)"
                 @focus="startAnimate($event)">
        </div>
        <div class="input-item">
          <label>确认密码</label>
          <input autocomplete="new-password" v-model="surePassword" type="password" @blur="inputEnd($event)"
                 @focus="startAnimate($event)">
        </div>
        <div class="btn" @click="forget">确认修改</div>
      </form>
    </div>
    <!--    <Card :flex=0 class="footer">-->
    <!--      2019-2020成都盈透科技有限公司&nbsp;版权所有@-->
    <!--    </Card>-->
    <div v-show="isShowLayer" class="layer-box">
      <span class="layer-title">请输入图形验证码</span>
      <img @click="hideLayer" class="layer-close" src=".././assets/imgs/common/close.png">
      <div class="layer-input">
        <input type="text" v-model="imageCode">
        <img :src="imageCodeUrl" @click="changeImageCode" class="imageCode">
      </div>
      <div class="layer-action">
        <span @click="hideLayer">关闭</span>
        <span @click="okClick">确认</span>
      </div>
    </div>
    <div v-show="isShowLayer" class="mask"></div>

    <div class="layer-content" id="layer-register" v-if="openActivity != null">
      <p>首次充值可获得{{openActivity.amount}}元{{openActivity.typeName}}</p>
      <div :class="openActivity.typeName.indexOf('现金') != -1 ? 'cash':'cost'">
        <span>￥&nbsp;<span>{{openActivity.amount}}</span></span>
        <span>{{openActivity.typeName}}</span>
      </div>
      <div class="cost">
        <span>￥&nbsp;<span>{{imitate}}</span></span>
        <span>模拟金</span>
      </div>
      <p><span>Tip:</span>红包已放入我的红包，体验金可在模拟交易查看</p>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import Contain from "../components/layout/contain";
  import Card from "../components/layout/card";

  const PHONE = new RegExp(/^[1][0-9]{10}$/);
  const timerCount = 60;

  export default {
    name: "login",
    components: {Contain, Card},
    computed: {
      ...mapState(['api', 'imitate', 'openActivity', 'loginTabIndex','isShowForget'])
    },
    data() {
      return {
        title: "登录",
        loginForm: {
          loginName: "",
          password: ""
        },
        registerForm: {
          mobile: "",
          code: "",
          password: "",
          inviteCode: ""
        },
        forgetForm: {
          mobile: "",
          code: "",
          password: ""
        },
        surePassword: "",
        imageCode: "",
        isChecked: true,
        //记录动画开始前的位置
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        registerCodeText: "获取验证码",
        imageCodeUrl: "",
        isShowLayer: true,
        forgetCodeText: "获取验证码",
        //1注册，2登录
        imageCodeType: 1,
        loginErrorNum: localStorage.getItem("loginErrorNum") ? localStorage.getItem("loginErrorNum") : 0
      }
    },
    watch: {
      api() {
        if (this.api != "") {
          const timer = setTimeout(() => {
            clearTimeout(timer);
            this.getData();
          }, 3000);
        }
      },
      loginTabIndex(val) {
        if (val == 1) {
          $(".activity").hide();
        } else {
          $(".activity").show();
        }
      }
    },
    methods: {
      resetForm() {
        for (let i in this.loginForm) {
          this.loginForm[i] = "";
        }
        for (let i in this.registerForm) {
          this.registerForm[i] = "";
        }
        for (let i in this.forgetForm) {
          this.forgetForm[i] = "";
        }
        const input = $(".input-item input");
        const item = input.parent();
        const label = item.find("label");
        item.css({border: '1px solid #e5e5e5'});
        label.animate({top: this.top, 'font-size': '14px'});
        input.animate({bottom: this.bottom});
      },
      hideLayer() {
        $(".mask").toggle('fast');
        $(".layer-box").toggle('fast');
      },
      changeImageCode() {
        //type 010注册，020找回密码，070登录
        const phone = this.imageCodeType == 1 ? this.registerForm.mobile : (this.imageCodeType == 2 ? this.loginForm.loginName : this.forgetForm.mobile);
        const type = this.imageCodeType == 1 ? '010' : (this.imageCodeType == 2 ? '070' : '020');
        this.imageCodeUrl = `${this.api}/imageCode?mobile=${phone}&type=${type}&t=${Math.random() * 1000}`;
      },
      getImageCode(type) {
        this.imageCodeType = type;
        //type 1注册的图形,2登录失败三次的图形验证码
        if (type == 1 && !PHONE.test(this.registerForm.mobile)) {
          this.$toast({content: "请填写正确的电话号码", position: "middle"});
        } else if (type == 2 && !PHONE.test(this.loginForm.loginName)) {
          this.$toast({content: "请填写正确的电话号码", position: "middle"});
        } else if (type == 3 && !PHONE.test(this.forgetForm.mobile))
          this.$toast({content: "请填写正确的电话号码", position: "middle"});
        else {
          this.changeImageCode();
          $(".mask").toggle('fast');
          $(".layer-box").toggle('fast');
        }
      },
      okClick() {
        this.hideLayer();
        if (this.imageCodeType == 1)
          this.getRegisterCode();
        else if (this.imageCodeType == 2)
          this.loginAccount();
        else
          this.getForgetCode();
      },
      getForgetCode() {
        if (!PHONE.test(this.forgetForm.mobile))
          this.$toast({content: "请填写正确的电话号码", position: "middle"});
        else {
          const obj = {
            mobile: this.forgetForm.mobile,
            type: "020",
            imgCode: this.imageCode
          };
          //获取短信验证码
          this.$utils.freeCode(obj, () => {
            this.imageCode = "";
            let forgetCount = timerCount;
            this.forgetTimer = setInterval(() => {
              if (forgetCount == 0) {
                clearInterval(this.forgetTimer);
                this.forgetTimer = null;
                this.forgetCodeText = "重新发送"
              } else {
                forgetCount--;
                this.forgetCodeText = forgetCount;
              }
            }, 1000);
          });
        }
      },
      forget() {
        if (!PHONE.test(this.forgetForm.mobile))
          this.$toast({content: "请填写正确的电话号码", position: "middle"});
        else if (this.forgetForm.code == "")
          this.$toast({content: "请填写完整信息", position: "middle"});
        else if (this.forgetForm.password == "")
          this.$toast({content: "请填写密码", position: "middle"});
        else if (this.forgetForm.password.length < 6 || this.forgetForm.password.length > 16)
          this.$toast({content: "密码格式错误", position: "middle"});
        else if (this.forgetForm.password != this.surePassword) {
          this.surePassword = "";
          this.forgetForm.password = "";
          this.$toast({content: "两次密码不一致", position: "middle"});
        } else {
          this.$utils.resetPassword(this.forgetForm, () => {
            this.back();
            this.resetForm();
            this.$store.state.loginTabIndex = 1;
            this.$toast({content: "修改密码成功，请重新登录", position: "middle"});
          });
        }
      },
      getRegisterCode() {
        if (!PHONE.test(this.registerForm.mobile))
          this.$toast({content: "请填写正确的电话号码", position: "middle"});
        else {
          const obj = {
            mobile: this.registerForm.mobile,
            type: "010",
            imgCode: this.imageCode
          };
          //获取短信验证码
          this.$utils.freeCode(obj, () => {
            this.imageCode = "";
            let registerCount = timerCount;
            this.registerTimer = setInterval(() => {
              if (registerCount == 0) {
                clearInterval(this.registerTimer);
                this.registerTimer = null;
                this.registerCodeText = "重新发送"
              } else {
                registerCount--;
                this.registerCodeText = registerCount;
              }
            }, 1000);
          }, () => {
            this.imageCode = "";
          });
        }
      },
      openAccount() {
        if (!PHONE.test(this.registerForm.mobile))
          this.$toast({content: "请填写正确的电话号码", position: "middle"});
        else if (this.registerForm.code == "")
          this.$toast({content: "请填写完整信息", position: "middle"});
        else if (this.registerForm.password == "")
          this.$toast({content: "请填写密码", position: "middle"});
        else if (this.registerForm.password.length < 6 || this.registerForm.password.length > 16)
          this.$toast({content: "密码格式错误", position: "middle"});
        else if (!this.isChecked)
          this.$toast({content: "请同意用户注册协议", position: "middle"});
        else {
          if (!this.registerForm.inviteCode)
            this.registerForm.inviteCode = "";
          this.$utils.register(this.registerForm, res => {
            this.loginForm.loginName = this.registerForm.mobile;
            this.loginForm.password = this.registerForm.password;
            this.loginAccount(2);
          });
        }
      },
      loginAccount(type) {
        this.$store.state.canCloseLayer = false;
        if (!PHONE.test(this.loginForm.loginName))
          this.$toast({content: "请填写正确的电话号码", position: "middle"});
        else if (this.loginForm.password == "")
          this.$toast({content: "请填写密码", position: "middle"});
        else if (this.loginForm.password.length < 6 || this.registerForm.password.length > 16)
          this.$toast({content: "密码格式错误", position: "middle"});
        else {
          if (this.loginErrorNum >= 3 && this.imageCode == "") {
            this.getImageCode(2);
          } else {
            if (this.loginErrorNum >= 3)
              this.loginForm.code = this.imageCode;
            this.imageCode = "";
            this.$utils.login(this.loginForm, res => {
              localStorage.removeItem("loginErrorNum");
              localStorage.setItem("token", res.token);
              localStorage.setItem("secret", res.secret);
              localStorage.setItem("loginInfo", JSON.stringify(this.loginForm));
              localStorage.setItem("userInfo", JSON.stringify(res));
              this.$store.state.userInfo = res;
              this.$store.state.isLoginApp = true;
              if (type == 2) {
                this.$layer({
                  headerText: '开户活动',
                  isShowBg: true,
                  contentText: '#layer-register',
                  btn: [{
                    text: '去模拟盘交易',
                    isClose: true,
                    method: this.goImitate
                  }, {
                    text: '去实盘交易',
                    isClose: true,
                    active: true,
                    method: this.goPage
                  }]
                });
              } else{
                this.resetForm();
                this.$store.state.canCloseLayer = true;
              }
              // this.$router.back();
            }, err => {
              if (err) {
                this.loginErrorNum = err.num;
                localStorage.setItem("loginErrorNum", err.num);
              }
            });
          }
        }
      },
      goImitate() {
        this.$store.state.tradeType = 0;
        this.$router.push({path: "/home"});
      },
      goPage() {
        this.$store.state.tradeType = 1;
        this.$router.push({path: "/home"});
      },
      getData() {
        //获取开户时领取的模拟金
        this.$utils.qryParameters({paramStr: 'vs.sim.amount'}, res => {
          this.$store.state.imitate = res['vs.sim.amount'];
          this.$utils.activityList({activityType: '050'}, rel => {
            this.$utils.activityCoupon({activityId: rel[0].id}, ret => {
              this.$store.state.openActivity = ret;
            });
          });
        });
      },
      showForget() {
        // const box = $(".box");
        // const activity = $(".activity");
        // this.left = box.css("left");
        // this.right = box.css("right");
        //两个动画一起运行，回调可以写一个任何一个里边
        // box.animate({left: '210px'}, 'slow');
        // activity.animate({right: '210px'}, 'slow', () => {
        this.$store.state.isShowForget = true;
        // });
      },
      back() {
        // const box = $(".box");
        const activity = $(".activity");
        activity.hide();
        this.$store.state.isShowForget = false;
        // box.animate({left: this.left}, 'slow');
        // activity.animate({right: this.right}, 'slow');
      },
      changeCheck() {
        this.isChecked = !this.isChecked;
      },
      changeTab(index) {
        this.$store.state.loginTabIndex = index;
        // const box = $(".box");
        // const boxLeft = $(".jx-layer-box").offset().left;
        // if (this.loginTabIndex == 1) {
        //   this.left = box.css("left");
        //   this.right = box.css("right");
        // $("#login").css({width: '480px'});
        // $(".jx-layer-box").animate({left: `${boxLeft + 210}px`});
        // } else {
        // const isShow = $(".activity").css("display");
        // if (isShow == "none") {
        //   $(".jx-layer-box").animate({left: `${boxLeft - 210}px`});
        //   $("#login").css({width: 'auto'});
        // }
        // }
      },
      startAnimate(e) {
        const input = $(e.currentTarget);
        const item = input.parent();
        const label = item.find("label");
        if (input.val() == "") {
          this.bottom = input.css("bottom");
          this.top = label.css("top");
        }
        item.css({border: '1px solid #1873f2'});
        label.animate({top: '5px', 'font-size': '12px'});
        input.animate({bottom: '5px'});
      },
      inputEnd(e) {
        const input = $(e.currentTarget);
        const item = input.parent();
        const label = item.find("label");
        if (input.val() == "") {
          item.css({border: '1px solid #e5e5e5'});
          label.animate({top: this.top, 'font-size': '14px'});
          input.animate({bottom: this.bottom});
        } else
          item.css({border: '1px solid #e5e5e5'});
      }
    }
  }
</script>

<style lang="scss" scoped>

  #layer-register {
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;

    div {
      width: 80%;
      height: 70px;
      color: white;
      display: flex;

      &.cash {
        background: url(".././assets/imgs/my/cash.png") no-repeat;
        background-size: 100% 100%;
        margin-bottom: 20px;
      }

      &.cost {
        background: url(".././assets/imgs/my/cost.png") no-repeat;
        background-size: 100% 100%;
      }

      > span {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;

        &:first-child {
          span {
            font-size: 30px;
          }
        }
      }
    }

    p {
      span {
        color: #8f8f94;
      }
    }
  }

  #login {
    background-color: rgba(38, 45, 76, 0.1);
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    .box {
      width: 400px;
      height: 530px;
      background-color: white;
      display: flex;
      padding: 0 40px;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;

      .title {
        color: #333333;
        font-size: 20px;
        margin-top: 30px;
      }

      .tab {
        width: 100%;
        height: 60px;
        display: flex;
        margin-top: 20px;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #e5e5e5;

        span {
          flex: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666666;
          height: 100%;
          font-size: 14px;

          &.selected {
            color: #1873f2;
            border-bottom: 2px solid #1873f2;
          }
        }
      }
    }

    .input-box {
      width: 100%;
      display: flex;
      flex-direction: column;

      .input-item {
        position: relative;
        display: flex;
        height: 48px;
        border: 1px solid #e5e5e5;
        border-radius: 4px;
        align-items: center;
        padding: 0 20px;
        margin-bottom: 10px;

        label {
          position: absolute;
          color: #999999;
          font-size: 14px;
        }

        input {
          width: 80%;
          color: #333333;
          padding: 0;
          font-size: 14px;
          position: absolute;
        }

        .code {
          width: auto;
          position: absolute;
          right: 20px;
          color: #999999;
          font-size: 12px;
        }
      }

      u {
        cursor: pointer;
        color: #999999;
        font-size: 12px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }

      .btn {
        width: 100%;
        text-align: center;
        height: 50px;
        line-height: 50px;
        color: white;
        font-size: 16px;
        margin-top: 20px;
        border-radius: 4px;
        cursor: pointer;
        background-color: #1873f2;
      }

      .agreement {
        width: 100%;
        display: flex;
        margin-top: 20px;
        align-items: center;

        img {
          cursor: pointer;
        }

        span {
          color: #666666;
          font-size: 12px;
          margin-left: 5px;

          a {
            cursor: pointer;
            outline: none;
            text-decoration: none;
            color: #1873f2;
          }
        }
      }
    }

    .activity {
      margin-left: 20px;
      width: 400px;
      height: 530px;
      z-index: 1;
      left: 480px;
      background-color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: absolute;

      .activity-title {
        margin-top: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 50px;

        span {
          &:first-child {
            font-size: 20px;
            color: #333333;
            margin-bottom: 5px;
          }

          &:last-child {
            font-size: 16px;
            color: #999999;
          }
        }
      }

      .coupon-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .gift-item {
          display: flex;
          width: 50px;
          height: 50px;
          align-items: center;
          justify-content: center;
          border-radius: 25px;

          span {
            display: block;
            width: 40px;
            height: 40px;
            text-align: center;
            line-height: 40px;
            border-radius: 20px;
            color: white;
            font-size: 24px;
          }

          &.one {
            background-color: #ffdbde;

            span {
              background-color: #ff4c5b;
            }
          }

          &.two {
            background-color: #ffecd1;

            span {
              background-color: #ff9f19;
            }
          }
        }

        .coupon {
          margin-top: 10px;
          width: 360px;
          height: 80px;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;

          > span {
            color: white;
            padding: 0 20px;

            &:first-child {
              font-size: 20px;

              span {
                font-size: 40px;
              }
            }

            &:last-child {
              font-size: 14px;
            }
          }

          &.cash {
            background: url(".././assets/imgs/common/cash.png") no-repeat;
            background-size: 100% 100%;
          }

          &.cost {
            background: url(".././assets/imgs/common/cost.png") no-repeat;
            background-size: 100% 100%;
          }
        }
      }
    }

    .forget-box {
      width: 400px;
      padding: 0 40px;
      height: 530px;
      background-color: white;

      .nav {
        align-items: center;
        margin-top: 30px;
        margin-bottom: 30px;

        .location {
          width: 20px;
          height: 25px;
          margin-right: 10px;
        }

        .back {
          cursor: pointer;
        }

        span {
          color: #999999;
          font-size: 14px;
        }
      }
    }

    .mask {
      position: fixed;
      z-index: 3;
      background-color: rgba(0, 0, 0, 0.2);
      width: 100%;
      height: 100%;
      display: none;
    }

    .layer-box {
      top: 50%;
      left: 50%;
      margin-left: -200px;
      margin-top: -100px;
      width: 360px;
      height: 160px;
      z-index: 4;
      display: none;
      background-color: white;
      position: fixed;
      padding: 20px;

      .layer-close {
        top: 10px;
        right: 10px;
        cursor: pointer;
        position: absolute;
      }

      .layer-title {
        color: #333333;
        font-size: 16px;
      }

      .layer-input {
        display: flex;
        align-items: center;
        width: 100%;
        margin-top: 50px;
        margin-bottom: 30px;

        input {
          flex: 1;
          height: 30px;
          padding: 0 20px;
          background-color: #f2f2f2;
        }

        img {
          width: 90px;
          height: 30px;
          cursor: pointer;
          margin-left: 10px;
          text-align: center;
          line-height: 30px;
          border: 1px solid #f2f2f2;
        }
      }

      .layer-action {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        span {
          display: inline-block;
          width: 90px;
          height: 30px;
          cursor: pointer;
          text-align: center;
          line-height: 30px;
          font-size: 14px;

          &:first-child {
            color: #333333;
            border: 1px solid #cccccc;
            margin-right: 5px;
          }

          &:last-child {
            color: white;
            border: 1px solid #1873f2;
            background-color: #1873f2;
            margin-left: 5px;
          }
        }
      }
    }

    .footer {
      min-height: 50px;
      display: flex;
      color: #6b7399;
      font-size: 14px;
      position: fixed;
      width: 100%;
      bottom: 0;
      left: 0;
      align-items: center;
      justify-content: center;
      background-color: #131625;
    }
  }
</style>
