<template>
    <div class="position-list">
        <div class="no-data" v-if="Object.keys(positionList).length==0">
            暂无数据
        </div>
        <div class="scroll-warp position-scroll-warp">
            <table border="0" cellpadding="10" cellspacing="0" v-show="Object.keys(positionList).length>0">
                <thead>
                    <tr class="position-title">
                        <th style="width:20%" class="position-title-item fix-title">名称</th>
                        <th style="width:15%" class="position-title-item fix-title">多空</th>
                        <th style="width:15%" class="position-title-item fix-title">手数</th>
                        <th style="width:20%" class="position-title-item fix-title">持仓均价</th>
                        <th class="position-title-item fix-title">浮动盈亏</th>
                    </tr>
                </thead>
                <tbody id="list-body">
                    <tr :class="['position-item',selectContractItem.CommodityNo==item.CommodityNo?'position-item-active':'']"
                        v-for="(item,key,index) in positionList"
                        :key="index"
                        @click="selectQuota(item,index)"
                    >
                        <td>
                            {{item.CommodityName}}
                        </td><td :class="item.Direction==0?'colorUp':'colorDown'">
                            {{item.Direction==0?'多':'&emsp;空'}}
                        </td><td>
                            {{item.HoldNum}}
                        </td><td>
                            {{item.HoldAvgPrice}}
                        </td><td :class="item.floatProfit>0?item.floatProfit==0?'':'colorUp':'colorDown'">
                            {{item.floatProfit}}:{{item.CurrencyNo}}
                        </td>
                    </tr>
                    <tr class="position-item-all">
                        <td>
                            合计({{Object.keys(positionList).length}})
                        </td><td>
                            
                        </td><td>
                            {{totalPositionNum}}
                        </td><td>
                        </td><td :class="totalFloatProfit>0?totalFloatProfit==0?'':'colorUp':'colorDown'">
                            <span v-if="rmbOrUsd==1">￥{{(totalFloatProfit/rateList.CNY.exchangeRate).toFixed(2)}}</span>
                            <span v-if="rmbOrUsd==2">${{totalFloatProfit.toFixed(2)}}</span>
                            <span v-if="rmbOrUsd==3">￥{{(totalFloatProfit/rateList.CNY.exchangeRate).toFixed(2)}}(${{totalFloatProfit.toFixed(2)}})</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="btn-warp">
            <span class="all-btn" v-if="Object.keys(positionList).length>0">
                <span @click="saleOrderAll">全部平仓</span>
            </span>
            <span class="award-btn" v-show="activityStatus=='020'&&received=='010'" @click="receiveAward">
                领取{{faceValue}}元{{couponName}}
            </span>
        </div>
        <div class="layer-content confirm-layer" id="sell-position-layer-content">
             <div class="confirm-item">
                 <span class="confirm-item">名称:</span>
                 <span>{{selectContractItem.CommodityName}}</span>
             </div>
             <div class="confirm-item">
                 <span class="confirm-item">代码:</span>
                 <span>{{selectContractItem.CommodityNo}}{{selectContractItem.ContractNo}}</span>
             </div>
        </div>
        <div class="layer-content stop-layer" id="stop-layer-content">
            <stop-layer ref="stopLayer"
                :tabIndex=1
                :selectContractItem="selectContractItem"
                @confrimMethod="stopConfirm"
            ></stop-layer>
        </div>
        <div class="layer-content award-layer" id="award-layer-content">
            <div class="award-content" :style="{'background-image':'url('+awardBgImg+')'}">
                <span class="award-value">
                    ￥<span class="award-value-num">{{faceValue}}</span>
                </span>
                <span class="award-type">({{couponName}})</span>
            </div>
            <div class="award-tip">
                去<span @click="goToPage">我的红包</span>使用>>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState,mapActions} from 'vuex'
import {inserAfter,removeAfter} from '@/util/index'
import stopLayer from './stopLayer.vue'
export default {
    components:{
        stopLayer
    },
    data(){
        return{
            positionIndex:-1, //持仓列表索引
            selectContractItem:{}, //选中的仓位合约
            isShowLayer:false,
            awardBgImg:require('../../../../assets/imgs/my/cash.png'),
        }
    },
    computed:{
        ...mapState([
            'rmbOrUsd',
            'rateList',
            'isSendData',
            'canCloseLayer',
            'api',
            'userInfo',
            'quotaTabIndex'
        ]),
        ...mapState('trade',[
            'positionList',
            'totalPositionNum',
            'activityStatus',
            'received',
            'activityId',
            'couponId',
            'activitiesName',
            'faceValue',
            'couponName'
        ]),
        ...mapState('market',[
            'totalFloatProfit',
            'selectContract',
            'selectLastData',
            'allSubsCommodity',
        ])
    },
    watch:{
        positionList:function(){
            if(JSON.stringify(this.selectContractItem)!='{}'&&!this.positionList[this.selectContractItem.CommodityNo]){
                this.selectQuota(this.selectContractItem,this.positionIndex);
            }
        }
    },
    mounted(){
        if(document.getElementsByClassName('position-scroll-warp')[0]){
            document.getElementsByClassName('position-scroll-warp')[0].addEventListener('scroll',this.listenerScroll);
        }
    },
    methods:{
        ...mapActions('trade',[
            'sendWS'
        ]),
        //监听滚动
        listenerScroll(e){
            var scrollTop = e.target.scrollTop;
            var scrollLeft = e.target.scrollLeft;
            var titleNode = document.getElementsByClassName('position-title-item');
            if(document.getElementsByClassName('position-btn-warp')[0]){
                var btnNode = document.getElementsByClassName('position-btn-warp')[0];
                if(scrollLeft!=0){
                    btnNode.style.paddingLeft = scrollLeft + 'px';
                }else{
                    btnNode.style.paddingLeft = '0px';
                }
            }
            for(var i=0;i<titleNode.length;i++){
                if(scrollTop!=0){
                    titleNode[i].style.top = scrollTop+'px';
                }else{
                    titleNode[i].style.top = '0px';
                }
            }
        },
        //选中行情
        selectQuota(item,index){
            var node = document.getElementsByClassName('position-item')[index];
            var parentNode = document.getElementById('list-body');
            if(this.selectContractItem.CommodityNo != item.CommodityNo){
                if(document.getElementById('option-btn')){
                    document.getElementById('position-btn1').removeEventListener('click',this.sellPosition)
                    document.getElementById('position-btn2').removeEventListener('click',this.oppositePosition)
                    document.getElementById('position-btn3').removeEventListener('click',this.stopLossProfit)
                    parentNode.removeChild(document.getElementById('option-btn'));
                }
                this.selectContractItem = item;
                this.switchChooseContract();
                this.positionIndex = index;
                this.$store.state.market.selectContract = this.allSubsCommodity[item.CommodityNo];
                this.$store.state.market.selectLastData = this.allSubsCommodity[item.CommodityNo].quatoData;
                var html = `
                    <tr>
                        <td colspan="5">
                            <div class="position-btn-warp">
                                <span class="position-btn" id="position-btn1">平仓</span>
                                <span class="position-btn" id="position-btn2">反手</span>
                                <span class="position-btn" id="position-btn3">止盈止损</span>
                            </div>
                        </td>
                    </tr>
                `;
                var newNode = document.createElement('tr');
                newNode.innerHTML = html;
                newNode.id = 'option-btn';
                inserAfter(newNode,node);
                document.getElementById('position-btn1').addEventListener('click',this.sellPosition)
                document.getElementById('position-btn2').addEventListener('click',this.oppositePosition)
                document.getElementById('position-btn3').addEventListener('click',this.stopLossProfit)
            }else{
                if(document.getElementById('option-btn')){
                    document.getElementById('position-btn1').removeEventListener('click',this.sellPosition)
                    document.getElementById('position-btn2').removeEventListener('click',this.oppositePosition)
                    document.getElementById('position-btn3').removeEventListener('click',this.stopLossProfit)
                    parentNode.removeChild(document.getElementById('option-btn'));
                    this.selectContractItem = {};
                    this.positionIndex = -1;
                }else{
                    this.selectContractItem = item;
                    this.switchChooseContract();
                    this.positionIndex = index;
                    this.$store.state.market.selectContract = this.allSubsCommodity[item.CommodityNo];
                    this.$store.state.market.selectLastData = this.allSubsCommodity[item.CommodityNo].quatoData;
                    var html = `
                        <tr>
                            <td colspan="5">
                                <div class="position-btn-warp">
                                    <span class="position-btn" id="position-btn1">平仓</span>
                                    <span class="position-btn" id="position-btn2">反手</span>
                                    <span class="position-btn" id="position-btn3">止盈止损</span>
                                </div>
                            </td>
                        </tr>
                    `;
                    var newNode = document.createElement('tr');
                    newNode.innerHTML = html;
                    newNode.id = 'option-btn'
                    inserAfter(newNode,node);
                    document.getElementById('position-btn1').addEventListener('click',this.sellPosition)
                    document.getElementById('position-btn2').addEventListener('click',this.oppositePosition)
                    document.getElementById('position-btn3').addEventListener('click',this.stopLossProfit)
                }
            }
        },
        //联动切换选择合约
        switchChooseContract(){
            console.log(this.selectContractItem);
            console.log()
            const contract = this.allSubsCommodity[this.selectContractItem.CommodityNo];
            if(contract.security_type=='FI'){
                this.$store.state.quotaTabIndex = 0;
            }else if(contract.security_type=='FO'){
                this.$store.state.quotaTabIndex = 1;
            }
            this.$store.state.currentQuota = this.allSubsCommodity[this.selectContractItem.CommodityNo];
        },
        //平仓
        sellPosition(){
            if(!this.allSubsCommodity[this.selectContractItem.CommodityNo].isOnTrade){
                this.$toast({
                    content:'非交易时间,无法平仓'
                });
                return;
            }
            this.$layer({
                headerText:'确认平仓?',
                isShowBg:true,
                contentText:'#sell-position-layer-content',
                btn:[
                {
                    text:'取消',
                    method:'关闭',
                },
                {
                    text:'确认',
                    method:()=>{
                        if(this.isSendData){
                            return;
                        }
                        this.$store.state.canCloseLayer = false;
                        this.$store.state.isSendData = true;
                        var method = 'InsertOrder'; //调用方法
                        var params = {
                            CommodityType:Number(this.selectContractItem.CommodityType), //1国际期货
                            ExchangeNo:this.selectContractItem.ExchangeNo,// 交易所代码
                            CommodityNo:this.selectContractItem.CommodityNo,//品种代码
                            ContractNo:this.selectContractItem.ContractNo,//合约代码
                            OrderNum:Number(this.selectContractItem.HoldNum),//订单数量
                            Direction:this.selectContractItem.Direction==0?1:0,//买卖方向 0:买 1:卖
                            PriceType:1,//价格类型 0:限价 1:市价
                            LimitPrice:0,//限价价格
                            OrderRef:'2',//自定义数据
                            OpenCloseType:2,//开平类型 1-开仓 2-平仓 3-平今
                        }; //传入参数
                        this.sendWS({method,params});
                    },
                    active:true
                }
                ]
            });
        },
        //反手
        oppositePosition(){
            if(!this.allSubsCommodity[this.selectContractItem.CommodityNo].isOnTrade){
                this.$toast({
                    content:'非交易时间,无法反手'
                });
                return;
            }
            this.$layer({
                headerText:'确认反手?',
                isShowBg:true,
                contentText:'#sell-position-layer-content',
                btn:[
                {
                    text:'取消',
                    method:'关闭',
                },
                {
                    text:'确认',
                    method:()=>{
                        if(this.isSendData){
                            return;
                        }
                        this.$store.state.canCloseLayer = false;
                        this.$store.state.isSendData = true;
                        var method = 'InsertOrder'; //调用方法
                        var params = {
                            CommodityType:Number(this.selectContractItem.CommodityType), //1国际期货
                            ExchangeNo:this.selectContractItem.ExchangeNo,// 交易所代码
                            CommodityNo:this.selectContractItem.CommodityNo,//品种代码
                            ContractNo:this.selectContractItem.ContractNo,//合约代码
                            OrderNum:Number(this.selectContractItem.HoldNum)*2,//订单数量
                            Direction:this.selectContractItem.Direction==0?1:0,//买卖方向 0:买 1:卖
                            PriceType:1,//价格类型 0:限价 1:市价
                            LimitPrice:0,//限价价格
                            OrderRef:'',//自定义数据
                        }; //传入参数
                        this.sendWS({method,params});
                    },
                    active:true
                }
                ]
            });
        },
        //止损止盈
        stopLossProfit(){
            if(!this.allSubsCommodity[this.selectContractItem.CommodityNo].isOnTrade){
                this.$toast({
                    content:'非交易时间,无法设置止损止盈'
                });
                return;
            }
            this.$layer({
                headerText:'',
                isShowBg:true,
                contentText:'#stop-layer-content',
                isShowCloseBtn:false,
                btn:[{
                    text:'取消',
                    method:'关闭',
                },{
                    text:'确认',
                    method:this.stopConfirm,
                    active:true,
                }]
            })
        },
        stopConfirm(){
            if(this.isSendData){
                return;
            }
            this.$store.state.canCloseLayer = false;
            this.$store.state.isSendData = true;
            const stopLayer = this.$refs.stopLayer;
			var method = 'InsertStopLoss'; //调用方法
			var params = {
				CommodityType:Number(this.selectContractItem.CommodityType), //1国际期货
				ExchangeNo:this.selectContractItem.ExchangeNo,// 交易所代码
				CommodityNo:this.selectContractItem.CommodityNo,//品种代码
				ContractNo:this.selectContractItem.ContractNo,//合约代码
				Num:Number(stopLayer.handNum),//订单数量
				StopLossType:stopLayer.tabType==1?stopLayer.priceType.value:1,//止损类型0-限价触发止损1-限价触发止盈2-浮动止损
				StopLossPrice:stopLayer.priceType.value==0||stopLayer.tabType==2?Number(stopLayer.price):(this.selectContractItem.Direction==0?Number(this.selectLastData[3]-stopLayer.floatPrice):Number(this.selectLastData[3]+stopLayer.floatPrice)),//止损(赢)价 
				StopLossDiff:stopLayer.priceType.value==2?Number(stopLayer.floatPrice):0,//动态止损的点差
				HoldAvgPrice:this.selectContractItem.HoldAvgPrice,//持仓均价
				HoldDirection:this.selectContractItem.Direction,//持仓方向
				OrderType:1,
			}
            this.sendWS({method,params});
        },
        //全部平仓
        saleOrderAll(){
            this.$layer({
                headerText:'确认全部平仓',
                isShowBg:true,
                contentText:'是否全部平仓',
                isShowCloseBtn:false,
                btn:[{
                    text:'取消',
                    method:'关闭'
                },{
                    text:'确认',
                    method:()=>{
                        var isCanSale = true;
                        for(var i in this.positionList){
                            if(!this.allSubsCommodity[i].isOnTrade){
                                isCanSale = false;
                            }
                        }
                        if(isCanSale){
                            if(this.isSendData){
                                return;
                            }
                            for(var i in this.positionList){
                                this.$store.state.canCloseLayer = false;
                                this.$store.state.isSendData = true;
                                var method = 'InsertOrder'; //调用方法
                                var params = {
                                    CommodityType:Number(this.positionList[i].CommodityType), //1国际期货
                                    ExchangeNo:this.positionList[i].ExchangeNo,// 交易所代码
                                    CommodityNo:this.positionList[i].CommodityNo,//品种代码
                                    ContractNo:this.positionList[i].ContractNo,//合约代码
                                    OrderNum:Number(this.positionList[i].HoldNum),//订单数量
                                    Direction:this.positionList[i].Direction==0?1:0,//买卖方向 0:买 1:卖
                                    PriceType:1,//价格类型 0:限价 1:市价
                                    LimitPrice:0,//限价价格
                                    OrderRef:'2',//自定义数据
                                    OpenCloseType:2,//开平类型 1-开仓 2-平仓 3-平今
                                }; //传入参数
                                this.sendWS({method,params});
                            }
                        }else{
                            this.$toast({
                                content:'有处于非交易时间段的订单,暂时无法全部平仓'
                            })
                            return;
                        }
                    },
                    active:true,
                }]
            })
        },
        //领取奖励
        receiveAward(){
            this.$http.post(this.api+'/receiveCoupon',{
                activityId: this.activityId,
                couponId: this.couponId
            },{
                token:this.userInfo.token,
                secret:this.userInfo.secret
            }).then((res)=>{
                if(res.success&&res.code == '010'){
                    this.$store.state.trade.received = '020';
                    this.$toast({
                        content:'领取成功'
                    });
                    this.$layer({
                        headerText:'领取'+this.couponName,
                        isShowBg:true,
                        contentText:'#award-layer-content',
                        isShowCloseBtn:false,
                        btn:[{
                            text:'取消',
                            method:'关闭'
                        }]
                    })
                }else{
                    this.$toast({
                        content:res.message
                    })
                }
            }).catch((err)=>{
                console.log(err);
            });
        },
        //跳转页面
        goToPage(){
            this.$router.push({
                path:'/my/red'
            })
        }
    },
    beforeDestroy(){
        // document.getElementsByClassName('position-scroll-warp')[0].removeEventListener('scroll',this.listenerScroll)
    }
}
</script>

<style lang="scss" scoped>
.position-list{
    height:100%;
    .scroll-warp{
        height: calc(100% - 40px);
        overflow: auto;
    }
    .btn-warp{
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
        .all-btn{
            height: 30px;
            width: 70px;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            background: $btnBgColor;
            span{
                color:$activeFontColor;
            }
        }
        .award-btn{
            color: $awardFontColor;
            text-decoration:underline;
            cursor: pointer;
        }
    }
}
table{
    min-width: 100%;
    border-collapse: collapse;
    thead{
        .position-title{
            .fix-title{
                white-space: nowrap;
                background: $mainColor !important;
                position: relative !important;
                text-align: left;
                top: 0;
            }
        }
    }
    tbody{
        color: $normalFontColor;
    }
    tr{
        height: 30px;
        td{
            padding-right: 30px;
            white-space: nowrap;
            text-align: left;
        }
        td:last-child{
            padding-right: 10px;
        }
    }
    .position-item{
        cursor: pointer;
        border-top: solid 1px $positionBorderColor;
    }
    .position-item-all{
        border-top: solid 1px $positionBorderColor;
        border-bottom: solid 1px $positionBorderColor;
    }
    .position-item:hover{
        background:$quotaChooseBgColor;
    }
    .position-item-active{
        background:$quotaChooseBgColor;
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
.stop-layer{
    width: 400px;
}
.award-layer{
    width: 100%;
    padding: 20px;
    padding-bottom: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .award-content{
        flex: 1;
        height: 80px;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 10px;
        span{
            flex: 1;
            color: #fff;
        }
        .award-value{
            font-size: 16px;
            letter-spacing: -2px;
            .award-value-num{
                font-size: 30px;
                font-weight: bold;
            }
        }
        .award-type{
            font-size: 14px;
        }
    }
    .award-tip{
        font-size: 14px;
        width: 100%;
        text-align: right;
        color:#adadad;
        span{
            color:#333;
            border-bottom: solid 1px #333;
            cursor: pointer;
        }
    }
}
</style>
