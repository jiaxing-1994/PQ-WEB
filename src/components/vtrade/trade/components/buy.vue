<template>
    <div class="buy">
        <div class="value-item"> 
            <span class="value-title">下单价格</span>
            <span class="value-input">
                <input type="type" @blur="inputBlur" @click="priceClick" @input="priceChange" v-model="price"/>
            </span>
        </div>
        <div class="value-item"> 
            <span class="value-title">订单类型</span>
            <span class="value-input selec-warp">
                <type-select 
                    :options="options" 
                    @change="selectOption"
                    :defaultOption="type"
                    :maxLength=3
                ></type-select>
            </span>
        </div>
        <div class="value-item"> 
            <span class="value-title">委托数量</span>
            <span class="value-input">
                <input type="number" @blur="inputBlur" @input="handNumChange" v-model="handNum"/>
            </span>
            <span @click="numCount(1)" class="value-btn border-line">
                -
            </span>
            <span @click="numCount(2)" class="value-btn">
                +
            </span>
        </div>
        <div :class="['confirm-btn',!isLoginApp?'login-btn':'']" @click="confirmBtn(0)">
            <span class="confirm-btn-item" style="margin-left:0" v-show="isLoginApp&&isVTradeLogin">
                {{tradeType==0?'模拟买入':'买入'}}/{{currentPrice}}
            </span>
            <span class="confirm-btn-item confirm-btn-item-sell" style="margin-right:0" v-show="isLoginApp&&isVTradeLogin" @click="confirmBtn(1)">
                {{tradeType==0?'模拟卖出':'卖出'}}/{{currentPrice}}
            </span>
            <span class="login-btn-item" v-show="!isLoginApp" @click="goToLogin">
                请先登录
            </span>
        </div>
        <div class="layer-content confirm-layer" id="buy-layer-content">
             <div class="confirm-item">
                 <span class="confirm-item">名称:</span>
                 <span>{{currentQuota.commodity_name}}</span>
             </div>
             <div class="confirm-item">
                 <span class="confirm-item">代码:</span>
                 <span>{{currentQuota.commodity_no}}{{currentQuota.mainContract}}</span>
             </div>
             <div class="confirm-item">
                 <span class="confirm-item">价格:</span>
                 <span>{{this.type.value==1?'市价':this.type.value==2?'限价'+this.currentPrice:this.type.value==3?'排队价':'对手价'}}</span>
             </div>
             <div class="confirm-item">
                 <span class="confirm-item">方向:</span>
                 <span>模拟{{this.type.value==1?'市价':this.type.value==2?'限价'+this.currentPrice:this.type.value==3?'排队价':'对手价'}}</span>
             </div>
             <div class="confirm-item">
                 <span class="confirm-item">数量:</span>
                 <span>{{handNum}}手</span>
             </div>
        </div>
    </div>
</template>

<script>
import {mapState,mapActions} from 'vuex'
import typeSelect from '@/components/common/select.vue'
export default {
    components:{
        typeSelect
    },
    data(){
        return{
            options:[{
                name:'市价',
                value:1,
            },{
                name:'限价',
                value:2,
            },{
                name:'排队价',
                value:3,
            },{
                name:'对手价',
                value:4,
            }],
            type:{},
            prePrice:0,
            price:0, //订单价格
            preHandNum:1,
            handNum:1,//委托数量
            currentPrice:0,
            direction:0,//0买 1卖
        }
    },
    computed:{
        ...mapState([
            'currentQuota',
            'isLoginApp',
            'canCloseLayer',
            'isSendData',
            'tradeType',
            'rateList'
        ]),
        ...mapState('market',[
            'depositList'
        ]),
        ...mapState('vtrade',[
            'isVTradeLogin'
        ])
    },
    watch:{
        currentQuota:function(){
            if(this.currentQuota.quatoData&&this.currentQuota.quatoData[3]!=0){
                this.currentPrice = this.currentQuota.quatoData[3];
                this.type = this.options[0];
                this.price = this.type.name;
                this.handNum = 1;
            }
        }
    },
    mounted(){
        this.type = this.options[0];
        this.price = this.type.name;
    },
    methods:{
        ...mapActions('vtrade',[
            'sendWS'
        ]),
        //选择下单类型
        selectOption(item){
            this.type = item;
            if(item.name=='限价'){
                this.price = this.currentQuota.quatoData[3];
            }else{
                this.price = this.type.name;
            }
            switch(item.name){
                case '市价':
                    this.currentPrice = this.currentQuota.quatoData[3];
                ;break;
                case '限价':
                    this.currentPrice = this.price;
                ;break;
                case '对手价':
                    this.currentPrice = this.currentQuota.quatoData[11];
                ;break;
                case '排队价':
                    this.currentPrice = this.currentQuota.quatoData[13];
                ;break;
            }
        },
        //点击设置价格
        priceClick(){
            if(this.type.name!='限价'){
                this.type = this.options[1];
                this.price = this.currentQuota.quatoData[3];
                this.currentPrice = this.price;
                this.prePrice = this.price;
            }
        },
        //设置价格变化
        priceChange(e){
            if(!Number(this.price)&&this.price!=''){
                this.price = this.prePrice;
                this.currentPrice = this.price;
            }else{
                this.prePrice = this.price;
                this.currentPrice = this.price;
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
            if(this.price == ''){
                this.price = this.currentQuota.quatoData[3];
                this.currentPrice = this.price;
            }
            if(this.handNum == ''){
                this.handNum = 1;
            }
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
        //确定下单按钮
        confirmBtn(index){
            this.direction = index;
            this.$store.state.needMoney = (this.depositList[this.currentQuota.commodity_no]*this.handNum+this.currentQuota.fee*this.handNum)*this.rateList[this.currentQuota.currencyNo].exchangeRate/this.rateList['CNY'].exchangeRate;
            this.$layer({
                headerText:'确认提交订单?',
                isShowBg:true,
                contentText:'#buy-layer-content',
                btn:[
                {
                    text:'取消',
                    method:'关闭',
                },
                {
                    text:'确认',
                    method:this.sendOrder,
                    active:true
                }
                ]
            });
        },
        //发送下单
        sendOrder(){
            if(!this.isVTradeLogin){
                this.$toast({
                    content:'交易断开,请刷新页面'
                });
                return;
            }
            if(this.isSendData){
                return;
            }
            this.$store.state.canCloseLayer = false;
            this.$store.state.isSendData = true;
            var limitPrice = this.type.value==1?0:this.type.value==2?Number(this.currentPrice):this.type.value==3?this.currentQuota[13]:this.currentQuota[11];
            //确定下单
            var method = 'InsertOrder'; //调用方法
            var params = {
                CommodityType:Number(this.currentQuota.typeCode), //1国际期货
                ExchangeNo:this.currentQuota.exchange_no,// 交易所代码
                CommodityNo:this.currentQuota.commodity_no,//品种代码
                ContractNo:this.currentQuota.main_contract_no,//合约代码
                OrderNum: Number(this.handNum),//订单数量
                Direction:this.direction,//买卖方向 0:买 1:卖
                PriceType:this.type.value!=2?1:0,//价格类型 0:限价 1:市价
                LimitPrice:limitPrice,//限价价格
                OrderRef:'buy-1',//自定义数据
                OpenCloseType:1,//开平类型 1-开仓 2-平仓 3-平今
            }; //传入参数
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
    },
}
</script>

<style lang="scss" scoped>
.buy{
    height: 100%;
    padding-top: 5px;
    color: $placeHolderColor;
    position: relative;
    .test{
        display: flex;
        color:red;
    }
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
            // width: calc(100% - 70px);
            height: 30px;
            border: solid 1px $btnBgColor;
            display: flex;
            border-radius: 3px;
            input{
                flex:1;
                color:$normalFontColor;
                height: 100%;
                text-align: center;
            }
        }
        .selec-warp{
            border: none;
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
            background: $colorUp;
            display: flex;
            justify-content: center;
            align-items: center;
            color: $activeFontColor;
            border-radius: 3px;
            margin:0 5px;
        }
        .confirm-btn-item-sell{
            background: $colorDown;
        }
        .confirm-btn-item:hover{
            opacity: 0.9;
        }
        .confirm-btn-item:active{
            opacity: 0.8;
        }
    }
    .login-btn{
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
}
.confirm-layer{
    width: 190px;
    .confirm-item{
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .confirm-item{
            color: $layerTitleColor;
        }
    }
}
</style>
