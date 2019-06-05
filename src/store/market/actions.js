import Vue from 'vue'
import {getFormalDate} from '../../util/index'
const actions = {
    //连接行情
    connectQuato(context){
        var store = context.rootState;//根store
        var state = context.state;//当前store
        state.isCanConnectTrade = false;
        state.isConnecting = true;
        //清除心跳监听
        if(state.heartCheck.timeoutObj!=null){
            clearTimeout(state.heartCheck.timeoutObj);
        }
        //重置ws接口
        if(state.marketSocket){
            state.marketSocket.close();
            state.marketSocket = null;
        }
        // //判断连接行情地址
        if(store.isLoginApp&&state.loginNum != 2){
            //登录
            state.marketConfig.url_address = state.addressLogin[0]; //实盘行情
            state.marketConfig.userName = store.userInfo.mobile;
            state.marketConfig.password = store.userInfo.password;
        }else{
            //未登录
            state.marketConfig.url_address = state.addressNotLogin[0]; //模拟行情
        }
        if(state.marketConfig.url_address==''){
            state.isConnecting = false;
            return;
        }
        state.marketSocket = new WebSocket(state.marketConfig.url_address);
        state.marketSocket.onopen = function(){
            state.isConnectMarket = true;
            if(state.isReConnect){
                // layer.msg('行情重连成功',{
                //     time:1000
                // })
                state.isReConnect = false;
            }
            var loginParam = {
                method:'req_login',
                req_id:'',
                data:{
                    user_name:state.marketConfig.userName,
                    password:state.marketConfig.password,
                    protoc_version:state.marketConfig.version
                }
            };
            state.marketSocket.send(JSON.stringify(loginParam));

        };
        state.marketSocket.onmessage = function(message){
            context.dispatch('WSmessage',message.data)
        };
        state.marketSocket.onclose = function(){
            state.isConnectMarket = false;
            state.isCanConnectTrade = false;
            state.isMarketLogin = false;
        };
        state.marketSocket.onerror = function(){
        };
    },
    //ws返回数据处理
    WSmessage(context,message){
        var store = context.rootState;//根store
        var state = context.state;//当前store
        message = JSON.parse(message);
        if(message.method == 'on_rsp_login'){
            if(message.error_code == 0){
                context.state.isMarketLogin = true;
                console.log('连接行情服务器成功');
            }else{
                console.log('登录失败');
                if(store.isLoginApp){
                    if(state.loginNum==2){
                        state.isConnecting = false;
                        store.trade.isLoadPosition = false;
                        store.vtrade.isLoadPosition = false;
                        vue.$toast({
                            content:'行情登录失败'
                        })
                        return;
                    }
                    state.loginNum++;
                    var loginParam = {
                        method:'req_login',
                        req_id:'',
                        data:{
                            user_name:state.marketConfig.userName,
                            password:state.marketConfig.password,
                            protoc_version:state.marketConfig.version
                        }
                    };
                    state.marketSocket.send(JSON.stringify(loginParam));
                }
            }
        }else if(message.method == 'on_rsp_commodity_list'){
            //所有可订阅合约
            const contract = message.data.commodity_list;
            for(var i=0,len=contract.length;i<len;i++){
                if(state.allCommodity[contract[i].commodity_no]){
                    state.allCommodity[contract[i].commodity_no].main_contract_no = contract[i].main_contract_no;
                    state.allCommodity[contract[i].commodity_no].mainContract = contract[i].main_contract_no;
                }
            }
            context.dispatch('subscribeAllContract');
        }else if(message.method == 'on_rtn_quote'){
            //行情
            var lastData = message.data;//最新行情
            var lastNo = lastData[0].split('_')[1];
            //国际
            if(lastData[0].indexOf('FO')!=-1){
                var internationalList = context.state.internationalCommodity;
                if(internationalList[lastNo].quatoData&&internationalList[lastNo].quatoData[0]!=0){
                    internationalList[lastNo].color = lastData[3]>internationalList[lastNo].quatoData[3]?'colorBgUp':lastData[3]-internationalList[lastNo].quatoData[3]==0?'':'colorBgDown';
                    internationalList[lastNo].isShowBg = true;
                    setTimeout(()=>{
                        internationalList[lastNo].isShowBg = false;
                    },500);
                }
                internationalList[lastNo].quatoData = lastData.slice(0);
                // internationalList[lastNo].isOnTrade = checkTradeTime({tradeTime:internationalList[lastNo].tradingTime,notTradeTime:internationalList[lastNo].notTradingTime});
            }
            //国内
            if(lastData[0].indexOf('FI')!=-1){
                var domesticList = context.state.domesticCommodity;
                if(domesticList[lastNo].quatoData&&domesticList[lastNo].quatoData[0]!=0){
                    domesticList[lastNo].color = lastData[3]>domesticList[lastNo].quatoData[3]?'colorBgUp':lastData[3]-domesticList[lastNo].quatoData[3]==0?'':'colorBgDown';
                    domesticList[lastNo].isShowBg = true;
                    setTimeout(()=>{
                        domesticList[lastNo].isShowBg = false;
                    },500);
                }
                domesticList[lastNo].quatoData = lastData.slice(0);
                // domesticList[lastNo].isOnTrade = checkTradeTime({tradeTime:domesticList[lastNo].tradingTime,notTradeTime:domesticList[lastNo].notTradingTime});

                if(context.rootState.currentQuota.commodity_no == ''){
                    context.rootState.currentQuota = domesticList[Object.keys(domesticList)[0]];
                    context.dispatch('depthSubscribe');
                    context.dispatch('tickerSubscribe');
                }
            }
            Object.assign(context.state.allSubsCommodity,context.state.internationalCommodity,context.state.domesticCommodity);
            //选择的合约的最新数据
            if(store.currentQuota.commodity_no == message.data[0].split("_")[1]){
                context.state.LastData = message.data.slice(0);
            }
            //选择的合约的最新数据
            if(state.selectContract.commodity_no == message.data[0].split("_")[1]){
                context.state.selectLastData = message.data.slice(0);
            }
            if(store.trade.isTradeLogin&&JSON.stringify(store.trade.positionList)!='{}'){
                //如果交易登录的话并且有持仓的话 则计算持仓浮动盈亏
                context.dispatch('positionFloatProfit',message.data);
            }else{
                context.state.totalFloatProfit = 0;
            }
            if(store.vtrade.isTradeLogin&&JSON.stringify(store.vtrade.positionList)!='{}'){
                //如果交易登录的话并且有持仓的话 则计算持仓浮动盈亏
                context.dispatch('vPositionFloatProfit',message.data);
            }else{
                context.state.vTotalFloatProfit = 0;
            }
            function checkTradeTime(obj){
                var tradeTime = obj.tradeTime;
                var notTradeTime = obj.notTradeTime;
                var week = new Date().getDay();
                if(week==0||week==6){
                    return false;
                }
                var currentYMD = getFormalDate(new Date().getTime(),'yyyy/mm/dd');
                var currentTime = new Date().getTime();
                if(notTradeTime != ''){
                    notTradeTime = notTradeTime.split('，');
                    for(var i=0;i<notTradeTime.length;i++){
                        var time = notTradeTime[i].split('-');
                        if(time[0]<time[1]){
                            //开始时间小于结束时间说明开始和结束是同一天
                            if(currentTime>new Date(currentYMD+' '+time[0]).getTime()&&currentTime<new Date(currentYMD+' '+time[1]).getTime()){
                                //不在交易是时间中
                                return false;
                            }else{
                            }
                        }else if(time[0]>time[1]){
                            //说明结束是第二天
                            if(currentTime>new Date(currentYMD+' '+time[0]).getTime()||currentTime<new Date(currentYMD+' '+time[1]).getTime()){
                                //不在交易是时间中
                                return false;
                            }else{
                                
                            }
                        }else{
                            if(currentTime==new Date(currentYMD+' '+time[0]).getTime()){
                                return false;
                            }
                        }
                    }
                }
                if(tradeTime){
                    tradeTime = tradeTime.split('，');
                    for(var i=0;i<tradeTime.length;i++){
                        var time = tradeTime[i].split('-');
                        if(time[0]<time[1]){
                            //开始时间小于结束时间说明开始和结束是同一天
                            if(currentTime>new Date(currentYMD+' '+time[0]).getTime()&&currentTime<new Date(currentYMD+' '+time[1]).getTime()){
                                //在交易是时间中
                                return true;
                            }else{
                            }
                        }else if(time[0]>time[1]){
                            //说明结束是第二天
                            if(currentTime>new Date(currentYMD+' '+time[0]).getTime()||currentTime<new Date(currentYMD+' '+time[1]).getTime()){
                                //在交易是时间中
                                return true;
                            }else{
                                
                            }
                        }else{
                            if(currentTime==new Date(currentYMD+' '+time[0]).getTime()){
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
        }else if(message.method == 'on_rtn_depth'){
            //深度订阅推送行情
            context.state.depthLastData = message.data.slice(0);
        }else if(message.method == 'on_rsp_subscribe'){
            //深度订阅返回
            if(message.error_code == 0&&message.data.fail_list&&message.data.fail_list.length>0){
                var list = context.state.internationalCommodity;
                var domesticList = context.state.domesticCommodity;
                var failList = message.data.fail_list;
                for(var i=0;i<list.length;i++){
                    for(var j=0,len2=failList.length;j<len2;j++){
                        if(failList[j].err_msg != '重复订阅'){
                            if(failList[j].contract_code.split('_')[1]==list[i].commodity_no){
                                list.splice(i,1);
                                i--;
                                break;
                            }
                        }
                    }
                }
                for(var i=0;i<domesticList.length;i++){
                    for(var j=0,len2=failList.length;j<len2;j++){
                        if(failList[j].err_msg != '重复订阅'){
                            if(failList[j].contract_code.split('_')[1]==domesticList[i].commodity_no){
                                domesticList.splice(i,1);
                                i--;
                                break;
                            }
                        }
                    }
                }
                context.state.internationalCommodity = list;
                context.state.domesticCommodity = domesticList;
                context.state.allSubsCommodity = {};
                Object.assign(context.state.allSubsCommodity,list,domesticList);
            }else{
                context.state.allSubsCommodity = {};
                Object.assign(context.state.allSubsCommodity,context.state.internationalCommodity,context.state.domesticCommodity);
            }
            if(message.error_code == 0&&message.data.succ_list&&message.data.succ_list.length>0){
                context.state.isDepth = true;
            }
            setTimeout(()=>{
                context.state.isCanConnectTrade = true;
            },1000)
            context.state.isConnecting = false;
        }else if(message.method == 'on_rsp_unsubscribe'){
            //取消订阅返回
            context.state.isDepth = false;
        }else if(message.method == 'on_rtn_ticker'){
            //订阅逐笔
            context.state.tickerList.unshift(message.data);
            if(context.state.tickerList.length>100){
                context.state.tickerList.splice(context.state.tickerList.length-1,1);
            }
        }else if(message.method == 'on_rsp_heartbeat'){
            context.dispatch('reset');
            setTimeout(()=>{
                context.dispatch('sendHeartBeat');
            },2000);
        }
    },
    //计算持仓浮动盈亏
    positionFloatProfit(context,lastData){
        var store = context.rootState;
        if(lastData[3] == 0){
            return;
        }
        var positionList = store.trade.positionList;
        var totalFloatProfit = 0;
        for(var i in positionList){
            if(lastData[0].split('_')[1] == positionList[i].CommodityNo){
                if(positionList[i].Direction == 0){
                    //买多
                    positionList[i]['floatProfit'] = ((lastData[3]-positionList[i].HoldAvgPrice)*positionList[i].HoldNum*positionList[i].contractNum).toFixed(0);
                }else{
                    //卖空
                    positionList[i]['floatProfit'] = ((positionList[i].HoldAvgPrice-lastData[3])*positionList[i].HoldNum*positionList[i].contractNum).toFixed(0);
                }
                if(positionList[i].HoldAvgPrice==0){
                    positionList[i]['floatProfit'] = 0;
                }
                totalFloatProfit+=parseFloat(positionList[i].floatProfit)*(positionList[i].currencyRate);
                // break;
            }else if((positionList[i].floatProfit||positionList[i].floatProfit==0)&&positionList[i].floatProfit!='获取中...'){
                totalFloatProfit+=parseFloat(positionList[i].floatProfit)*(positionList[i].currencyRate);
                // console.log(positionList[i].currencyRate);
            }
        };
        context.state.totalFloatProfit = totalFloatProfit;
    },
    checkAllContract(context){
        var contractParam={
            method:'req_commodity_list',
            req_id:'',
            data:{
            }
        };
        context.state.marketSocket.send(JSON.stringify(contractParam));
    },    
    searchAllContract(context){
        var state = context.state;
        var contractParam = {
            method:'req_commodity_list',
            req_id:'',
            data:{
            }
        };
        state.marketSocket.send(JSON.stringify(contractParam));
    },
    vPositionFloatProfit(context,lastData){
        var store = context.rootState;
        if(lastData[3] == 0){
            return;
        }
        var positionList = store.vtrade.positionList;
        var totalFloatProfit = 0;
        for(var i in positionList){
            if(lastData[0].split('_')[1] == positionList[i].CommodityNo){
                if(positionList[i].Direction == 0){
                    //买多
                    positionList[i]['floatProfit'] = ((lastData[3]-positionList[i].HoldAvgPrice)*positionList[i].HoldNum*positionList[i].contractNum).toFixed(0);
                }else{
                    //卖空
                    positionList[i]['floatProfit'] = ((positionList[i].HoldAvgPrice-lastData[3])*positionList[i].HoldNum*positionList[i].contractNum).toFixed(0);
                }
                if(positionList[i].HoldAvgPrice==0){
                    positionList[i]['floatProfit'] = 0;
                }
                totalFloatProfit+=parseFloat(positionList[i].floatProfit)*(positionList[i].currencyRate);
                // break;
            }else if((positionList[i].floatProfit||positionList[i].floatProfit==0)&&positionList[i].floatProfit!='获取中...'){
                totalFloatProfit+=parseFloat(positionList[i].floatProfit)*(positionList[i].currencyRate);
                // console.log(positionList[i].currencyRate);
            }
        };
        context.state.vTotalFloatProfit = totalFloatProfit;
    },

    //订阅所有合约
    subscribeAllContract(context){
        var state = context.state;
        var commodityList = state.allCommodity;
        //存入订阅的行情
        state.subsCommodity = commodityList;
        //循环订阅
        var contractList = [];//订阅传的参数
        for(var i in state.subsCommodity){
            var obj = state.subsCommodity[i].security_type + '_' + state.subsCommodity[i].commodity_no;
            contractList.push(obj);
        }
        var subscribeParam={
            method:'req_subscribe',
            req_id:'',
            data:{
                contract_list:contractList,
                mode:'MODE_SNAP'
            }
        };
        state.marketSocket.send(JSON.stringify(subscribeParam));

        for(var i in state.subsCommodity){
            if(state.subsCommodity[i].security_type == 'FO'){
                Vue.set(state.internationalCommodity,state.subsCommodity[i].commodity_no,state.subsCommodity[i]);
            }else if(state.subsCommodity[i].security_type == 'FI'){
                Vue.set(state.domesticCommodity,state.subsCommodity[i].commodity_no,state.subsCommodity[i]);
            }
        }
        // //去重
        // var _internationalList=[];
        // for (var i = 0; i < internationalList.length; i++) {
        //     for (var j = i+1; j < internationalList.length; j++) {
        //         if(internationalList[i].contractCode===internationalList[j].contractCode){
        //             ++i;
        //         }
        //     }
        //     _internationalList.push(internationalList[i]);
        // }
        // //去重
        // var _domesticList=[];
        // for (var i = 0; i < domesticList.length; i++) {
        //     for (var j = i+1; j < domesticList.length; j++) {
        //         if(domesticList[i].contractCode===domesticList[j].contractCode){
        //             ++i;
        //         }
        //     }
        //     _domesticList.push(domesticList[i]);
        // }
    },
    //深度订阅选择的合约
    depthSubscribe(context){
        var store = context.rootState;
        var contractList = [];//订阅传的参数
        var no = store.currentQuota.security_type + '_' + store.currentQuota.commodity_no;
        contractList.push(no);
        var subscribeParam={
            method:'req_subscribe',
            req_id:'',
            data:{
                contract_list:contractList,
                mode:'MODE_DEPTH'
            }
        };
        context.state.marketSocket.send(JSON.stringify(subscribeParam));
    },
    //取消深度订阅
    cancelDepthSubscribe(context){
        if(context.state.isDepth){
            var store = context.rootState;
            var contractList = [];//订阅传的参数
            var no = store.currentQuota.security_type + '_' + store.currentQuota.commodity_no;
            contractList.push(no);
            var subscribeParam={
                method:'req_unsubscribe',
                req_id:'',
                data:{
                    contract_list:contractList,
                    mode:'MODE_DEPTH'
                }
            };
            context.state.marketSocket.send(JSON.stringify(subscribeParam));
        }
    },
    //订阅逐笔
    tickerSubscribe(context){
        var store = context.rootState;
        var contractList = [];//订阅传的参数
        var no = store.currentQuota.security_type + '_' + store.currentQuota.commodity_no;
        contractList.push(no);
        var subscribeParam={
            method:'req_subscribe',
            req_id:'',
            data:{
                contract_list:contractList,
                mode:'MODE_TICKER'
            }
        };
        context.state.marketSocket.send(JSON.stringify(subscribeParam));
    },
    //取消订阅逐笔
    cancelTickerSubscribe(context){
        var store = context.rootState;
        var contractList = [];//订阅传的参数
        var no = store.currentQuota.security_type + '_' + store.currentQuota.commodity_no;
        contractList.push(no);
        var subscribeParam={
            method:'req_unsubscribe',
            req_id:'',
            data:{
                contract_list:contractList,
                mode:'MODE_TICKER'
            }
        };
        context.state.marketSocket.send(JSON.stringify(subscribeParam));
    },
    //发送心跳
    sendHeartBeat(context){
        var heartBeatParam = {
            method:'req_heartbeat',
            req_id:'',
            data:{
                ref:'123'
            }
        };
        if(context.state.isConnectMarket){
            context.state.marketSocket.send(JSON.stringify(heartBeatParam));
        }
    },
    reset:function(context){
        if(context.state.heartCheck.timeoutObj == null){
            return;
        }
        clearTimeout(context.state.heartCheck.timeoutObj);
        context.dispatch('start');
    },
    start:function(context){
        context.state.heartCheck.timeoutObj = setTimeout(function(){
            context.state.isReConnect = true;
            clearTimeout(context.state.heartCheck.timeoutObj);
            // layer.msg('行情断开，正在重连',{
            //     time:2000
            // });
            context.dispatch('connectQuato');
        }.bind(this),context.state.heartCheck.timeout);
    }
}

export default actions;