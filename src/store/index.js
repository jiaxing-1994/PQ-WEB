import Vue from 'vue'
import Vuex from 'vuex'
import market from './market'
import trade from './trade'
import vtrade from './vtrade'

Vue.use(Vuex);

const store = new Vuex.Store({
    modules:{
        market:market,
        trade:trade,
        vtrade:vtrade,
    },
    state:{
        environment:'build', //build 正式环境 test 测试环境
        isLoginApp:false,//用户是否登录
        userInfo:{
            mobile:'', //用户账号
            password:'', //用户密码
            token:'',
            secret:'',
        },
        loginInfo:{
          balance:0,
          isAuth:"010",
          register:"010"
        },//保存用户余额，签到，实名状态
        imitate:0,//开户模拟金
        openActivity:null,//开户活动
        webApi:'', //平台接口地址(主要获取图片用)
        payApi:'', //支付接口地址
        api:'', //接口地址
        rateList:{
            CNY:{
                exchangeRate:1
            }
        }, //汇率列表
        currentQuota:{
            commodity_name:'',
            commodity_no:'',
            quatoData:[0,0,0,0,0,0],
            currencyNo:''
        },//当前选中的行情
        rmbOrUsd:3, //是否双币种 1人民币 2美元 3双币种
        quotaType:0,//当前期货类别 0国内 1国际
        canCloseLayer:false,//是否可以关闭弹窗
        isSendData:false,//是否正在发送数据
        tradeType:1, //0模拟 1实盘
        needMoney:0,//下单所需资金
        simPrice:0,
        quotaTabIndex:0,//0国内 1国际
        loginTabIndex:0,//登录弹窗的tab选项
        isShowForget:false//是否显示忘记密码
    }
})

export default store;
