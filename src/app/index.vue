<template>
    <div id="app">
        <Header></Header>
        <Contain style="height:calc(100% - 50px)">
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
        </Contain>
    </div>
</template>

<script>
import Header from '@/components/header.vue'
import Contain from '@/components/layout/contain.vue'
import {mapState,mapActions} from 'vuex'
export default {
    components:{Header,Contain},
    data(){
        return{
            isLoading:false,
        }
    },
    computed:{
        ...mapState([
            'environment',
            'api',
            'isLoginApp'
        ]),
        ...mapState('market',[
            'isMarketLogin',
            'isCanConnectTrade',
        ]),
        ...mapState('trade',[
            'isTradeLogin',
        ]),
        ...mapState('vtrade',[
            'isVTradeLogin'
        ])
    },
    watch:{
        isMarketLogin:function(n,o){
            if(this.isMarketLogin){
                this.getContractList();
            }
            if(o&&!n&!this.isMarketLogin){
                //行情断开
                this.connectQuato();
            }
        },
        isCanConnectTrade:function(){
            if(this.isCanConnectTrade&&this.isLoginApp&&!this.isTradeLogin){
                this.connectTrade();
            }
            if(this.isCanConnectTrade&&this.isLoginApp&&!this.isVTradeLogin){
                this.vconnectTrade();
            }
        },
        isLoginApp:function(){
            if(this.isLoginApp){
                this.connectQuato();
            }
        },
        isTradeLogin:function(n,o){
            if(o&&!n){
                //实盘交易断开
                if(this.isCanConnectTrade&&this.isLoginApp){
                    this.connectTrade();
                }
            }
        },
        isVTradeLogin:function(n,o){
            if(o&&!n){
                //模拟交易断开
                if(this.isCanConnectTrade&&this.isLoginApp){
                    this.vconnectTrade();
                }
            }
        },
    },
    mounted(){
        //获取接口地址
        this.getHTTP();
        const bh = document.body.clientHeight; //获得屏幕宽度
        document.getElementsByTagName('body')[0].style.zoom = bh / 900;
    },
    methods:{
        ...mapActions('market',[
            'connectQuato',
            'sendHeartBeat',
            'checkAllContract'
        ]),
        ...mapActions('trade',[
            'connectTrade',
        ]),
        ...mapActions('vtrade',[
            'vconnectTrade',
        ]),
        //获取http接口
        getHTTP(){
            var data = require('../assets/api.json');
            data = data.results;
            for(var i=0;i<data.length;i++){
                if(data[i].type == this.environment){
                    switch(data[i].domainType){
                        case 'web':this.$store.state.webApi = data[i].domain;break;
                        case 'pay':this.$store.state.payApi = data[i].domain;break;
                        case 'api':this.$store.state.api = data[i].domain;break;
                    }
                }
            }
            this.getWSApi();
            this.getRate();
            this.getMoneyData();
            // this.$http.get('https://api2.bmob.cn/1/classes/domain',{},{
            //     'X-Bmob-Application-Id':'0cdd6ae842b7ba6a1d01943abafbc4af',
            //     'X-Bmob-REST-API-Key':'8c745e5a4e22b00daa2820ad851a2d80',
            //     'Content-Type':'application/json'
            // },5000)
            // .then((res)=>{
            //     var data = res.results;
            //     for(var i=0;i<data.length;i++){
            //         if(data[i].type == this.environment){
            //             switch(data[i].domainType){
            //                 case 'web':this.$store.state.webApi = data[i].domain;break;
            //                 case 'pay':this.$store.state.payApi = data[i].domain;break;
            //                 case 'api':this.$store.state.api = data[i].domain;break;
            //             }
            //         }
            //     }
            //     this.getWSApi();
            //     this.getRate();
            //     this.getMoneyData();
            // }).catch((err)=>{
            //     this.$http.get('https://t9yxn3sp.api.lncld.net/1.1/classes/domain',{},{
            //         'X-LC-Id':'t9yxn3sPQlDjkjEip2C2njdz-gzGzoHsz',
            //         'X-LC-Key':'fPMiAwI5MiUytaCwcDDlvxE2',
            //     },5000)
            //     .then((res)=>{
            //         var data = res.results;
            //         for(var i=0;i<data.length;i++){
            //             if(data[i].type == this.environment){
            //                 switch(data[i].domainType){
            //                     case 'web':this.$store.state.webApi = data[i].domain;break;
            //                     case 'pay':this.$store.state.payApi = data[i].domain;break;
            //                     case 'api':this.$store.state.api = data[i].domain;break;
            //                 }
            //             }
            //         }
            //         this.getWSApi();
            //         this.getRate();
            //         this.getMoneyData();
            //     }).catch((err)=>{
            //         console.log(err);
            //     })
            // })
        },
        //获取ws接口
        getWSApi(){
            this.$http.post(this.api+'/urlConfig',{'version':'','urlType':''})
            .then((res)=>{
                if(res.success&&res.code == '010'){
					sessionStorage.setItem('address',JSON.stringify(res.data));
					for(var i=0;i<res.data.length;i++){
						if(res.data[i].urlType == '010'){
							this.$store.state.market.addressNotLogin = res.data[i].url;
						}else if(res.data[i].urlType == '020'){
							this.$store.state.market.addressLogin = res.data[i].url;
						}else if(res.data[i].urlType == '030'){
							this.$store.state.market.chartDataHttp = res.data[i].url;
						}else if(res.data[i].urlType == '040'){
							this.$store.state.trade.addressMock = res.data[i].url;
							this.$store.state.vtrade.addressMock = res.data[i].url;
						}else if(res.data[i].urlType == '050'){
							this.$store.state.trade.addressTrue = res.data[i].url;
							this.$store.state.vtrade.addressTrue = res.data[i].url;
						}
					};
                    this.checkLoginStatus();
				}
            }).catch((err)=>{
				console.log(err);
            })
        },
        //获取合约列表
        getContractList(){
            this.$http.post(this.api+'/contractList',{typeCode:'1,2'},5000)
            .then((acct)=>{
                if(acct.success&&acct.data.length>0){
                    //处理合约数据
                    var ContractList = {};
                    for(var z=0;z<acct.data.length;z++){
                        var contractList = acct.data[z].contractList;
                        for(var i=0;i<contractList.length;i++){
                            var obj = {};
                            contractList[i].commodity_no = contractList[i].contractCode;
                            contractList[i].commodity_name = contractList[i].contractName;
                            contractList[i].contract_size = contractList[i].contractSize;
                            contractList[i].currency_no = contractList[i].currencyNo;
                            contractList[i].dot_size = contractList[i].dotSize;
                            contractList[i].exchange_no = contractList[i].exchangeCode;
                            contractList[i].main_contract_no = contractList[i].mainContract;
                            contractList[i].mini_ticker_size = contractList[i].miniTikeSize;
                            contractList[i].security_type = contractList[i].typeCode=='1'?'FO':contractList[i].typeCode=='2'?'FI':contractList[i].typeCode=='3'?'C':'FO';
                            contractList[i].quatoData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
                            contractList[i].isOnTrade = true;
                            contractList[i].isShowBg = false;
                            contractList[i].color = '';
                            obj[contractList[i].commodity_no] = contractList[i];
                            this.$store.state.market.depositList[contractList[i].contractCode] = contractList[i].deposit;
                            this.$store.state.market.feeList[contractList[i].contractCode] = contractList[i].fee;
                            Object.assign(ContractList,obj);
                        }
                        // ContractList = ContractList.concat(contractList);
                    }
                    this.$store.state.market.allCommodity = ContractList;
                    this.sendHeartBeat();
                    this.checkAllContract();
                }
            }).catch((err)=>{
				console.log(err);
            })
        },
        //获取汇率
        getRate(){
            this.$http.post(this.api+'/qryRates')
            .then((perms)=>{
                if(perms.success&&perms.code=='010'){
                    //成功获取汇率
                    var newRate = {};
                    for(var i=0;i<perms.data.length;i++){
                        newRate[perms.data[i].currencyNo] = perms.data[i];
                    }
                    this.$store.state.rateList = newRate;
                }else{
                    //获取失败
                }
            }).catch((err)=>{
				console.log(err);
            })
        },
        //查看是否登录
        checkLoginStatus(){
            if(localStorage.getItem('userInfo')){
                this.$store.state.userInfo = JSON.parse(localStorage.getItem('userInfo'));
                this.$store.state.isLoginApp = true;
            }else{
                this.connectQuato();
            }
        },
        //获取模拟金金额
        getMoneyData(){
            this.$http.post(this.api+'/qryParameters',{
            paramStr:'vs.sim.amount'
            }).then((res)=>{
            if(res.success&&res.code == '010'){
                this.$store.state.simPrice = res.data['vs.sim.amount'];
            }else{
                this.$toast({
                    content:res.message
                })
            }
            }).catch((err)=>{

            })
        },
    }
}
</script>

<style lang="scss" scoped>
    #app{
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
