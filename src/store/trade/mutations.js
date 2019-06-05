import Vue from 'vue'
const mutations = {
    //初始化数据
    initData(state){
        state.orderInsertList = [];
        state.allOrderList = [];
        state.positionList = {};
        state.templeList = [];
        state.stopLossList = [];
        state.conditionList = [];//条件单列表
        state.tradeBascData = 0;//风险度数据
        state.deposit = 0;//保证金
        state.totalBalance = 0;//总资产
        state.todayCanUseBalance = 0;//今可用
        state.Balance = 0;//余额
        state.totalPositionNum = 0;
        this.state.market.totalFloatProfit = 0;
    },
}

export default mutations;