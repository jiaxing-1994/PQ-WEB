<template>
    <div id="stop-layer">
        <div class="switch-tab">
            <span 
                :class="['tab-item',tabType==1?'tab-item-active':'']"
                @click="switchTab(1)"
            >止损</span>
            <span 
                :class="['tab-item',tabType==2?'tab-item-active':'']"
                @click="switchTab(2)"
            >止盈</span>
        </div>
        <div class="stop-layer-content">
            <div v-show="tabType==1" class="stop-layer-a">
                <div class="content-item">
                    <span class="item-title">
                        合约
                    </span>
                    <span class="item-span layer-center">
                        {{selectContract.commodity_name}}
                    </span>
                    <span class="item-title no-left-border">
                        {{selectContractItem.Direction==0?'多头':'空头'}}
                    </span>
                    <span class="item-span layer-left">
                        <span>最新:</span>{{selectLastData[3]}}
                    </span>
                </div>
                <div class="content-item">
                    <span class="item-title">
                        方式
                    </span>
                    <span class="item-span layer-left">
                        <span class="item-box">
                            <type-select
                                :options="typeOption"
                                @change="typeChange"
                                :defaultOption="defaultPriceType"
                                :styleType=2
                            ></type-select>
                        </span>
                        <span class="item-box">
                            <input v-show="priceType.value==0" type="number" class="price-input" v-model="price"/>
                            <input v-show="priceType.value==2" type="number" class="price-input" v-model="floatPrice"/>
                        </span>
                        <span class="item-box">
                            {{(selectContractItem.Direction==0?(price-selectLastData[3]):(selectLastData[3]-price)/selectLastData[3]*100).toFixed(2)}}%
                        </span>
                    </span>
                </div>
                <div class="content-item">
                    <span class="item-title">
                        手数
                    </span>
                    <span class="layer-center hand-input">
                        <input type="number" v-model="handNum"/>
                    </span>
                    <span class="item-title no-left-border lang-title">
                        止损委托价
                    </span>
                    <span class="item-span layer-left lang-select">
                        <!-- <type-select
                            :options="priceOption"
                            @change="priceTypeChange"
                            :styleType=2
                            :defaultOption="defaultCommitType"
                        ></type-select> -->
                        市价
                    </span>
                </div>
            </div>
            <div v-show="tabType==2" class="stop-layer-b">
                <div class="content-item">
                    <span class="item-title">
                        合约
                    </span>
                    <span class="item-span layer-center">
                        {{selectContract.commodity_name}}
                    </span>
                    <span class="item-title no-left-border">
                        {{selectContractItem.Direction==0?'多头':'空头'}}
                    </span>
                    <span class="item-span layer-left">
                        <span>最新:</span>{{selectLastData[3]}}
                    </span>
                </div>
                <div class="content-item">
                    <span class="item-title">
                        止盈价
                    </span>
                    <span class="item-span layer-left">
                        <span class="item-box">
                            <input type="number" class="price-input" v-model="price"/>
                        </span>
                        <span class="item-box">
                            {{(selectContractItem.Direction==1?(price-selectLastData[3]):(selectLastData[3]-price)/selectLastData[3]*100).toFixed(2)}}%
                        </span>
                    </span>
                </div>
                <div class="content-item">
                    <span class="item-title">
                        手数
                    </span>
                    <span class="layer-center hand-input">
                        <input type="number" v-model="handNum"/>
                    </span>
                    <span class="item-title no-left-border lang-title">
                        止损委托价
                    </span>
                    <span class="item-span layer-left lang-select">
                        <!-- <type-select
                            :options="priceOption"
                            @change="priceTypeChange"
                            :styleType=2
                            :defaultOption="defaultCommitType"
                        ></type-select> -->
                        市价
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import typeSelect from '@/components/common/select.vue'
export default {
    components:{
        typeSelect
    },
    props:{
        tabIndex:{
            type:Number,
            default:1
        },
        selectContractItem:{
            type:Object
        }
    },
    data(){
        return{
            typeOption:[{
                name:'止损价',
                value:0,
            },{
                name:'浮动止损',
                value:2,
            }],
            priceOption:[{
                name:'市价'
            },{
                name:'限价'
            },{
                name:'对手价'
            }],
            tabType:1,
            price:'', //止损止盈价格
            priceType:{},
            defaultPriceType:{
                name:'止损价',
                value:0,
            },
            floatPrice:10, //浮动止损
            handNum:1, //手数
            commitType:{},
            defaultCommitType:{
                name:'市价'
            }
        }
    },
    computed:{
        ...mapState('market',[
            'selectLastData',
            'selectContract'
        ])
    },
    watch:{
        selectContract:function(){
            if(this.selectContract.commodity_no){
                this.tabType = 1;
                this.price = this.selectContractItem.HoldAvgPrice;
                this.priceType = this.typeOption[0];
                this.floatPrice = 10;
                this.handNum = 1;
                this.commitType = this.priceOption[0];
            }
        }
    },
    mounted(){
        this.tabType = 1;
        this.price = this.selectContractItem.HoldAvgPrice;
        this.priceType = this.typeOption[0];
        this.floatPrice = 10;
        this.handNum = 1;
        this.commitType = this.priceOption[0];
    },
    methods:{
        switchTab(index){
            this.tabType = index;
        },
        typeChange(item){
            this.priceType = item;
        },
    }
}
</script>

<style lang="scss" scoped>
#stop-layer{
    width: 100%;
    background: $layerBgColor;
    color: $layerFontColor;
    font-size: 14px;
    .switch-tab{
        display: flex;
        align-items: center;
        height: 50px;
        font-size: 16px;
        .tab-item{
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #333;
            border-bottom: solid 2px $layerBorderColor;
            height: 100%;
            cursor: pointer;
        }
        .tab-item-active{
            color: $layerActiveColor;
            border-bottom-color: $layerActiveColor;
        }
    }
    .stop-layer-content{
        width: 100%;
        .content-item{
            height: 50px;
            display: flex;
            .item-title{
                width: 60px;
                display: flex;
                justify-content: center;
                align-items: center;
                color:$layerTitleColor;
                border-bottom: solid 1px $layerBorderColor;
                border-right: solid 1px $layerBorderColor;
                border-left: solid 1px $layerBorderColor;
            }
            .item-span{
                flex:1;
                border-bottom: solid 1px $layerBorderColor;
                .item-box{
                    height: 30px;
                    width: 90px;
                    margin-right: 10px;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    .price-input{
                        background: #f2f3f4;
                        height: 100%;
                        width: 100%;
                        padding-left: 10px;
                        box-sizing: border-box;
                    }
                }
            }
            .hand-input{
                width: 110px;
                padding: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                box-sizing: border-box;
                border-bottom: solid 1px $layerBorderColor;
                input{
                    background: #f2f3f4;
                    flex: 1;
                    height: 100%;
                    width: 100%;
                    padding-left: 10px;
                }
            }
            .lang-title{
                width: 90px;
            }
            .lang-select{
                padding: 10px;
                padding-right: 50px;
                box-sizing: border-box;
            }
        }
        .layer-center{
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .layer-left{
            display: flex;
            justify-content: left;
            align-items: center;
            padding-left: 10px;
        }
        .no-left-border{
            border-left: none;
        }
    }
}
</style>
