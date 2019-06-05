<template>
  <Contain id="bank" direction="column">
    <div class="head"><span>{{userInfo.isAuth=="010"?"实名认证":"选择银行卡"}}</span></div>
    <Contain v-if="userInfo.isAuth=='010'" :flex=1 direction="column" class="content auth bgWhite">
      <div class="input-item">
        <label>真实姓名:</label>
        <input v-model="authForm.name" type="text">
      </div>
      <div class="input-item">
        <label>身份证号:</label>
        <input v-model="authForm.card" type="text">
      </div>
      <div class="input-item">
        <label></label>
        <input @click="goAuth" type="button" class="btn pointer" value="立即认证">
      </div>
    </Contain>
    <Contain v-if="userInfo.isAuth=='020'" :flex=1 direction="column" class="content scroll">
      <div class="scroll-content">
        <div v-if="cardList.length > 0" class="card-box">
          <template v-for="(item,index) in cardList">
            <div class="card-item" :key="index">
              <span>{{item.bankName}}</span>
              <span>{{item.cardNum.substr(0,4)}}***********{{item.cardNum.substr(item.cardNum.length-4,item.cardNum.length)}}</span>
              <img class="pointer" @click="deleteCard(item,index)" src="../.././assets/imgs/my/delete.png">
              <img class="pointer" @click="setDefault(item,index)"
                   :src="item.defaulted == '020'?require('../.././assets/imgs/common/checked.png'):require('../.././assets/imgs/common/check.png')">
            </div>
          </template>
        </div>
        <div class="input-box">
          <div class="input-item">
            <label>开户姓名:</label>
            <input v-model="form.realName" type="text">
          </div>
          <div class="input-item">
            <label>开户银行:</label>
            <type-select @change="changeBank" class="bank-select" :defaultOption="bankItem" :options="bankList"
                         :style-type="3"></type-select>
          </div>
          <div class="input-item">
            <label>所在省:</label>
            <type-select class="bank-select" :defaultOption="provinceItem" @change="changeProvince"
                         :options="provinceList" :style-type="3"></type-select>
          </div>
          <div class="input-item">
            <label>所在市:</label>
            <type-select @change="changeCity" class="bank-select" :defaultOption="cityItem" :options="cityList"
                         :style-type="3"></type-select>
          </div>
          <div class="input-item">
            <label>支行全称:</label>
            <input v-model="form.address" type="text">
          </div>
          <div class="input-item">
            <label>银行卡号:</label>
            <input v-model="form.cardNum" type="text" placeholder="请输入银行卡号">
          </div>
          <div class="input-item">
            <label></label>
            <input @click="addBank" type="button" class="btn pointer" value="确认添加">
          </div>
        </div>
      </div>
    </Contain>
  </Contain>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import {mapState} from "vuex";
  import typeSelect from "../../components/common/select";

  export default {
    name: "bank",
    computed: {
      ...mapState(['api', 'userInfo', 'isLoginApp'])
    },
    components: {typeSelect, Contain},
    data() {
      return {
        authForm: {
          name: "",
          card: ""
        },
        form: {
          bankCode: "",
          cardNum: "",
          cityCode: "",
          address: "",
          realName: "",
          bankName: ""
        },
        provinceList: [{cityList: []}],
        bankList: [],
        cardList: [],
        cityList: [],
        provinceItem: {name: ""},
        cityItem: {name: ""},
        bankItem: {name: ""},
        provinceIndex: 0
      }
    },
    activated() {
      if (this.api != "" && this.userInfo.isAuth == "020")
        this.getData();
    },
    methods: {
      deleteCard(item, index) {
        if (item.defaulted == "020")
          this.$toast({content: "默认银行卡不能删除", position: "middle"});
        else
          this.$utils.deleteBankCard({bankId: item.id}, () => {
            this.cardList.splice(index, 1);
            this.$toast({content: "银行卡删除成功", position: "middle"});
          });
      },
      setDefault(item, index) {
        if (item.defaulted == "010") {
          this.$utils.setDefaultBank({bankId: item.id}, () => {
            this.cardList.forEach(i => {
              i.defaulted = "010";
            });
            this.cardList[index].defaulted = "020";
            this.$toast({content: "默认银行卡设置成功", position: "middle"});
          });
        }
      },
      addBank() {
        if (!/^(\d{16}|\d{19})$/.test(this.form.cardNum)) {
          this.$toast({content: "银行卡号填写错误", position: "middle", styleTYpe: 2});
        } else {
          this.$utils.addBankCard(this.form, () => {
            this.getData();
            for(let i in this.form){
              this.form[i] = "";
            }
          });
        }
      },
      getData() {
        this.$utils.bankCardList(res => {
          this.cardList = res.bankList;
          this.form.realName = res.username;
          res.provinceList.forEach(item => {
            item.name = item.province;
            item.cityList.forEach(child => {
              child.name = child.cityName;
            });
          });
          this.provinceList = res.provinceList.slice(0);
          // this.provinceItem = this.provinceList[0];
          // this.cityList = this.provinceList[this.provinceIndex].cityList;
          // this.cityItem = this.cityList[0];
          // this.form.cityCode = this.cityItem.cityCode;
          res.supportBankList.forEach(item => {
            item.name = item.bankName;
          });
          this.bankList = res.supportBankList;
          // this.bankItem = this.bankList[0];
          // this.form.bankName = this.bankItem.bankName;
          // this.form.bankCode = this.bankItem.bankCode;
        });
      },
      changeBank(item) {
        this.form.bankCode = item.bankCode;
        this.form.bankName = item.bankName;
      },
      changeProvince(item) {
        this.cityList = item.cityList;
        this.cityItem = this.cityList[0];
        this.form.cityCode = this.cityItem.cityCode;
      },
      changeCity(item) {
        this.form.cityCode = item.cityCode;
      },
      goAuth() {
        if (this.authForm.name == "" || this.authForm.card == "") {
          this.$toast({content: "请填写完整信息", position: "middle"});
        } else {
          this.$utils.checkUser(this.authForm, () => {
            this.$store.state.userInfo.isAuth = "020";
            this.getData();
            this.$toast({content: "实名认证成功", position: "middle"});
          });
        }
      }
    },
    watch: {
      userInfo(val) {
        if (val.isAuth == "020")
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

  #bank {
    margin-bottom: 10px;

    .head {
      height: 50px;
      background-color: white;

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
    }

    .content {
      margin-top: 1px;
      display: flex;
      align-items: center;
      flex-direction: column;

      &.auth {
        padding-top: 35px;
      }

      &.auth-box {
        margin-top: 10px;
        padding-top: 35px;
      }

      &.bgWhite {
        background-color: white;
      }

      &.scroll {
        position: relative;
        overflow-y: auto;

        .scroll-content{
          width: 100%;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          position: absolute;

          .input-box {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            margin-top: 10px;
            padding-top: 35px;
            background-color: white;
          }
        }
      }

      .card-box {
        padding: 10px 0;
        background-color: white;

        .card-item {
          margin: 0 10px;
          padding: 0 10px;
          height: 50px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #f2f2f2;

          span {
            &:first-child {
              flex: 1;
              text-align: left;
            }
          }

          img {
            margin-left: 40px;
            margin-right: 20px;
          }

          &.default {
            background-color: #f2f3f5;
          }
        }
      }

      .input-item {
        width: 500px;
        height: 50px;
        display: flex;
        margin-bottom: 20px;
        align-items: center;

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
  }
</style>
