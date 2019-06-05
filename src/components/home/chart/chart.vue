<template>
    <div class="chart">
        <div :class="['quota-info',isHideCard?'quota-info-hide':'']">
            <div class="quota-info-item quota-name-item left-justifying">
                <span>{{currentQuota.commodity_name}}</span>
                <span class="low-color">{{currentQuota.commodity_no}}{{currentQuota.main_contract_no}}</span>
            </div>
            <div class="quota-info-item quota-rate-item right-justifying" style="margin-right:20px">
                <span :class="LastData[3]>LastData[10]?LastData[3]==LastData[10]?'':'colorUp':'colorDown'">{{LastData[3].toFixed(currentQuota.dotSize)}}</span>
                <span :class="LastData[3]>LastData[10]?LastData[3]==LastData[10]?'':'colorUp':'colorDown'">{{LastData[3]==0?'-':(LastData[3]-LastData[10]).toFixed(currentQuota.dotSize)}}/
                    <span>{{LastData[3]==0?'':LastData[3]>LastData[10]?'+':''}}</span>{{LastData[3]==0?'-':((LastData[3]-LastData[10])/LastData[10]*100).toFixed(2)}}%</span>
            </div>
            <div class="quota-info-item left-justifying quota-price-item">
                <span class="low-color">最高价</span>
                <span :class="LastData[4]>LastData[10]?LastData[4]==LastData[10]?'':'colorUp':'colorDown'">{{LastData[4].toFixed(currentQuota.dotSize)}}</span>
            </div>
            <div class="quota-info-item left-justifying quota-price-item">
                <span class="low-color">最低价</span>
                <span :class="LastData[5]>LastData[10]?LastData[5]==LastData[10]?'':'colorUp':'colorDown'">{{LastData[5].toFixed(currentQuota.dotSize)}}</span>
            </div>
            <div class="quota-info-item left-justifying quota-price-item">
                <span class="low-color">开盘价</span>
                <span :class="LastData[2]>LastData[10]?LastData[2]==LastData[10]?'':'colorUp':'colorDown'">{{LastData[2].toFixed(currentQuota.dotSize)}}</span>
            </div>
            <div class="quota-info-item left-justifying quota-price-item">
                <span class="low-color">昨结价</span>
                <span>{{LastData[10].toFixed(currentQuota.dotSize)}}</span>
            </div>
            <div class="quota-info-item left-justifying quota-price-item">
                <span class="low-color">成交量</span>
                <span>{{LastData[6]}}</span>
            </div>
            <div class="quota-info-item left-justifying quota-price-item">
                <span class="low-color">持仓量</span>
                <span>{{LastData[7]}}</span>
            </div>
        </div>
        <div class="type-bar">
            <span 
                :class="[
                    'type-item',
                    typeIndex==index?'type-item-active':'',
                    item.name=='K线'||item.name=='闪电'?'type-item-a':'',
                ]"
                v-for="(item,index) in typeBarList" 
                :key="index"
                @click="switchType(index,item)"
            >
                {{item.name}}
            </span>
            <span 
                :class="['type-item-b',otherIndex==1?'type-item-b-active':'',]"
                @click="otherLayer(1)"
            >
                <span>细则</span>
            </span>
            <span 
                :class="['type-item-b',otherIndex==2?'type-item-b-active':'',]"
                @click="otherLayer(2)"
            >
                <span>汇率</span>
            </span>
        </div>
        <div class="chart-warp">
            <!-- <div v-loading="isLoadIframe" class="load-iframe"></div> -->
            <iframe id="chart-ifram" :src="chartUrl"></iframe>
            <div class="rule-rate" v-show="isShowRuleOrRate">
                <trade-rule v-show="otherIndex==1"></trade-rule>
                <rate v-show="otherIndex==2"></rate>
            </div>
        </div>
        <!-- <component :is="tradeType==0?'VCaptialBar':'CaptialBar'"></component> -->
    </div>
</template>

<script>
import CaptialBar from './components/captialBar.vue'
import VCaptialBar from './components/vCaptialBar.vue'
import TradeRule from './components/tradeRule.vue'
import Rate from './components/rate.vue'
import {mapState} from 'vuex'
export default {
    components:{
        CaptialBar,
        VCaptialBar,
        TradeRule,
        Rate
    },
    props:{
        isHideCard:{
            tyep:Boolean
        }
    },
    data(){
        return{
            volume:0,//成交量,
            typeBarList:[{
                name:'1min',
                type:'KLINE_1MIN',
            },{
                name:'5min',
                type:'KLINE_5MIN',
            },{
                name:'15min',
                type:'KLINE_15MIN',
            },{
                name:'30min',
                type:'KLINE_30MIN',
            },{
                name:'1hour',
                type:'KLINE_1HR',
            },{
                name:'1day',
                type:'KLINE_1DAY',
            },{
                name:'分时',
                type:'KLINE_UNKNOWN',
            },{
                name:'闪电',
                type:'KLINE_UNKNOWN',
            }],
            typeIndex:6,
            otherIndex:0,//
            chooseType:{
                name:'分时',
                type:'KLINE_UNKNOWN',
            },
            forceLine:0,//平仓线
            positionCashDeposit:0,//持仓保证金
            priceType:1,//1人民币 2美元 3both
            chartUrl:'', //图表链接
            chartType:'', //图表类别LIGHT为闪电图 ''为其他
            isLoadIframe:true, //是否正在加载iframe
            isShowRuleOrRate:false,//是否显示细则或汇率
        }
    },
    computed:{
        ...mapState([
            'currentQuota',
            'rmbOrUsd',
            'rateList',
            'tradeType'
        ]),
        ...mapState('market',[
            'LastData',
            'totalFloatProfit',
            'depositList',
            'addressLogin',
            'chartDataHttp',
        ]),
        ...mapState('trade',[
            'totalBalance',
            'todayCanUseBalance',
            'deposit',
            'tradeBascData',
            'positionList',
        ])
    },
    watch:{
        LastData:function(n,o){
            if(n[0]==o[0]){
                this.volume = n[6]-o[6];
            }else{
                this.volume = 0;
            }
        },
		deposit:function(){
			if(this.tradeBascData.RiskRatioForceStatus){
				//开启风险度风控
				this.forceLine = this.deposit/this.tradeBascData.RiskRatioForceClose;
			}else{
				if(this.tradeBascData.BalanceForceStatus){
					//开启净值风险度
					this.forceLine = this.tradeBascData.BalanceForceClose;
				}else{
					
				}
			}
		},
		positionList:function(){
			this.positionCashDeposit = 0;
			for(var i in this.positionList){
				this.positionCashDeposit = (this.positionCashDeposit+this.depositList[this.positionList[i].CommodityNo]*this.positionList[i].HoldNum*this.rateList[this.positionList[i].CurrencyNo].exchangeRate);
				// if(this.selectContractItem.CommodityNo == this.positionList[i].CommodityNo){
				// 	this.selectContractItem = this.positionList[i];
				// }
			}
        },
        currentQuota:function(){
            if(this.currentQuota.commodity_no!=''){
                this.changeChartUrl();
            }
        },
    },
    mounted(){
        if(this.$el.clientWidth<=870){
            this.$store.state.rmbOrUsd = this.priceType;
        }else{
            this.$store.state.rmbOrUsd = 3;
        }
        if(this.currentQuota.commodity_no!=''&&this.chartUrl==''){
            this.changeChartUrl();
        }
        this.$nextTick(()=>{
            this.resize();
        })
        window.addEventListener('resize',this.resize)
    },
    methods:{
        //图表连接
        changeChartUrl(){
            var chartUrl = '../../../../static/react-chart/index.html';
            // var chartUrl = 'http://192.168.0.100:8081/';
            var WSUrl = this.addressLogin;
            var apiUrl = this.chartDataHttp;
            chartUrl = `${chartUrl}?chartType=${this.chartType}&period=${this.chooseType.type}&contractNo=${this.currentQuota.security_type+'_'+this.currentQuota.commodity_no+'_'+this.currentQuota.mainContract}&contractName=${this.currentQuota.commodity_name}&apiUrl=${this.chartDataHttp+'/QryHistoryQuote'}&WSUrl=${this.addressLogin}&priceType=1&dotSize=${this.currentQuota.dotSize}`
            this.chartUrl = chartUrl;
            this.isLoadIframe = true;
            this.watchIfram();
        },
        resize(e){
            if(this.$el.clientWidth<=870){
                this.$store.state.rmbOrUsd = this.priceType;
            }else{
                this.$store.state.rmbOrUsd = 3;
            }
        },
        switchType(index){
            if(this.typeIndex != index){
                this.otherIndex = 0;
                this.isShowRuleOrRate = false;
                this.typeIndex = index;
                if(arguments[1]){
                    var item = arguments[1];
                    this.chooseType = item;
                    if(item.name == '闪电'){
                        this.chartType = 'LIGHT'
                    }else{
                        this.chartType = '';
                    }
                    this.changeChartUrl();
                }
            }
        },
        switchPriceType(index){
            if(this.priceType != index){
                this.priceType = index
            }
            //三重开关
            // if(this.priceType == index){
            //     switch(index){
            //         case 1:this.priceType = 2;break;
            //         case 2:this.priceType = 1;break;
            //     }
            // }else{
            //     if(this.priceType == 3){
            //         switch(index){
            //             case 1:this.priceType = 2;break;
            //             case 2:this.priceType = 1;break;
            //         }
            //     }else{
            //         this.priceType = 3;
            //     }
            // }
            this.$store.state.rmbOrUsd = this.priceType;
        },
        otherLayer(index){
            if(index == this.otherIndex){
                // this.otherIndex = 0;
                // this.isShowRuleOrRate = false;
            }else{
                if(index == 1){
                    //细则
                    this.otherIndex = index;
                }else if(index == 2){
                    //汇率
                    this.otherIndex = index;
                }
                this.typeIndex = -1;
                this.isShowRuleOrRate = true;
            }
        },
        //监听ifram
        watchIfram(){
            var iframe = document.getElementById("chart-ifram");
            if (!/*@cc_on!@*/0) { //如果不是IE，IE的条件注释  
                iframe.onload = ()=>{
                    this.isLoadIframe = false;     
                };  
            } else {  
                iframe.onreadystatechange = ()=>{ // IE下的节点都有onreadystatechange这个事件  
                    if (iframe.readyState == "complete"){  
                        this.isLoadIframe = false;
                    }  
                };  
            }  
        }
    },
    beforeDestroy(){
        window.removeEventListener('resize',this.resize);
    }
}
</script>

<style lang="scss" scoped>
.chart{
    width: 100%;
    height: 100%;
    background: $mainColor;
    overflow: hidden;
    .quota-info{
        height: 50px;
        display: flex;
        color: $normalFontColor;
        border-bottom: solid 1px $borderLineColor;
        background: $tabColor;
        padding: 0 10px;
        padding-left: 20px;
        .quota-info-item{
            display: flex;
            flex-direction: column;
            justify-content: center;
            // margin-right: 20px;
            width: 85px;
        }
        .quota-name-item{
            width: 100px;
            white-space: nowrap;
        }
        .quota-rate-item{
            width: 100px;
        }
        .quota-price-item{
            width: 75px;
        }
        .low-color{
            color:$placeHolderColor;
        }
    }
    .quota-info-hide{
        padding-left: 40px;
    }
    .type-bar{
        height: 30px;
        border-bottom: solid 1px $borderLineColor;
        color:$placeHolderColor;
        display: flex;
        .type-item{
            display: flex;
            align-items: center;
            height: 100%;
            padding: 0 10px;
            cursor: pointer;
        }
        .type-item-a{
            border-left: solid 1px $borderLineColor;
            border-right: solid 1px $borderLineColor;
        }
        .type-item-b{
            display: flex;
            align-items: center;
            height: 100%;
            padding: 0 10px;
            span{
                cursor: pointer;
                background: $borderLineColor;
                padding: 0 9px;
                border-radius:3px;
            }
        }
        .type-item:hover{
            background: $quotaChooseBgColor;
        }
        .type-item-active{
            color:$activeTabColor;
            background: $quotaChooseBgColor;
        }
        .type-item-b-active{
            color:$activeFontColor;
            span{
                background: $activeTabColor;
            }
        }
    }
    .chart-warp{
        height: calc(100% - 90px);
        position: relative;
        #chart-ifram{
            width: 100%;
            height: 100%;
            border: none;
            margin: 0;
        }
        .load-iframe{
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 100;
            width: 100%;
            height: 100%;
        }
        .rule-rate{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: $mainColor;
        }
    }
    .capital-info{
        height: 40px;
        padding: 0 10px;
        border-top: solid 1px $borderLineColor;
        display: flex;
        justify-content: space-between;
        .capital-info-warp{
            display: flex;
            height: 100%;
            width: calc(100% - 50px);
            flex: 1;
            justify-content: space-between;
            .capital-info-item{
                flex:1;
                display: flex;
                height: 100%;
                align-items: center;
                img{
                    width: 20px;
                    height: 20px;
                    margin-right: 10px;
                }
                .info-value-box{
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    .info-value-title{
                        white-space: nowrap;
                        color:$placeHolderColor;
                    }
                    .info-value{
                        color:$normalFontColor;
                    }
                }
            }
            // .no-flex{
            //     flex: 0;
            // }
        }
        .triangle-btn{
            display: flex;
            justify-content: center;
            align-items: center;
            .switch-price{
                width: 20px;
                height: 20px;
                border-radius: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: $borderLineColor;
                color: $placeHolderColor;
                cursor: pointer;
                margin-left: 10px;
            }
            .switch-price-active{
                color: $activeFontColor;
                background: $activeTabColor;
            }
        }
    }
    .vtrade-tab{
        background: $vtradeTabColor;
    }
}
</style>
