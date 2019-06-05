<template>
    <div id="rate">
        <div class="rate-switch">
            <span class="rate-title">
                当前币种汇率标准
            </span>
            <span class="rate-btn">
                <span 
                    :class="['rate-btn-item',rateType==1?'rate-btn-item-active':'']"
                    @click="switchType(1)"
                >
                    美元基准
                </span>
                <span 
                    :class="['rate-btn-item',rateType==2?'rate-btn-item-active':'']"
                    @click="switchType(2)"
                >
                    人民币基准
                </span>
            </span>
        </div>
        <div class="rate-input">
            <span class="rate-input-title">
                金额:
            </span>
            <span class="rate-input-warp">
                <input type="number" placeholder="请输入金额" @input="changePrice" v-model="price"/>
            </span>
        </div>
        <div class="rate-result">
            <div class="rate-item">
                <span>币种</span>
                <span>金额</span>
            </div>
        </div>
        <div class="rate-result-warp">
            <div class="rate-item" v-for="(item,index) in rateTable" :key="index">
                <span>{{item.name}}</span>
                <span>{{item.value}}:{{item.currency}}</span>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    data(){
        return{
            rateType:1, //1美元 2人民币
            rateTable:[],
            price:100,
        }
    },
    computed:{
        ...mapState([
            'rateList',
            'currentQuota'
        ])
    },
    watch:{
        rateList:function(){
            if(this.rateList.CNY.currencyName){
                this.handleRate();
            }
        }
    },
    mounted(){
        this.handleRate();
    },
    methods:{
		//计算汇率表格
		handleRate(){
			this.rateTable = [];
			if(this.price == ''){
				var price = 0;
			}else{
				var price = this.price;
			}
			for(var i in this.rateList){
				var obj = {
					name:'',
					value:''
				}
				obj.name = this.rateList[i].currencyName;
				obj.currency = this.rateList[i].currencyNo;
				obj.dotSize = this.rateList[i].exchangeRate.toString().split('.')[1]?this.rateList[i].exchangeRate.toString().split('.')[1].length:0;
				if(this.rateType == 1){
					//输入美元
					obj.value = (price/this.rateList[i].exchangeRate).toFixed(obj.dotSize);
				}else if(this.rateType == 2){
					//输入人民币
					obj.value = (price*this.rateList.CNY.exchangeRate/this.rateList[i].exchangeRate).toFixed(obj.dotSize);
                }
                this.rateTable.push(obj);
			}
        },
        changePrice(){
            this.handleRate();
        },
		//切换基准
		switchType(index){
			this.rateType = index;
			this.handleRate();
		},
    }
}
</script>

<style lang="scss" scoped>
#rate{
    width: 100%;
    height: 100%;
    color: $placeHolderColor;
    .rate-switch{
        height: 50px;
        display: flex;
        align-items: center;
        padding: 0 10px;
        .rate-title{
            white-space: nowrap;
            margin-right: 30px;
        }
        .rate-btn{
            height: 100%;
            white-space: nowrap;
            display: flex;
            align-items: center;
            .rate-btn-item{
                cursor: pointer;
                margin-right: 30px;
            }
            .rate-btn-item-active{
                color:$activeTabColor;
            }
        }
    }
    .rate-input{
        width: 100%;
        height: 30px;
        background: $tabColor;
        display: flex;
        align-items: center;
        .rate-input-title{
            width: 50px;
        }
        .rate-input-warp{
            width: calc(100% - 50px);
            input{
                width: 100%;
                height: 100%;
                color: $normalFontColor;
            }
            input::placeholder{
                color: $normalFontColor;
            }
        }
    }
    .rate-result{
        height: 30px;
    }
    .rate-result-warp{
        height: calc(100% - 120px);
        overflow: auto;
        display: flex;
        flex-direction: column;
    }
    .rate-item{
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 30px;
        border-bottom: solid 1px $positionBorderColor;
        span{
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            flex: 1;
        }
        span:last-child{
            border-left: solid 1px $positionBorderColor;
        }
    }
}
</style>
