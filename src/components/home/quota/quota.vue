<template>
    <div class="quota">
        <div class="quota-warp">
            <div :class="['quota-hide-btn',isHideCard?'hide-card':'']" @click="switchHideCard" v-if="float">
                <span class="triangle"></span>
            </div>
            <div class="tabs">
                <ul class="tabs-wrap">
                    <li
                        :class="['tabs-item',quotaTabIndex==index?'tabs-item-active':'']"
                        v-for="(item,index) in tabs" :key="index"
                        @click="switchTab(index)"
                    >
                        {{item.name}}
                    </li>
                </ul>
            </div>
            <div class="search-box">
                <div class="input-wrap">
                    <img src="@/assets/imgs/common/search.png"/>
                    <input @input="searchContract" type="text" placeholder="请输入中文名称,代码" v-model="contractKeyword"/>
                </div>
            </div>
            <div class="quota-title">
                <span>名称</span>
                <span class="quota-title-right">
                    <span>最新价</span>
                    <span class="title-rate" @click="switchRateBtn">
                        涨跌{{switchRate?'幅':'额'}}
                        <img src="@/assets/imgs/common/switch1.png" />
                    </span>
                </span>
            </div>
            <div class="quota-wrap">
                <div :class="['quota-item',item.commodity_no==currentQuota.commodity_no?'quota-item-active':'']" 
                    v-for="(item,key,index) in quotaList" 
                    :key="index" 
                    @click="chooseQuota(item)"
                >
                    <span :class="['contract-float',item.isOnTrade?'':'notTrade']">
                        <span class="quota-item-left">
                            <span class="quota-item-left-item">
                                <span>{{item.commodity_name}}</span>
                                <span class="quota-no">{{item.commodity_no}}{{item.main_contract_no}}</span>
                            </span>
                            <span class="not-trade" v-if="!item.isOnTrade">休市</span>
                        </span>
                        <span class="quota-item-right">
                            <span :class="item.isOnTrade?item.quatoData&&item.quatoData[3]>item.quatoData[10]?item.quatoData[3]==item.quatoData[10]?'':'colorUp':'colorDown':''">{{item.quatoData?item.quatoData[3].toFixed(item.dotSize):'0'}}</span>
                            <span class="title-rate" :class="item.isOnTrade?item.quatoData&&item.quatoData[3]>item.quatoData[10]?item.quatoData[3]==item.quatoData[10]?'':'colorUp':'colorDown':''">
                                {{item.quatoData?switchRate?(item.quatoData[3]==0?'-':((item.quatoData[3]-item.quatoData[10])/item.quatoData[10]*100).toFixed(2)+'%'):(item.quatoData[3]==0?'-':(item.quatoData[3]-item.quatoData[10]).toFixed(item.dotSize)):'0'}}
                            </span>
                        </span>
                    </span>
                    <span :class="['bg-tip',item.isShowBg?item.color:'']"></span>
                </div>
                <div class="no-data" v-show="Object.keys(quotaList).length==0&&contractKeyword!=''">
                    无此数据
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import {getFormalDate} from '../../../util/index'
import {mapState,mapActions} from 'vuex'
export default {
    props:{
        float:{
            type:Boolean,
            default:false,
        },
        switchHideCard:{
            type:Function
        },
        isHideCard:{
            type:Boolean
        }
    },
    data(){
        return{
            tabs:[{
                name:'国内期货',
            },{
                name:'国际期货',
            }],
            quotaList:[], //行情列表
            switchRate:true,//切换涨跌额/涨跌幅 true涨跌幅 false涨跌额
            contractKeyword:'',//模糊查询选择的合约关键字
            timer:null,
        }
    },
    mounted(){
        this.$store.state.quotaType = 0;
        this.quotaList = this.domesticCommodity;
        this.timer = this.setTimer();
    },
    computed:{
        ...mapState([
            'currentQuota',
            'quotaTabIndex'
        ]),
        ...mapState('market',[
            'internationalCommodity',
            'domesticCommodity'
        ])
    },
    methods:{
        ...mapActions('market',[
            'depthSubscribe',
            'cancelDepthSubscribe',
            'tickerSubscribe',
            'cancelTickerSubscribe',
        ]),
        hiddenCard(){

        },
        // 切换合约类型
        switchTab(index){
            if(this.quotaTabIndex != index){
                this.$store.state.quotaTabIndex=index;
                this.$store.state.quotaType = this.quotaTabIndex;
                switch(index){
                    case 0:this.quotaList = this.domesticCommodity;break;
                    case 1:this.quotaList = this.internationalCommodity;break;
                }
                this.cancelDepthSubscribe();
                this.cancelTickerSubscribe();
                this.$store.state.currentQuota = this.quotaList[Object.keys(this.quotaList)[0]];
                this.$store.state.market.LastData = this.quotaList[Object.keys(this.quotaList)[0]].quatoData;
                this.depthSubscribe();
                this.tickerSubscribe();
                this.searchContract();
            };
        },
        //切换涨跌幅 涨跌额
        switchRateBtn(){
            this.switchRate = !this.switchRate;
        },
        //选中的合约
        chooseQuota(item){
            if(this.currentQuota.commodity_no != item.commodity_no){
                this.cancelDepthSubscribe();
                this.cancelTickerSubscribe();
                this.$store.state.currentQuota = item;
                this.depthSubscribe();
                this.tickerSubscribe();
                this.$store.state.market.LastData = item.quatoData;
            }
        },
        //模糊查询合约
        searchContract(){
            if(this.contractKeyword!=''){
                this.quotaList = {};
                if(this.quotaTabIndex==0){
                    //国内
                    for(var i in this.domesticCommodity){
                        if(this.domesticCommodity[i].commodity_no.indexOf(this.contractKeyword.toUpperCase())!=-1||this.domesticCommodity[i].commodity_name.indexOf(this.contractKeyword)!=-1){
                            this.quotaList[this.domesticCommodity[i].commodity_no]=this.domesticCommodity[i];
                        }
                    }
                }else if(this.quotaTabIndex==1){
                    //国际
                    for(var i in this.internationalCommodity){
                        if(this.internationalCommodity[i].commodity_no.indexOf(this.contractKeyword.toUpperCase())!=-1||this.internationalCommodity[i].commodity_name.indexOf(this.contractKeyword)!=-1){
                            this.quotaList[this.internationalCommodity[i].commodity_no]=this.internationalCommodity[i];
                        }
                    }
    
                }
            }else{
                if(this.quotaTabIndex==0){
                    //国内
                    this.quotaList = this.domesticCommodity;
                }else if(this.quotaTabIndex==1){
                    //国际
                    this.quotaList = this.internationalCommodity;
                }
            }
        },
        setTimer(contract){
            var timer = setInterval(()=>{
                for(var i in this.domesticCommodity){
                    this.domesticCommodity[i].isOnTrade = this.checkTradeTime({tradeTime:this.domesticCommodity[i].tradingTime,notTradeTime:this.domesticCommodity[i].notTradingTime});
                }
                for(var i in this.internationalCommodity){
                    this.internationalCommodity[i].isOnTrade = this.checkTradeTime({tradeTime:this.internationalCommodity[i].tradingTime,notTradeTime:this.internationalCommodity[i].notTradingTime});
                }
                if(this.quotaTabIndex == 0){
                    this.quotaList = this.domesticCommodity;
                }else if(this.quotaTabIndex == 1){
                    this.quotaList = this.internationalCommodity;
                }
            },500)
            return timer;
        },
        checkTradeTime(obj){
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
    }
}
</script>

<style lang="scss" scoped>
.quota{
    width: 100%;
    height: 100%;
    // overflow-x: hidden;
    // overflow-y: auto;
    position: relative;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    .quota-warp{
        background: $mainColor;
        height: 100%;
    }
    .quota-hide-btn{
        position: absolute;
        width: 20px;
        height: 20px;
        top: 15px;
        right:0px;
        background: $activeTabColor;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
        .triangle{
            width: 0;
            height: 0;
            border: solid 6px rgba(0,0,0,0);
            border-left-width: 0;
            border-right-color: $btnActiveIconFont;
        }
    }
    .hide-card{
        width: 20px;
        right:-20px;
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
        .triangle{
            transform: rotate(-180deg);
        }
    }
    .tabs{
        height: 50px;
        display: flex;
        align-items: center;
        .tabs-wrap{
            font-size: 14px;
            color:$normalFontColor;
            display: flex;
            flex-wrap: wrap;
            .tabs-item{
                padding: 2px 5px;
                border-radius: 3px;
                cursor: pointer;
            }
            .tabs-item-active{
                background: $activeTabColor;
                color: $activeFontColor;
            }
        }
    }
    .search-box{
        height: 30px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        .input-wrap{
            width: 100%;
            height: 100%;
            border: solid 1px $borderColor!important;
            border-radius: 3px;
            display: flex;
            align-items: center;
            padding: 0 10px;
            img{
                width: 16px;
                height: 16px;
                margin-right: 13px;
            }
            input{
                flex: 1;
                height: 100%;
                color: $activeFontColor;
            }
            input::placeholder{
                color: $placeHolderColor;
            }
        }
    }
    .quota-title{
        display: flex;
        padding: 0 10px;
        height: 40px;
        padding: 10px 10px 0 10px;
        color:$placeHolderColor;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        .quota-title-right{
            display: flex;
            .title-rate{
                text-align: right;
                width: 80px;
                cursor: pointer;
            }
        }
    }
    .quota-wrap{
        flex: 1;
        overflow: auto;
        height: calc(100% - 130px);
        .quota-item{
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            // padding: 0 10px;
            color: $normalFontColor;
            cursor: pointer;
            position: relative;
            .quota-item-left{
                display: flex;
                justify-content: flex-start;
                align-items: center;
                max-width: 136px;
                .quota-item-left-item{
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    // white-space: nowrap;
                    width: 100px;
                    span{
                        text-align: left;
                    }
                }
                .quota-no{
                    text-align: left;
                    font-size: 12px;
                    color: $placeHolderColor;
                }
                .not-trade{
                    white-space: nowrap;
                    background: $btnBgColor;
                    color: $activeFontColor;
                    font-size: 12px;
                    padding: 0 3px;
                    margin-left: 10px;
                }
            }
            .quota-item-right{
                display: flex;
                .title-rate{
                    text-align: right;
                    width: 80px;
                }
            }
            .notTrade{

            }
            .contract-float{
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                min-height: 30px;
                padding: 0 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                z-index: 11;
                // min-height: 50px;
                // display: flex;
                // -webkit-box-align: center;
                // -ms-flex-align: center;
                // align-items: center;
                // -webkit-box-pack: justify;
                // -ms-flex-pack: justify;
                // justify-content: space-between;
                // color: #b8bfe5;
                // cursor: pointer;
                // position: relative;
            }
            .bg-tip{
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                left: 0;
                height: 20px;
                width: 100%;
                z-index: 10;
            }
        }
        .quota-item:hover{
            background: $quotaChooseBgColor;
        }
        .quota-item-active{
            background: $quotaChooseBgColor;
        }
        .quota-item-active::after{
            content:'';
            background:$activeTabColor;
            width: 4px;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 12;
        }
        .no-data{
            color:$normalFontColor;
        }
    }
}
</style>

