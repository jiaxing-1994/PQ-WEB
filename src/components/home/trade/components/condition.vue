<template>
    <div class="condition">
        <!-- <div class="value-item"> 
            <span class="value-title">合约代码</span>
            <span class="value-input no-border">
                <type-select 
                    :options="options" 
                    @change="selectOption"
                    :defaultOption="currentContract"></type-select>
            </span>
        </div> -->
        <div class="value-item"> 
            <span class="value-title">条件类型</span>
            <span class="value-input no-border">
                <span 
                    :class="['type-btn',typeIndex==0?'type-btn-active':'']"
                    @click="switchType(0)"
                >
                    价格条件
                </span>
                <span 
                    :class="['type-btn',typeIndex==1?'type-btn-active':'']"
                    @click="switchType(1)"
                >
                    时间条件
                </span>
            </span>
        </div>
        <div class="value-item"> 
            <span class="value-title">触发{{typeIndex==0?'价格':'时间'}}</span>
            <span class="value-input no-border">
                <span :class="['trigger-item','trigger-left',typeIndex==1?'trigger-left2':'']">
                    <span v-show="typeIndex==0" class="trigger-left-warp">
                        <span class="trigger-select">
                            <type-select 
                                :options="conditionOptions" 
                                @change="selectConditionOption"
                                :maxLength=3></type-select>
                        </span>
                        <span class="trigger-input">
                            <input type="text" @blur="inputBlur" @input="PriceChange" v-model="triggerPrice"/>
                        </span>
                    </span>
                    <span v-show="typeIndex==1" class="trigger-input">
                        <input id="trigger-time" @input="timeChange" type="text" v-model="showTime"/>
                    </span>
                </span>
                <span class="trigger-item trigger-right">
                    <span class="addition-item">
                        {{typeIndex==0?'附加':'价格附加'}}
                    </span>
                    <span class="addition-item addition-warp">
                        <span class="trigger-select">
                            <type-select 
                                :options="addtitionOptions" 
                                @change="selectAdditionOption"
                                :maxLength=3
                            ></type-select>
                        </span>
                        <span class="trigger-input">
                            <input :readonly="additionType==-1" type="text" @input="additionPriceChange" v-model="additionPrice"/>
                        </span>
                    </span>
                </span>
            </span>
        </div>
        <div class="value-item"> 
            <span class="value-title">委托价格</span>
            <span class="value-input no-border">
                <span 
                    :class="['type-btn',priceType==1?'type-btn-active':'']"
                    @click="switchPriceType(1)"
                >
                    市价
                </span>
                <span 
                    :class="['type-btn',priceType==2?'type-btn-active':'']"
                    @click="switchPriceType(2)"
                >
                    对手价
                </span>
            </span>
        </div>
        <div class="value-item"> 
            <span class="value-title">委托数量</span>
            <span class="value-input no-border num-warp">
                <span class="num-item">
                    <span class="num-input">
                        <input type="number"  @blur="inputBlur" @input="handNumChange" v-model="handNum"/>
                    </span>
                    <span @click="numCount(1)" class="num-btn border-line">
                        -
                    </span>
                    <span @click="numCount(2)" class="num-btn">
                        +
                    </span>
                </span>
                <span class="num-item">
                    <span class="value-title">有效期</span>
                    <span class="value-type">当日有效</span>
                </span>
            </span>
        </div>
        <div class="confirm-btn">
            <span class="confirm-btn-item buy" @click="confirmBtn(0)" v-show="isLoginApp&&isTradeLogin">
                {{tradeType==0?'模拟买入':'买入'}}/{{priceType==1?'市价':'对手价'}}
            </span>
            <span class="confirm-btn-item sell" @click="confirmBtn(1)" v-show="isLoginApp&&isTradeLogin">
                {{tradeType==0?'模拟卖出':'卖出'}}/{{priceType==1?'市价':'对手价'}}
            </span>
            <span class="login-btn-item" v-show="!isLoginApp" @click="goToLogin">
                请先登录
            </span>
        </div>
    </div>
</template>

<script>
import {mapState,mapActions} from 'vuex'
import typeSelect from '@/components/common/select.vue'
import {getFormalDate} from '@/util/index.js'
export default {
    components:{
        typeSelect
    },
    data(){
        return{
            options:[],
            conditionOptions:[{
                name:'>',
                value:0
            },{
                name:'<',
                value:1
            },{
                name:'>=',
                value:2
            },{
                name:'<=',
                value:3
            }],
            addtitionOptions:[{
                name:'附加',
                value:-1
            },{
                name:'>',
                value:0,
            },{
                name:'<',
                value:1,
            },{
                name:'>=',
                value:2,
            },{
                name:'<=',
                value:3
            }],
            defaultContract:{
                name:''
            },
            currentContract:{
                name:'',
            }, //选择的合约
            contract:{
                name:'',
            }, //选择的合约
            typeIndex:0,//0价格条件 1时间条件
            priceType:1,//1市价 2对手价
            triggerTime:'',//触发时间
            showTime:'',//显示的触发时间
            preShowTime:'',//上一个显示的触发时间
            triggerType:0, //价格触发条件
            triggerPrice:0,//触发价格
            preTriggerPrice:0,//上一个触发价格
            additionType:-1,//附加条件
            additionPrice:'',//附加价格
            preAdditionPrice:'',//上一个附加价格
            handNum:1,//委托数量
        }
    },
    computed:{
        ...mapState([
            'currentQuota',
            'quotaType',
            'isLoginApp',
            'isSendData',
            'canCloseLayer',
            'tradeType',
        ]),
        ...mapState('market',[
            'selectContract',
            'selectLastData',
            'LastData',
            'internationalCommodity',
            'domesticCommodity',
            'depositList'
        ]),
        ...mapState('trade',[
            'isTradeLogin'
        ])
    },
    watch:{
        quotaType:function(){
            // if(this.quotaType==0){
            //     //国内
            //     if(Object.keys(this.domesticCommodity).length>0){
            //         this.options = this.handleContractData(this.domesticCommodity);
            //     }
            // }else if(this.quotaType==1){
            //     //国际
            //     if(Object.keys(this.internationalCommodity).length>0){
            //         this.options = this.handleContractData(this.internationalCommodity);
            //     }
            // }
            // this.$store.state.market.selectContract = this.currentContract.contract;
            // this.$store.state.market.selectLastData = this.currentContract.contract.quatoData;
            // this.currentContract = this.options[0];
            this.currentContract = {
                name: this.currentQuota.commodity_name,
                contract:this.currentQuota
            };
        },
        // domesticCommodity:function(){
        //     if(this.options.length==0){
        //         this.options = this.handleContractData(this.domesticCommodity);
        //     }
        // },
        currentQuota:function(){
            this.currentContract = {
                name: this.currentQuota.commodity_name,
                contract:this.currentQuota
            };
            // this.$store.state.market.selectContract = this.currentContract.contract;
            // this.$store.state.market.selectLastData = this.currentContract.contract.quatoData;
            this.triggerPrice = this.currentContract.contract.quatoData[3];
            if(this.additionType!='-'){
                this.additionPrice = this.currentContract.contract.quatoData[3];
            }
            this.handNum = 1;
        },
    },
    mounted(){
        var nowDate = getFormalDate(new Date(),'hh:mm:ss');
        this.showTime = getFormalDate(new Date().getTime()+3600000,'hh:mm:ss');
        this.preShowTime = this.showTime;
        this.triggerTime = getFormalDate(new Date().getTime()+3600000,'yyyy/mm/dd hh:mm:ss');
        laydate.render({
            elem:'#trigger-time',
            type: 'time',
            theme:'#252a44',
            min:nowDate,
            max:'23:59:59',
            done:(value,date,endDate)=>{
                this.triggerTime = date.year+'/'+date.month+'/'+date.date+' '+value;
                this.showTime = value;
                this.preShowTime = this.showTime;
            }
        })
        this.initData();
    },
    methods:{
        ...mapActions('trade',[
            'sendWS'
        ]),
        initData(){
            // if(this.quotaType==0){
            //     //国内
            //     if(Object.keys(this.domesticCommodity).length>0){
            //         this.options = this.handleContractData(this.domesticCommodity);
            //     }
            // }else if(this.quotaType==1){
            //     //国际
            //     if(Object.keys(this.internationalCommodity).length>0){
            //         this.options = this.handleContractData(this.internationalCommodity);
            //     }
            // }
            if(this.currentQuota.commodity_name!=''){
                this.currentContract = {
                    name: this.currentQuota.commodity_name,
                    contract:this.currentQuota
                };
                // this.$store.state.market.selectContract = this.currentContract.contract;
                // this.$store.state.market.selectLastData = this.currentContract.contract.quatoData;
            }else{
                // this.currentContract = this.options[0];
                // this.$store.state.market.selectContract = this.currentContract.contract;
                // this.$store.state.market.selectLastData = this.currentContract.contract.quatoData;
            }
            this.triggerPrice = this.LastData[3];
        },
        //处理合约数据
        // handleContractData(data){
        //     var result = [];
        //     for(var i in data){
        //         var obj = {
        //             name:data[i].commodity_name,
        //             contract:data[i]
        //         }
        //         result.push(obj);
        //     }
        //     return result;
        // },
        //选择合约
        // selectOption(item){
            // this.contract = item;
            // this.$store.state.market.selectContract = this.contract.contract;
            // if(this.contract.contract.security_type == 'FO'){
            //     //国际
            //     this.$store.state.market.selectLastData = this.internationalCommodity[this.contract.contract.commodity_no].quatoData;
            // }else if(this.contract.contract.security_type == 'FI'){
            //     //国内
            //     this.$store.state.market.selectLastData = this.domesticCommodity[this.contract.contract.commodity_no].quatoData;
            // }
        // },
        //价格条件
        selectConditionOption(item){
            this.triggerType = item.value;
        },
        //附加条件
        selectAdditionOption(item){
            this.additionType = item.value;
            if(item.value == -1){
                this.additionPrice = '';
            }else if(this.additionPrice==''){
                this.additionPrice = this.LastData[3];
            }
        },
        //切换类别
        switchType(index){
            if(this.typeIndex != index){
                this.typeIndex = index
            }
        },
        //切换价格类别
        switchPriceType(index){
            if(this.priceType != index){
                this.priceType = index;
            }
        },
        //价格变化
        PriceChange(){
            console.log(this.triggerPrice);
            if(!Number(this.triggerPrice)&&this.triggerPrice!=''){
                this.triggerPrice = this.preTriggerPrice;
            }else{
                this.preTriggerPrice = this.triggerPrice;
            }
        },
        //附加价格变化
        additionPriceChange(){
            if(this.additionType == -1){
                this.additionPrice = '';
                return;
            }
            if(!Number(this.additionPrice)&&this.additionPrice!=''){
                this.additionPrice = this.preAdditionPrice;
            }else{
                this.preAdditionPrice = this.additionPrice;
            }
        },
        //设置手数变化
        handNumChange(){
            if(!Number(this.handNum)&&this.handNum!=''){
                this.handNum = this.preHandNum;
            }else{
                this.preHandNum = this.handNum;
                if(this.handNum>99){
                    this.handNum = 99;
                }else if(this.handNum<=0){
                    this.handNum = '';
                }
            }
        },
        //input失去焦点
        inputBlur(){
            if(this.triggerPrice == ''){
                this.triggerPrice = this.currentQuota.quatoData[3];
            }
            if(this.handNum == ''){
                this.handNum = 1;
            }
            this.triggerPrice = Number(this.triggerPrice);
            this.handNum = parseInt(this.handNum);
        },
        //加减手数
        numCount(index){
            if(index == 1){
                //减
                this.handNum--;
                if(this.handNum<=0){
                    this.handNum = 1
                }
            }else if(index == 2){
                //加
                this.handNum++;
                if(this.handNum>99){
                    this.handNum = 99
                }
            }
        },
        //时间条件选择时间
        timeChange(){
            this.showTime = this.preShowTime;
        },
        //确定下单按钮
        confirmBtn(index){
            this.sendOrder(index);
        },
        //发送订单
        sendOrder(index){
            if(this.isSendData){
                return;
            }
            this.$store.state.canCloseLayer = false;
            this.$store.state.isSendData = true;
            var method = 'InsertCondition'; //调用方法
            var params = {
                CommodityType:Number(this.currentQuota.typeCode), //品种类型
                ExchangeNo:this.currentQuota.exchange_no,//交易所代码
                CommodityNo:this.currentQuota.commodity_no,//品种代码
                ContractNo:this.currentQuota.main_contract_no,//合约代码
                Num:Number(this.handNum),//手数 
                ConditionType:this.typeIndex,//止损(赢)价
                PriceTriggerPonit:Number(this.triggerPrice),//触发价
                CompareType:Number(this.triggerType), //价格触发方式
                TimeTriggerPoint:this.triggerTime.replace(/\//g,'-'), //触发时间
                AB_BuyPoint:0,
                AB_SellPoint:0,
                OrderType:1,
                Direction:Number(index),
                AdditionFlag:this.additionType==-1?false:true,
                AdditionType:this.additionType==-1?0:Number(this.additionType),
                AdditionPrice:this.additionType==-1?0:Number(this.additionPrice),
            };
            this.sendWS({method,params})
        },
        goToLogin(){
            this.$store.state.loginTabIndex = 1;
            this.$layer({
                headerText: '',
                isShowBg: true,
                isShowCloseBtn: true,
                contentText: '#login',
                closeFunc:()=>{
                    this.$store.state.isShowForget = false;
                }
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.condition{
    height: 100%;
    padding-top: 5px;
    color: $placeHolderColor;
    position: relative;
    .value-item{
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        padding:0 10px;
        .value-title{
            width: 70px;
        }
        .value-input{
            flex: 1;
            width: calc(100% - 70px);
            height: 30px;
            border: solid 1px $btnBgColor;
            display: flex;
            align-items: center;
            border-radius: 3px;
            color: $normalFontColor;
            input{
                flex:1;
                color:$normalFontColor;
                height: 100%;
                text-align: center;
            }
            .type-btn{
                cursor: pointer;
                margin-right: 15px;
            }
            .type-btn-active{
                background: $activeTabColor;
                color:$activeFontColor;
                border-radius: 3px;
                padding: 3px 5px;
            }
            .num-item{
                flex: 1;
                display: flex;
                align-items: center;
                height: 100%;
                .num-input{
                    height: 100%;
                    border: solid 1px $btnBgColor;
                    flex: 1;
                    input{
                        width: 100%;
                    }
                }
                .num-btn{
                    width: 32px;
                    height: 32px;
                    background: $btnBgColor;
                    color: $btnIconFont;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    font-size: 26px;
                }
                .value-title{
                    color:$placeHolderColor;
                }
                .value-type{
                    background: $quotaChooseBgColor;
                    border-radius: 3px;
                    padding: 3px 5px;
                }
            }
            .trigger-item{
                // flex: 1;
                display: flex;
                align-items: center;
                height: 100%;
                .addition-item{
                    height: 100%;
                    display: flex;
                    white-space: nowrap;
                    align-items: center;
                }
                .addition-warp{

                }
                .trigger-select{
                    flex: 1;
                    margin-left: 5px;
                    margin-right: 10px;
                    height: 100%;
                }
                .trigger-input{
                    flex: 1;
                    height: 100%;
                    border: solid 1px $btnBgColor;
                    border-radius: 3px;
                    input{
                        width: 100%;
                    }
                }
            }
            .trigger-right{
                flex: 1;
            }
            .trigger-left{
                width: 125px;
                margin-right: 5px;
                .trigger-left-warp{
                    height: 100%;
                    display: flex;
                    white-space: nowrap;
                    align-items: center;
                }
            }
            .trigger-left2{
                width: 100px;
                margin-right: 5px;
            }
        }
        .num-warp{
            justify-content: space-between;
        }
        .value-btn{
            width: 32px;
            height: 32px;
            background: $btnBgColor;
            color: $btnIconFont;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-size: 26px;
        }
        .border-line{
            border-right: solid 1px $tabColor;
        }
    }
    .confirm-btn{
        width: 100%;
        position: absolute;
        bottom: 10px;
        height: 30px;
        padding: 0 10px;
        display: flex;
        box-sizing: border-box;
        .confirm-btn-item{
            cursor: pointer;
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            color: $activeFontColor;
            border-radius: 3px;
        }
        .confirm-btn-item:hover{
            opacity: 0.9;
        }
        .confirm-btn-item:active{
            opacity: 0.8;
        }
        .buy{
            background: $colorUp;
            margin-right: 5px;
        }
        .sell{
            background: $colorDown;
            margin-left: 5px;
        }
        .login-btn-item{
            background: $btnBgColor;
            color: $activeTabColor;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            flex: 1;
            border-radius: 3px;
        }
    }
    .no-border{
        border: none!important;
    }
}
</style>
