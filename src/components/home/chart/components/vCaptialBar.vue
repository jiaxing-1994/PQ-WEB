<template>
    <div :class="['capital-info',tradeType==0?'vtrade-tab':'']">
        <div class="capital-info-warp">
            <span class="capital-info-item">
                <img src="@/assets/imgs/captial/a.png" />
                <span class="info-value-box">
                    <span class="info-value-title">总资产</span>
                    <span class="info-value">
                        <span v-if="rmbOrUsd==1">￥{{((totalBalance+totalFloatProfit)/rateList.CNY.exchangeRate).toFixed(2)}}</span>
                        <span v-if="rmbOrUsd==2">${{(totalBalance+totalFloatProfit).toFixed(2)}}</span>
                        <span v-if="rmbOrUsd==3">￥{{(((totalBalance+totalFloatProfit).toFixed(2))/rateList.CNY.exchangeRate).toFixed(2)}}(${{(totalBalance+totalFloatProfit).toFixed(2)}})</span>
                    </span>
                </span>
            </span>
            <span class="capital-info-item">
                <img src="@/assets/imgs/captial/b.png" />
                <span class="info-value-box">
                    <span class="info-value-title">可用资金</span>
                    <span class="info-value">
                        <span v-if="rmbOrUsd==1">￥{{((todayCanUseBalance+totalFloatProfit)/rateList.CNY.exchangeRate).toFixed(2)}}</span>
                        <span v-if="rmbOrUsd==2">${{(todayCanUseBalance+totalFloatProfit).toFixed(2)}}</span>
                        <span v-if="rmbOrUsd==3">￥{{(((todayCanUseBalance+totalFloatProfit).toFixed(2))/rateList.CNY.exchangeRate).toFixed(2)}}(${{(todayCanUseBalance+totalFloatProfit).toFixed(2)}})</span>
                    </span>
                </span>
            </span>
            <span class="capital-info-item">
                <img src="@/assets/imgs/captial/d.png" />
                <span class="info-value-box">
                    <span class="info-value-title">平仓线</span>
                    <span class="info-value">
                        <span v-if="rmbOrUsd==1">￥{{(forceLine/rateList.CNY.exchangeRate).toFixed(2)}}</span>
                        <span v-if="rmbOrUsd==2">${{forceLine.toFixed(2)}}</span>
                        <span v-if="rmbOrUsd==3">￥{{(forceLine/rateList.CNY.exchangeRate).toFixed(2)}}(${{forceLine.toFixed(2)}})</span>
                    </span>
                </span>
            </span>
            <span class="capital-info-item">
                <img src="@/assets/imgs/captial/e.png" />
                <span class="info-value-box">
                    <span class="info-value-title">持仓保证金</span>
                    <span class="info-value">
                        <span v-if="rmbOrUsd==1">￥{{(positionCashDeposit/rateList.CNY.exchangeRate).toFixed(2)}}</span>
                        <span v-if="rmbOrUsd==2">${{positionCashDeposit.toFixed(2)}}</span>
                        <span v-if="rmbOrUsd==3">￥{{(positionCashDeposit/rateList.CNY.exchangeRate).toFixed(2)}}(${{positionCashDeposit.toFixed(2)}})</span>
                    </span>
                </span>
            </span>
            <span class="capital-info-item no-flex">
                <img src="@/assets/imgs/captial/c.png" />
                <span class="info-value-box">
                    <span class="info-value-title">风险度</span>
                    <span :class="['info-value',
                        (forceLine/(totalBalance+totalFloatProfit)*100)==0?'':'',
                        (forceLine/(totalBalance+totalFloatProfit)*100)!=0&&(forceLine/(totalBalance+totalFloatProfit)*100)<30?'low-risk':'',
                        (forceLine/(totalBalance+totalFloatProfit)*100)>=30&&(forceLine/(totalBalance+totalFloatProfit)*100)<80?'middle-risk':'',
                        (forceLine/(totalBalance+totalFloatProfit)*100)>=80?'high-risk':'',
                    ]">
                        <span>{{totalBalance+totalFloatProfit==0?'0':(forceLine/(totalBalance+totalFloatProfit)*100).toFixed(2)}}%</span>
                    </span>
                </span>
            </span>
        </div>
        <span class="triangle-btn" v-show="rmbOrUsd!=3">
            <!-- <span class="triangle"></span> -->
            <span 
                :class="['switch-price',priceType==1||priceType==3?'switch-price-active':'']"
                @click="switchPriceType(1)"
            >
                ￥
            </span>
            <span 
                :class="['switch-price',priceType==2||priceType==3?'switch-price-active':'']"
                @click="switchPriceType(2)"
            >
                $
            </span>
        </span>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    data(){
        return{
            forceLine:0,//平仓线
            positionCashDeposit:0,//持仓保证金
            priceType:1,//1人民币 2美元 3both
        }
    },
    computed:{
        ...mapState([
            'rmbOrUsd',
            'rateList',
            'tradeType'
        ]),
        ...mapState('market',[
            'totalFloatProfit',
            'depositList',
        ]),
        ...mapState('vtrade',[
            'totalBalance',
            'todayCanUseBalance',
            'deposit',
            'tradeBascData',
            'positionList',
        ])
    },
    watch:{
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
    },
    methods:{
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
    }
}
</script>

<style lang="scss" scoped>
    .capital-info{
        height: 40px;
        width: 100%;
        background: $tabColor;
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
                    line-height: 16px;
                    .info-value-title{
                        white-space: nowrap;
                        color:$placeHolderColor;
                    }
                    .info-value{
                        color:$normalFontColor;
                    }
                    .low-risk{
                        color:#ffd500;
                    }
                    .middle-risk{
                        color:#ff6a00;
                    }
                    .high-risk{
                        color:#e62e4c;
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
</style>
