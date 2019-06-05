<template>
    <div id="trade-rule" v-loading="isLoad">
        <div class="rule-item">
            <span class="rule-title">交易品种</span>
            <span class="rule-value">{{rule.contractName}}</span>
        </div>
        <div class="rule-item">
            <span class="rule-title">交易所</span>
            <span class="rule-value">{{rule.exchangeCode}}</span>
        </div>
        <div class="rule-item">
            <span class="rule-title">币种单位</span>
            <span class="rule-value">{{rule.currencyNo}}</span>
        </div>
        <div class="rule-item">
            <span class="rule-title">交易单位</span>
            <span class="rule-value">{{rule.contractSize}}{{rule.currencyName}}/点</span>
        </div>
        <div class="rule-item">
            <span class="rule-title">最小跳动</span>
            <span class="rule-value">{{rule.miniTikeSize}}</span>
        </div>
        <div class="rule-item">
            <span class="rule-title">买入交易时间</span>
            <span class="rule-value">
                <span v-for="(item,index) in rule.tradeTimeArray" :key="index">{{item.begin}}-{{item.end}}<span v-if="!item.today&&rule.tradeTimeArray.length==1">(次日)</span></span>
            </span>
        </div>
        <div class="rule-item">
            <span class="rule-title">卖出交易时间</span>
            <span class="rule-value">
                <span v-for="(item,index) in rule.tradeTimeArray" :key="index">{{item.begin}}-{{item.end}}<span v-if="!item.today&&rule.tradeTimeArray.length==1">(次日)</span></span>
            </span>
        </div>
        <div class="rule-item">
            <span class="rule-title">交易综合费用</span>
            <span class="rule-value">{{rule.fee}}{{rule.currencyName}}/手</span>
        </div>
        <div class="rule-item">
            <span class="rule-title">保证金</span>
            <span class="rule-value">{{rule.deposit}}{{rule.currencyName}}</span>
        </div>
    </div>    
</template>

<script>
import {mapState} from 'vuex'
export default {
    data(){
        return{
            rule:[],
            isLoad:false,
        }
    },
    computed:{
        ...mapState([
            'currentQuota',
            'api'
        ])
    },
    watch:{
        currentQuota:function(){
            this.getRule();
        }
    },
    mounted(){
        // this.getRule();
    },
    methods:{
        getRule(){
            this.isLoad = true;
			this.$http.post(this.api+'/contractDetails',{contractNo:this.currentQuota.commodity_no})
			.then(res=>{
				if(res.code == "010"){
					if(res.data.currencyNo == 'USD'){
						res.data.currencyName = '美元';
					}else if(res.data.currencyNo == 'HKD-HKFE'){
						res.data.currencyName = '港币';
					}else if(res.data.currencyNo == 'JPY'){
						res.data.currencyName = '日元';
					}else if(res.data.currencyNo == 'CNY'){
						res.data.currencyName = '人民币';
					}else if(res.data.currencyNo == 'EUR'){
						res.data.currencyName = '欧元';
					}
					var tradeTimeArray = [];
					var obj = res.data.tradingTime.split('，');
					for(var i=0;i<obj.length;i++){
						var obj2 = {
							begin:'',
							end:'',
							today:true,
						};
						obj2.begin = obj[i].split('-')[0];
						obj2.end = obj[i].split('-')[1];
						if(Number(obj2.begin.split(':')[0])>=Number(obj2.end.split(':')[0])){
							obj2.today = false;
						}
						tradeTimeArray.push(obj2);
					}
                    res.data.tradeTimeArray = tradeTimeArray;
                    this.isLoad = false;
                    this.rule = res.data;
				}else{
					layer.msg(res.message,{
						time:1500
					})
				}
			}).catch(err=>{
				
			})
        }
    }
}
</script>

<style lang="scss" scoped>
#trade-rule{
    width: 100%;
    height: 100%;
    overflow: auto;
    color: $placeHolderColor;
    display: flex;
    flex-direction: column;
    .rule-item{
        flex: 1;
        width: 100%;
        min-height: 30px;
        border-bottom: solid 1px $positionBorderColor;
        display: flex;
        .rule-title{
            width: 120px;
            border-right: solid 1px $positionBorderColor;
            display: flex;
            align-items: center;
            height: 100%;
            padding-left: 10px;
        }
        .rule-value{
            width: calc(100% - 120px);
            display: flex;
            align-items: center;
            height: 100%;
            padding-left: 10px;
        }
    }
}
</style>
