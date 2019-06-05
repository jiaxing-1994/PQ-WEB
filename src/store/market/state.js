const state = {
    isConnecting:true,//是否连接中 用来判断是否显示加载动画
    addressLogin:'ws://quote.vs.com:8888',//实盘行情地址
    addressNotLogin:'ws://quote.vs.com:8888',//模拟盘行情地址
    chartDataHttp:'',//历史图表接口
    isReConnect:false,//是否重连
    isConnectMarket:false,//是否连接行情
    isMarketLogin:false,//是否行情登录
    isCanConnectTrade:false,//是否可以链接交易
    internationalCommodity:{}, //国际期货行情数据
    domesticCommodity:{}, //国内期货行情数据
    allCommodity:{},//全部合约
    allSubsCommodity:{},//全部订阅的合约
    subsCommodity:{},//订阅的所有行情数据
    marketSocket:null, //行情WS实例
    marketConfig:{
        version: '2.0',
        url_address:'ws://quote.vs.com:8888', //ws://192.168.0.232:9102 ws://quote.vs.com:8888
        userName:'15390030250',
        password:'123qweasd',
        subscribeType:['FO','FI'], //需要订阅的合约类型
    },
    chooseQuatoType:'FO',
    LastData:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],//选择的行情的最新数据
    selectContract:{
        commodity_no:''
    },//止损止盈条件单选择的合约
    selectLastData:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],//止损止盈条件单选择的合约的最新数据
    isDepth:false,//是否深度订阅
    depthLastData:{},//深度行情数据
    subscribeContract:['CL'], //订阅的合约 为空则订阅全部数据
    totalFloatProfit:0,//总浮动盈亏
    vTotalFloatProfit:0,
    //心跳
    heartCheck:{
        timeout:20000,
        timeoutObj:null,
    },
    tickerList:[],//逐笔明细数据
    depositList:{
        CL:1,
    }, //合约保证金列表
    feeList:{},//手续费列表
    loginNum:0,//登录次数
}

export default state;