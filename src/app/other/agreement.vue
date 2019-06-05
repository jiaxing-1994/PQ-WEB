<template>
  <p>
    服务协议:<br><br>

    在您开户成为本应用用户前请务必仔细阅读以下条款。若您一旦开户，则表示您同意接受本应用的服务并受以下条款的约束。若您不接受
    以下条款，请您立即停止开户或主动停止使用本应用的服务。<br><br>

    一、 本协议的签署和修订<br><br>

    1.1 本应用只接受符合中华人民共和国法律规定的具有完全民事权利和民事行为能力，能够独立承担民事责任的自然人成为网站用户。如您
    不符合资格，请勿开户，否则本应用有权随时中止或终止您的用户资格。在使用本应用服务前，您必须先在本应用平台上进行开户。<br><br>

    1.2 本协议内容包括以下条款及本应用已经发布的或将来可能发布的各类规则。所有规则为本协议不可分割的一部分，与协议正文具有同等
    法律效力。本协议是您与本应用共同签订的，适用于您在本应用的全部活动。在您开户成为用户时，您已经阅读、理解并接受本协议的全
    部条款及各类规则，并承诺遵守中国的各类法律规定，如有违反而导致任何法律后果的发生，您将以自己的名义独立承担所有相应的法律
    责任。<br><br>

    1.3 本应用有权根据需要不时地修改本协议或根据本协议制定、修改各类具体规则并在本应用相关系统板块发布，无需另行单独通知您。您
    应随时地注意本协议及具体规则的变更，若您在本协议及具体规则内容在本应用或其他您可以获知的方式公告变更后继续使用本服务的，
    表示您已充分阅读、理解并接受修改后的协议和具体规则内容，也将遵循修改后的协议和具体规则使用本应用的服务；同时就您在协议和
    具体规则修订前通过本应用进行的交易及其效力，视为您已同意并已按照本协议及有关规则进行了相应的授权和追认。若您不同意修改后
    的协议内容，您应停止使用本应用的服务。本应用可以依其对判断暂时停止提供、限制或改变本应用服务，只要个人用户仍然使用本应用
    服务，即表示您仍然同意本服务协议。
  </p>
</template>

<script>
  import Contain from "../../components/layout/contain";
  import Card from "../../components/layout/card";
  import NavTab from "../../components/tab/nav-tab";

  export default {
    components: {NavTab, Card, Contain},
    data() {
      return {
        tabs: [
          {title: "开户协议", url: "/other/agreement"},
          {title: "新手指引", url: "/other/guid"}
        ]
      }
    },
    methods: {
      back() {
        this.$router.back();
      }
    }
  }
</script>

<style lang="scss" scoped>
  p{
    margin-left: 10px;
    margin-bottom: 10px;
    margin-top: 0;
    text-align: left;
    color: #666666;
    font-size: 14px;
    padding: 20px;
    background-color: white;
  }
</style>
