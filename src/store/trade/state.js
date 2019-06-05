const state = {
    addressTrue:'',//实盘交易地址
    addressMock:'', //模拟交易地址
    tradeConfig:{
        Version:'3.3',
        url_address:'ws://192.168.0.227:36999/',//5:ws://192.168.0.232:6102/ 6:ws://192.168.0.227:36999/
        ClientNo:'15390030250',//5:004264 6:dev001
        PassWord:'123qweasd', //5:UEVKZEJm 6:MTIz
        IsMock:1,
        Source:'N_WEB',
    },
    tradeSocket:null,//交易ws实例
    isReConnect:false,//是否重连
    isConnectTrade:false, //是否连接交易
    isTradeLogin:false,//是否登录交易
    tradeBascData:0,//风险度数据
    deposit:0,//总保证金
    totalBalance:0,//总资产
    todayCanUseBalance:0,//今可用
    Balance:0,//余额
    capitalList:[],//资金列表
    orderInsertList:[],//报单提交暂存列表
    allOrderList:[],//所有订单列表
    positionList:{},//持仓列表
    isLoadPosition:true,//是否加载持仓
    templateList:[],//挂单列表
    stopLossList:[],//止损单列表
    conditionList:[],//条件单列表
    chooseContract:{}, //选择的合约
    totalPositionNum:0, //总持仓量
    tradeLoginStatus:0, //0未尝试登录 1已尝试登录 2登录成功 3登录失败
    isFinishActivity:false,//是否完成了活动
    activityStatus:'010',//010没完成 020完成
    activityId:'',//活动ID
    couponId:'',//优惠券ID
    couponName:'现金红包',//优惠券名称
    received:'010',//是否领取 010没领取 020领取
    faceValue:0,//优惠券金额
    activitiesName:'',//活动名称
    heartCheck:{
        timeout:10000,
        timeoutObj:null,
    },
}

export default state;