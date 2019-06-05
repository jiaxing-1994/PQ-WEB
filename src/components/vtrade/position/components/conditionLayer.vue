<template>
    <div id="condition-layer">
        <div class="switch-tab">
            <span 
                :class="['tab-item',typeIndex==0?'tab-item-active':'']"
                @click="switchTab(0)"
            >止损</span>
            <span 
                :class="['tab-item',typeIndex==1?'tab-item-active':'']"
                @click="switchTab(1)"
            >止盈</span>
        </div>
        <div class="condition-layer-content">
            <div class="content-item">
                <span class="item-title">
                    合约
                </span>
                <span class="item-span layer-center">
                    {{selectContract.commodity_name}}
                </span>
                <span class="item-span layer-left">
                    <span>最新:</span>{{selectLastData[3]}}
                </span>
            </div>
            <div class="content-item">
                <span class="item-title">
                    {{typeIndex==0?'价格':'时间'}}
                </span>
                <span class="item-span layer-left">
                    <span class="item-box" v-show="typeIndex==0">
                        <type-select
                            :options="conditionOptions"
                            @change="conditionChange"
                            :defaultOption="defaultConditionOption"
                            :styleType=2
                        ></type-select>
                    </span>
                    <span class="item-box" v-show="typeIndex==0">
                        <input @input="PriceChange" @blur="inputBlur" type="number" class="price-input" v-model="triggerPrice"/>
                    </span>
                    <span class="item-box" v-show="typeIndex==1">
                        <input id="trigger-time" @input="timeChange" type="text" class="price-input" v-model="showTime"/>
                    </span>
                    <span class="item-box">
                        <type-select
                            :options="additionOptions"
                            @change="additionChange"
                            :defaultOption="defaultAdditionOption"
                            :styleType=2
                        ></type-select>
                    </span>
                    <span class="item-box">
                        <input @input="additionPriceChange" :readonly="additionType==-1" type="number" class="price-input" v-model="additionPrice"/>
                    </span>
                </span>
            </div>
            <div class="content-item">
                <span class="item-title">
                    操作
                </span>
                <span class="item-span layer-left">
                    <span class="item-box">
                        <type-select
                            :options="directionOptions"
                            @change="directionChange"
                            :defaultOption="defaultDirectionOption"
                            :styleType=2
                        ></type-select>
                    </span>
                    <span class="item-box">
                        <type-select
                            :options="priceTypeOptions"
                            @change="priceTypeChange"
                            :defaultOption="defaultPriceTypeOption"
                            :styleType=2
                        ></type-select>
                    </span>
                </span>
            </div>
            <div class="content-item">
                <span class="item-title">
                    手数
                </span>
                <span class="item-span layer-left">
                    <span class="item-box">
                        <input @input="handNumChange" @blur="inputBlur" type="number" class="price-input" v-model="handNum"/>
                    </span>
                </span>
            </div>
            <div class="content-item">
                <span class="item-title">
                    有效
                </span>
                <span class="item-span layer-left">
                    <span>当日有效</span>
                </span>
            </div>
        </div>
    </div>    
</template>

<script>
import {mapState} from 'vuex';
import typeSelect from '@/components/common/select.vue'
import {getFormalDate} from '@/util/index.js'
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
            additionOptions:[{
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
            priceTypeOptions:[{
                name:'市价',
                value:1
            },{
                name:'对手价',
                value:2
            }],
            directionOptions:[{
                name:'买',
                value:0
            },{
                name:'卖',
                value:1
            }],
            //默认价格条件
            defaultConditionOption:{
                name:'>',
                value:0
            },
            //默认附加价格条件
            defaultAdditionOption:{
                name:'附加',
                value:-1
            },
            //默认价格类型
            defaultPriceTypeOption:{
                name:'市价',
                value:1
            },
            //默认买卖方向
            defaultDirectionOption:{
                name:'买',
                value:0
            },
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
            direction:0,//买卖方向
            handNum:1,//委托数量
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
                this.initData();
            }
        }
    },
    mounted(){
        var nowDate = getFormalDate(new Date(),'hh:mm:ss');
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
        this.initData;
    },
    methods:{
        initData(){
            this.showTime = getFormalDate(new Date().getTime()+3600000,'hh:mm:ss');
            this.preShowTime = this.showTime;
            this.triggerTime = getFormalDate(new Date().getTime()+3600000,'yyyy/mm/dd hh:mm:ss');            
            this.typeIndex = 0;
            //默认价格条件
            this.defaultConditionOption={
                name:'>',
                value:0
            };
            //默认附加价格条件
            this.defaultAdditionOption={
                name:'附加',
                value:-1
            };
            //默认价格类型
            this.defaultPriceTypeOption={
                name:'市价',
                value:1
            };
            //默认买卖方向
            this.defaultDirectionOption={
                name:'买',
                value:0
            };
            this.handNum = 1;
            this.triggerPrice = this.selectLastData[3];
            this.preTriggerPrice = this.selectLastData[3];
            this.additionPrice = '';
            this.preAdditionPrice = '';
        },
        switchTab(index){
            if(this.typeIndex != index){
                this.typeIndex = index
            }
        },
        //价格条件条件改变
        conditionChange(item){
            this.triggerType = item.value;
        },
        //附加条件条件改变
        additionChange(item){
            this.additionType = item.value;
            if(item.name == '附加'){
                this.additionPrice = '';
            }else if(this.additionPrice==''){
                this.additionPrice = this.selectLastData[3];
            }
        },
        //买卖方向改变
        directionChange(item){
            this.direction = item.value;
        },
        //价格类型改变
        priceTypeChange(item){
            this.priceType = item.value;
        },
        //价格变化
        PriceChange(){
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
        //input失去焦点
        inputBlur(){
            if(this.triggerPrice == ''){
                this.triggerPrice = this.selectContract.quatoData[3];
            }
            if(this.handNum == ''){
                this.handNum = 1;
            }
        },
        //时间条件选择时间
        timeChange(){
            this.showTime = this.preShowTime;
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
    }
}
</script>

<style lang="scss" scoped>
#condition-layer{
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
    .condition-layer-content{
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
                    width: 70px;
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
