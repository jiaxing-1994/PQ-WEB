import Vue from 'vue'
const actions = {
    connectTrade(context){
        var store = context.rootState;
        var state = context.state;
        if(state.heartCheck.timeoutObj!=null){
            clearTimeout(state.heartCheck.timeoutObj);
        }
        if(store.isLoginApp){
            context.commit('initData');
            //判断连接交易地址
            state.tradeConfig.ClientNo = store.userInfo.mobile;
            state.tradeConfig.PassWord = store.userInfo.password;
            //登录
            // if(state.tradeType==0){
            //     //模拟
            //     state.tradeConfig.url_address = state.addressMock[0];
            // }else if(state.tradeType==1){
                //实盘
                state.tradeConfig.url_address = state.addressTrue[0];
            // }
            if(state.tradeSocket){
                state.tradeSocket.close();
                state.tradeSocket = null;
            }
            state.tradeSocket = new WebSocket(state.tradeConfig.url_address);
            state.tradeSocket.onopen = function(){
                context.dispatch('start');
                state.isConnectTrade = true;
                state.tradeLoginStatus = 1;
                if(state.isReConnect){
                    // layer.msg('交易重连成功',{
                    //     time:1000
                    // })
                    state.isReConnect = false;
                }
                var loginParam = {
                    Method:'Login',
                    req_id:'',
                    Parameters:{
                        ClientNo:state.tradeConfig.ClientNo,
                        PassWord:Base64.encode(state.tradeConfig.PassWord),
                        IsMock:state.tradeConfig.IsMock,
                        Version:state.tradeConfig.Version,
                        Source:state.tradeConfig.Source
                    }
                }
                state.tradeSocket.send(JSON.stringify(loginParam));
            };
            state.tradeSocket.onclose = function(){
                state.isConnectTrade = false;
                state.isTradeLogin = false;
                state.tradeLoginStatus = 3;
                context.state.isLoadPosition = false;
            }
            state.tradeSocket.onmessage = function(message){
                context.dispatch('WSmessage',message.data)
            };
            state.tradeSocket.onerror = function(){
// 					layer.msg('交易连接失败',{
// 						time:2000
// 					});
            }
        }
    },
    WSmessage(context,message){
        var store = context.rootState;
        message = JSON.parse(message);
        if(message.Method == 'OnRspLogin'){
            if(message.Parameters.Code == 0){
                context.state.tradeLoginStatus = 2;
                context.state.isTradeLogin = true;
                context.state.tradeBascData = message.Parameters;
                context.dispatch('checkOrder');// 查询所有订单 计算挂单 委托单 成交单
                context.state.isLoadPosition = true;
                context.dispatch('checkPosition');// 查询持仓 
                context.dispatch('checkAccount');// 查询账户信息 计算资金 总资产，今可用，保证金等
                context.dispatch('checkStopLoss');// 查询止损止盈单
                context.dispatch('checkCondition');// 查询条件单
            }else{
                //交易登录失败(交易平台账号注册失败，提示联系客服)
                context.state.tradeLoginStatus = 3;
                context.state.isLoadPosition = false;
            }
        }else if(message.Method == 'OnRspQryHoldTotal'){
            //查询持仓合计返回
            if(message.Parameters){
                var allCommodity = store.market.allSubsCommodity;
                message.Parameters.contractNum = allCommodity[message.Parameters.CommodityNo].contract_size/allCommodity[message.Parameters.CommodityNo].mini_ticker_size;
                message.Parameters.mini_ticker_size = allCommodity[message.Parameters.CommodityNo].mini_ticker_size; //0.000004  
                message.Parameters.CommodityName = allCommodity[message.Parameters.CommodityNo].commodity_name;
                message.Parameters.CurrencyNo = allCommodity[message.Parameters.CommodityNo].currency_no;
                if(allCommodity[message.Parameters.CommodityNo].quatoData){
                    if(message.Parameters.Direction == 0){
                        //买多
                        message.Parameters['floatProfit'] = ((allCommodity[message.Parameters.CommodityNo].quatoData[3]-message.Parameters.HoldAvgPrice)*message.Parameters.HoldNum*message.Parameters.contractNum).toFixed(0);
                    }else{
                        //卖空
                        message.Parameters['floatProfit'] = ((message.Parameters.HoldAvgPrice-allCommodity[message.Parameters.CommodityNo].quatoData[3])*message.Parameters.HoldNum*message.Parameters.contractNum).toFixed(0);
                    }
                }else{
                    message.Parameters.floatProfit = 0;
                }
                message.Parameters.currencyRate = store.rateList[message.Parameters.CurrencyNo].exchangeRate;

                store.market.totalFloatProfit = store.market.totalFloatProfit+message.Parameters.floatProfit*message.Parameters.currencyRate;
                context.state.totalPositionNum += message.Parameters.HoldNum;
                Vue.set(context.state.positionList,message.Parameters.CommodityNo,message.Parameters);
                // if(store.market.subscribeContract.length>0&&store.market.subscribeContract.indexOf(message.Parameters.CommodityNo) == -1){
                //     //订阅没有订阅的持仓合约
                //     store.market.subscribeContract.push(message.Parameters.CommodityNo);
                //     store.market.dispatch('subscribeOneContract');
                // }
            }else{
                context.state.isLoadPosition = false;
            }
        }else if(message.Method == 'OnRspQryAccount'){
            //查询资金账户回复
            if(message.Parameters){
                message.Parameters.floatProfit = 0;
                if(message.Parameters.CurrencyNo == 'USD'){
                    context.state.capitalList.unshift(message.Parameters);
                }else{
                    context.state.capitalList.push(message.Parameters);
                }
                context.state.totalBalance+=message.Parameters.TodayAmount*message.Parameters.CurrencyRate;
                context.state.todayCanUseBalance+=(message.Parameters.TodayAmount-message.Parameters.FrozenMoney-message.Parameters.Deposit)*message.Parameters.CurrencyRate;
                context.state.deposit+=message.Parameters.Deposit*message.Parameters.CurrencyRate;
            }
        }else if(message.Method == 'OnRtnHoldTotal'){
            //持仓变化推送
            //处理暂存列表
            var orderInsertList = context.state.orderInsertList;
            for(var i=0,length=orderInsertList.length;i<length;i++){
                if(orderInsertList[i].OrderID == message.Parameters.OrderID){
                    context.state.orderInsertList.splice(i,1);
                    break;
                }
            }
            var allCommodity = store.market.allSubsCommodity;
            var positionList = context.state.positionList;
            var index = 0;
            for(var i in positionList){
                if(i == message.Parameters.CommodityNo){
                    if(message.Parameters.HoldNum>0){
                        positionList[i].Direction = message.Parameters.Direction;
                        positionList[i].HoldNum = message.Parameters.HoldNum;
                        positionList[i].HoldAvgPrice = message.Parameters.HoldAvgPrice;
                        positionList[i].OpenAvgPrice = message.Parameters.OpenAvgPrice;
                        positionList[i].TodayHoldNum = message.Parameters.TodayHoldNum;
                        positionList[i].YesterdayHoldNum = message.Parameters.YesterdayHoldNum;
                    }else{
                        Vue.delete(context.state.positionList,i);
                        index--;
                    }
                    break;
                }
                index++;
            }
            if(index == Object.keys(positionList).length){
                message.Parameters.contractNum = allCommodity[message.Parameters.CommodityNo].contract_size/allCommodity[message.Parameters.CommodityNo].mini_ticker_size;
                message.Parameters.mini_ticker_size = allCommodity[message.Parameters.CommodityNo].mini_ticker_size; //0.000004  
                message.Parameters.CommodityName = allCommodity[message.Parameters.CommodityNo].commodity_name;
                message.Parameters.CurrencyNo = allCommodity[message.Parameters.CommodityNo].currency_no;
                if(allCommodity[message.Parameters.CommodityNo].quatoData){
                    if(message.Parameters.Direction == 0){
                        //买多
                        message.Parameters['floatProfit'] = ((allCommodity[message.Parameters.CommodityNo].quatoData[3]-message.Parameters.HoldAvgPrice)*message.Parameters.HoldNum*message.Parameters.contractNum).toFixed(0);
                    }else{
                        //卖空
                        message.Parameters['floatProfit'] = ((message.Parameters.HoldAvgPrice-allCommodity[message.Parameters.CommodityNo].quatoData[3])*message.Parameters.HoldNum*message.Parameters.contractNum).toFixed(0);
                    }
                }else{
                    message.Parameters.floatProfit = 0;
                }
                message.Parameters.currencyRate = store.rateList[message.Parameters.CurrencyNo].exchangeRate;
                Vue.set(context.state.positionList,message.Parameters.CommodityNo,message.Parameters);
            }
            var totalPositionNum = 0;
            for(var i in positionList){
                totalPositionNum+=positionList[i].HoldNum;
            }
            context.state.totalPositionNum = totalPositionNum;

        }else if(message.Method == 'OnRspQryOrder'){
            //查询所有订单
            if(!message.Parameters){
                return;
            }
            var allCommodity = store.market.allSubsCommodity;
            message.Parameters.contractNum = allCommodity[message.Parameters.CommodityNo].contract_size/allCommodity[message.Parameters.CommodityNo].mini_ticker_size;
            message.Parameters.mini_ticker_size = allCommodity[message.Parameters.CommodityNo].mini_ticker_size;
            message.Parameters.CommodityName = allCommodity[message.Parameters.CommodityNo].commodity_name;
            message.Parameters.CurrencyNo = allCommodity[message.Parameters.CommodityNo].currency_no;

            context.state.allOrderList.push(message.Parameters);
            if(message.Parameters&&message.Parameters.OrderStatus == 1&&message.Parameters.OrderPriceType == 0){
                context.state.templateList.push(message.Parameters);
            }

        }else if(message.Method == 'OnRspOrderInsert'){
            store.isSendData = false;
            //报单录入请求回复
            var allCommodity = store.market.allSubsCommodity;
            message.Parameters.contractNum = allCommodity[message.Parameters.CommodityNo].contract_size/allCommodity[message.Parameters.CommodityNo].mini_ticker_size;
            message.Parameters.mini_ticker_size = allCommodity[message.Parameters.CommodityNo].mini_ticker_size;
            message.Parameters.CommodityName = allCommodity[message.Parameters.CommodityNo].commodity_name;
            message.Parameters.CurrencyNo = allCommodity[message.Parameters.CommodityNo].currency_no;

            if(message.Parameters.OrderStatus ==0||message.Parameters.OrderStatus ==1){
                //已提交 排队中
                context.state.orderInsertList.push(message.Parameters);
                context.state.templateList.unshift(message.Parameters);
            }else if(message.Parameters.OrderStatus ==2){
                //部分成交
            }else if(message.Parameters.OrderStatus ==3){
                //完成成交
            }else if(message.Parameters.OrderStatus ==4){
                //已撤单
            }else if(message.Parameters.OrderStatus ==5||message.Parameters.OrderStatus ==6){
                //下单失败 未知
            }
            context.state.allOrderList.unshift(message.Parameters);
            if(message.Parameters.OpenCloseType == 2){
                //平仓并且没有完成活动则去查询活动
                if(context.state.activityStatus=='010'){
                    setTimeout(function(){
                        context.dispatch('checkActivity');
                    },1000)
                }
            }
            context.dispatch('showMessageTip',message.Parameters);
        }else if(message.Method == 'OnRtnOrderTraded'){
            //订单成交通知
            //处理挂单
            var templateList = context.state.templateList;
            for(var i=0;i<templateList.length;i++){
                if(templateList[i].OrderID == message.Parameters.OrderID){
                    context.state.templateList.splice(i,1);
                    break;
                }
            }
            //处理暂存列表
            var orderInsertList = context.state.orderInsertList;
            for(var i=0,length=orderInsertList.length;i<length;i++){
                if(orderInsertList[i].OrderID == message.Parameters.OrderID){
                    context.state.orderInsertList.splice(i,1);
                    break;
                }
            }
        }else if(message.Method == 'OnRtnOrderState'){
            //委托状态变化通知
            var allCommodity = store.market.allSubsCommodity;
            message.Parameters.contractNum = allCommodity[message.Parameters.CommodityNo].contract_size/allCommodity[message.Parameters.CommodityNo].mini_ticker_size;
            message.Parameters.mini_ticker_size = allCommodity[message.Parameters.CommodityNo].mini_ticker_size;
            message.Parameters.CommodityName = allCommodity[message.Parameters.CommodityNo].commodity_name;
            message.Parameters.CurrencyNo = allCommodity[message.Parameters.CommodityNo].currency_no;
            if(message.Parameters.OrderStatus ==0||message.Parameters.OrderStatus ==1){
                //已提交 排队中
                var templateList = context.state.templateList;
                for(var i=0,length=templateList.length;i<length;i++){
                    if(message.Parameters.OrderID == templateList[i].OrderID){
                        templateList.splice(i,1,message.Parameters);
                        context.state.templateList = templateList.slice(0);
                        store.isSendData = false;
                        break;
                    }
                }
            }else if(message.Parameters.OrderStatus ==2){
                //部分成交
                store.isSendData = false;
            }else if(message.Parameters.OrderStatus ==3){
                //完成成交
                store.isSendData = false;
            }else if(message.Parameters.OrderStatus ==4){
                //已撤单
                store.isSendData = false;
                var templateList = context.state.templateList;
                for(var i=0,length=templateList.length;i<length;i++){
                    if(message.Parameters.OrderID == templateList[i].OrderID){
                        context.state.templateList.splice(i,1);
                        break;
                    }
                }
            }else if(message.Parameters.OrderStatus ==5||message.Parameters.OrderStatus ==6){
                //下单失败 未知
            }
            //更新全部订单
            var allOrderList = context.state.allOrderList;
            for(var i=0,length=allOrderList.length;i<length;i++){
                if(allOrderList[i].OrderID == message.Parameters.OrderID){
                    allOrderList[i].contractNum = message.Parameters.contractNum;
                    allOrderList[i].CommodityName = message.Parameters.CommodityName;
                    allOrderList[i].CurrencyNo = message.Parameters.CurrencyNo;
                    allOrderList[i].TradeNum = message.Parameters.TradeNum;
                    allOrderList[i].TradePrice = message.Parameters.TradePrice;
                    allOrderList[i].TradeFee = message.Parameters.TradeFee;
                    allOrderList[i].OrderStatus = message.Parameters.OrderStatus;
                    allOrderList[i].StatusMsg = message.Parameters.StatusMsg;
                    allOrderList[i].Drection = message.Parameters.Drection
                    break;
                }
            }
            context.state.allOrderList = allOrderList.slice(0);
            context.dispatch('showMessageTip',message.Parameters);
        }else if(message.Method == 'OnRtnMoney'){
            //资金变化通知
            if(message.Parameters){
                var capitalList = context.state.capitalList.slice(0);
                for(var i=0,length=capitalList.length;i<length;i++){
                    if(capitalList[i].CurrencyNo == message.Parameters.CurrencyNo){
                        message.Parameters.CurrencyRate = capitalList[i].CurrencyRate;
                        capitalList.splice(i,1,message.Parameters);
                        break;
                    }
                }
                var totalBalance = 0;
                var todayCanUseBalance = 0;
                var deposit = 0;
                for(var i=0,length=capitalList.length;i<length;i++){
                    totalBalance+=capitalList[i].TodayAmount*capitalList[i].CurrencyRate;
                    todayCanUseBalance+=(capitalList[i].TodayAmount-capitalList[i].FrozenMoney-capitalList[i].Deposit)*capitalList[i].CurrencyRate;
                    deposit+=capitalList[i].Deposit*capitalList[i].CurrencyRate;
                }
                context.state.totalBalance = totalBalance;
                context.state.todayCanUseBalance = todayCanUseBalance;
                context.state.deposit = deposit;
                context.state.capitalList = capitalList.slice(0);
            }
        }else if(message.Method == 'OnRspInsertStopLoss'){
            store.isSendData = false;
            //插入止损单返回
            context.dispatch('showMessageTip',message.Parameters);
        }else if(message.Method == 'OnRspQryStopLoss'){
            //查询止损单返回
            if(message.Parameters){
                switch(message.Parameters.StopLossType){
                    case 0:message.Parameters.StopLossTypeName='止损';break;
                    case 1:message.Parameters.StopLossTypeName='止盈';break;
                    case 2:message.Parameters.StopLossTypeName='止损+止盈';break;
                    case 3:message.Parameters.StopLossTypeName='浮动止损';break;
                    case 4:message.Parameters.StopLossTypeName='不设置止损';break;
                }
                var allCommodity = store.market.allSubsCommodity;
                message.Parameters.CommodityName = allCommodity[message.Parameters.CommodityNo].commodity_name;
                context.state.stopLossList.unshift(message.Parameters);
                // if(store.market.subscribeContract.indexOf(message.Parameters.CommodityNo) == -1){
                //     //订阅没有订阅的止损单合约
                //     store.market.subscribeContract.push(message.Parameters.CommodityNo);
                //     store.market.dispatch('subscribeOneContract');
                // }
            }
        }else if(message.Method == 'OnRtnStopLossState'){
            store.isSendData = false;
            //止损单状态改变通知
            if(message.Parameters.Status == 0){
                //运行中
            }else if(message.Parameters.Status == 1){
                //暂停
            }else if(message.Parameters.Status == 2){
                //已触发
            }else if(message.Parameters.Status == 3){
                //已取消
            }else if(message.Parameters.Status == 4){
                //插入失败
            }else if(message.Parameters.Status == 5){
                //触发失败
            }
            var allCommodity = store.market.allSubsCommodity;
            switch(message.Parameters.StopLossType){
                case 0:message.Parameters.StopLossTypeName='止损';break;
                case 1:message.Parameters.StopLossTypeName='止盈';break;
                case 2:message.Parameters.StopLossTypeName='止损+止盈';break;
                case 3:message.Parameters.StopLossTypeName='浮动止损';break;
                case 4:message.Parameters.StopLossTypeName='不设置止损';break;
            }
            var stopLossList = context.state.stopLossList;
            message.Parameters.CommodityName = allCommodity[message.Parameters.CommodityNo].commodity_name;
            if(stopLossList.length==0){
                context.state.stopLossList.unshift(message.Parameters);
            }else{
                for(var i=0,length=stopLossList.length;i<length;i++){
                    if(stopLossList[i].StopLossNo == message.Parameters.StopLossNo){
                        context.state.stopLossList.splice(i,1,message.Parameters);
                        if(message.Parameters.Status!=3&&message.Parameters.Status!=2){
                            store.canCloseLayer = true;
                            vue.$toast({
                                content:'修改成功',
                            })
                        }
                        break;
                    }
                    if(i==length-1){
                        context.state.stopLossList.unshift(message.Parameters);
                    }
                }
            }
            if(message.Parameters.Status == 3){
                if(message.Parameters.StatusMsg=='无对应持仓, 失效删除'){
                    store.canCloseLayer = true;
                    return;
                }
                var message='已取消';
                store.canCloseLayer = true;
                vue.$toast({
                    content:message,
                })
            }
            // context.dispatch('showMessageTip',message.Parameters);
        }else if(message.Method == 'OnRspQryCondition'){
            //查询条件单返回
            if(message.Parameters){
                var allCommodity = store.market.allSubsCommodity;
                message.Parameters.CommodityName = allCommodity[message.Parameters.CommodityNo].commodity_name;
                context.state.conditionList.unshift(message.Parameters);
            }
        }else if(message.Method == 'OnRspInsertCondition'){
            store.isSendData = false;
            //插入条件单返回
            if(message.Parameters.Status == 0){
                //运行中
                // context.state.conditionList.unshift(message.Parameters);
            }else if(message.Parameters.Status == 1){
                //暂停
            }else if(message.Parameters.Status == 2){
                //已触发
            }else if(message.Parameters.Status == 3){
                //已取消
            }else if(message.Parameters.Status == 4){
                //插入失败
            }else if(message.Parameters.Status == 5){
                //触发失败
            }
            context.dispatch('showMessageTip',message.Parameters);
        }else if(message.Method == 'OnRtnConditionState'){
            store.isSendData = false;
            //条件单状态变化推送
            var allCommodity = store.market.allSubsCommodity;
            message.Parameters.CommodityName = allCommodity[message.Parameters.CommodityNo].commodity_name; 
            var conditionList = context.state.conditionList;
            if(conditionList.length==0){
                context.state.conditionList.unshift(message.Parameters);
            }else{
                for(var i=0,length=conditionList.length;i<length;i++){
                    if(conditionList[i].ConditionNo == message.Parameters.ConditionNo){
                        context.state.conditionList.splice(i,1,message.Parameters);
                        if(message.Parameters.Status!=3&&message.Parameters.Status!=2){
                            store.canCloseLayer = true;
                            vue.$toast({
                                content:'修改成功',
                            })
                        }
                        break;
                    }
                    if(i==length-1){
                        context.state.conditionList.unshift(message.Parameters);
                    }
                }
            }
            if(message.Parameters.Status == 3){
                var message='已取消';
                store.canCloseLayer = true;
                vue.$toast({
                    content:message,
                })
            }
            // context.dispatch('showMessageTip',message.Parameters);
        }else if(message.Method == 'OnError'){
            store.isSendData = false;
            vue.$toast({
                content:message.Parameters.Message
            })
        }else if(message.Method == 'OnRtnHeartBeat'){
            if(context.state.tradeLoginStatus!=3){
                context.dispatch('reset');
            }
        }
    },
    //查询订单
    checkOrder(context){
        var method = 'QryOrder';
        var params = {
            ClientNo:context.state.tradeConfig.ClientNo
        }
        context.dispatch('sendWS',{method,params});
    },
    //查询持仓
    checkPosition(context){
        var method = 'QryHoldTotal';
        var params = {
            ClientNo:context.state.tradeConfig.ClientNo
        }
        context.dispatch('sendWS',{method,params});
    },
    //查询账户资金
    checkAccount(context){
        var method = 'QryAccount';
        var params = {
            ClientNo:context.state.tradeConfig.ClientNo
        }
        context.dispatch('sendWS',{method,params});
    },
    //查询止损单
    checkStopLoss(context){
        var method = 'QryStopLoss';
        var params = {
            ClientNo:context.state.tradeConfig.ClientNo
        }
        context.dispatch('sendWS',{method,params});
    },
    //查询条件单
    checkCondition(context){
        var method = 'QryCondition';
        var params = {
            ClientNo:context.state.tradeConfig.ClientNo
        }
        context.dispatch('sendWS',{method,params});
    },
    //发送WS
    sendWS(context,{method,params,req_id}){
        var Param = {
            Method:method,
            req_id:req_id,
            Parameters:params
        }
        if(context.state.isTradeLogin){
            context.state.tradeSocket.send(JSON.stringify(Param));
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
            clearTimeout(context.state.heartCheck.timeoutObj);
            context.state.isReConnect = true;
            // layer.msg('交易断开，正在重连',{
            //     time:2000
            // });
            context.dispatch('connectTrade');
        },context.state.heartCheck.timeout);
    },

    //显示提示
    showMessageTip(context,parameter){
        var message = '';
        var store = context.rootState;
        if(parameter.StopLossPrice||parameter.StopLossPrice==0){
            //止损止盈
            if(parameter.Status == 0&&parameter.StopLossType == 0&&arguments[2]!='OnRtnStopLossState'){
                message = '设置限价止损成功';
                store.canCloseLayer = true;
            }else if(parameter.Status == 0&&parameter.StopLossType == 1){
                message = '设置限价止盈成功';
                store.canCloseLayer = true;
            }else if(parameter.Status == 0&&parameter.StopLossType == 2){
                message = '设置浮动止损成功';
                store.canCloseLayer = true;
            }else{
                if(parameter.Status == 0){
                    message='已开启';
                }else if(parameter.Status == 1){
                    message='已暂停';
                }else if(parameter.Status == 2){
                    message='已触发';
                }else if(parameter.Status == 3){
                    if(parameter.StatusMsg=='无对应持仓, 失效删除'){
                        store.canCloseLayer = true;
                        return;
                    }
                    message=(parameter.StopLossType==0||parameter.StopLossType==2?'止损单':'止盈单')+'已取消';
                    store.canCloseLayer = true;
                }else{
                    message = parameter.StatusMsg;
                }
            }
        }else if(parameter.ConditionType||parameter.ConditionType==0){
            //条件单
            if(parameter.Status == 0&&parameter.ConditionType == 0){
                message = '设置价格条件单成功';
                store.canCloseLayer = true;
            }else if(parameter.Status == 0&&parameter.ConditionType == 1){
                message = '设置时间条件单成功';
                store.canCloseLayer = true;
            }else{
                if(parameter.Status == 0){
                    message='已开启';
                }else if(parameter.Status == 1){
                    message='已暂停';
                }else if(parameter.Status == 2){
                    message='已触发';
                }else if(parameter.Status == 3){
                    message='已取消';
                    store.canCloseLayer = true;
                }else if(parameter.Status == 4){
                    message = parameter.StatusMsg;
                }else{
                    message = parameter.StatusMsg;
                }
            }
        }else{
            //仓位
            if(parameter.OrderStatus == 1){
                message = `[${parameter.CommodityName}${parameter.ContractNo}],价格[${parameter.OrderPrice}],手数[${parameter.OrderNum}],方向[${parameter.Drection==0?'买':'卖'}]</br>挂单成功`;;
                store.canCloseLayer = true;
            }else if(parameter.OrderStatus == 2||parameter.OrderStatus == 3){
                message = `[${parameter.CommodityName}${parameter.ContractNo}],价格[${parameter.TradePrice}],手数[${parameter.OrderNum}],方向[${parameter.Drection==0?'买':'卖'}]</br>提交订单成功`;
                store.canCloseLayer = true;
            }else if(parameter.OrderStatus == 4){
                message = '撤单成功';
                store.canCloseLayer = true;
            }else if(parameter.StatusMsg == '余额不足'){
                if(context.rootState.tradeType == 0){
                    store.canCloseLayer = true;
                    // layer.msg('余额不足，请领取模拟金',{
                    //     time:1500
                    // });
                    vue.$toast({
                        content:'余额不足，请领取模拟金'
                    })
                }else{
                    store.canCloseLayer = true;
                    vue.$toast({
                        content:parameter.StatusMsg
                    })
                    vue.$layer({
                        headerText:'余额不足',
                        isShowBg:true,
                        // contentText:'#no-enough-money-layer',
                        contentText:`
                        <div>
                        <div style="color:#666">
                            您的资金不足,是否去充值入金?
                        </div>
                        <div style="color:#999">
                            Tips:${store.currentQuota.commodity_name}需要${store.needMoney.toFixed(2)}元
                        </div>
                        <div>`,
                        isShowCloseBtn:true,
                        btn:[{
                            text:'充值入金',
                            method:()=>{
                                vue.$router.push({
                                    path:'/my/recharge',
                                    query:{
                                        money:store.needMoney
                                    }
                                })
                            },
                            isClose:true,
                            active:true,
                        }]
                    })
                    // if(document.getElementById('balanceInfoLayer')){
                        // layer.open({
                        //     type:1,
                        //     content:$('#balanceInfoLayer'),
                        //     area:['7.3rem','6rem'],
                        //     shadeClose:true,
                        //     title:null,
                        //     closeBtn:0,
                        // })
                    // }
                }
                return;
            }else if(parameter.OrderStatus == 0){
                store.canCloseLayer = true;
                return;
                // message = parameter.StatusMsg;
            }
            else{
                message = parameter.StatusMsg;
            }
        }
        vue.$toast({
            content:message
        })
    },
    //查询活动
    checkActivity(context){
        var state = context.state;
        var store = context.rootState;
        var activityType = '020';
        //实盘
        activityType = '022,023';
        vue.$http.post(store.api+'/qryActivites',{
            activityType:activityType
        },{
            token:store.userInfo.token,
            secret:store.userInfo.secret
        }).then(function(res){
            if(res.success&&res.code == '010'){
                for(var i=0;i<res.data.length;i++){
                    state.activityStatus = res.data[i].complatedStatus;
                    state.received = res.data[i].received;
                    state.activityId = res.data[i].id;
                    state.activitiesName = res.data[i].activityName;
                    if(res.data[i].complatedStatus=='020'){
                        if(state.received == '010'){
                            var a = res.data[i].id;
                            vue.$http.post(store.api+'/activitiesCoupon',{
                                activityId: a,
                            },{
                                token:store.userInfo.token,
                                secret:store.userInfo.secret
                            }).then((res2)=>{
                                if(res2.success&&res2.code=='010'){
                                    state.couponId = res2.data.couponId;
                                    state.faceValue = res2.data.amount;
                                    state.couponName = res2.data.typeName;
                                    state.activitiesName = res2.data.activitiesName;
                                }else{
                                    vue.$toast({
                                        content:res2.message
                                    })
                                }
                            }).catch((err)=>{
                                
                            })
                            break;
                        }
                    }
                }
            }else{
                vue.$toast({
                    content:res.message
                })
            }
        }).catch(function(err){
            
        })
    },
}

export default actions;