<template>
    <div class="condition-list">
        <div class="type-btn">
            <span 
                :class="['type-btn-item',typeIndex==1?'type-btn-item-active':'']"
                @click="switchType(1)"
            >
                未触发列表
            </span>
            <span 
                :class="['type-btn-item',typeIndex==2?'type-btn-item-active':'']"
                @click="switchType(2)"
            >
                已触发列表
            </span>
        </div>
        <div class="scroll-warp condition-scroll-warp">
            <div class="no-data" v-if="(typeIndex==1&&conditionData1.length==0)||(typeIndex==2&&conditionData2.length==0)">
                暂无数据
            </div>
            <table v-show="(typeIndex==1&&conditionData1.length>0)||(typeIndex==2&&conditionData2.length>0)" border="0" cellpadding="10" cellspacing="0">
                <thead>
                    <tr class="condition-title">
                        <th class="condition-title-item fix-title">名称</th>
                        <th class="condition-title-item fix-title">状态</th>
                        <th class="condition-title-item fix-title">多空</th>
                        <th class="condition-title-item fix-title">类别</th>
                        <th class="condition-title-item fix-title">手数</th>
                        <th class="condition-title-item fix-title">触发条件</th>
                        <th class="condition-title-item fix-title">委托价</th>
                        <th class="condition-title-item fix-title">有效期</th>
                        <th class="condition-title-item fix-title">下单时间</th>
                    </tr>
                </thead>
                <tbody v-show="typeIndex==1">
                    <tr :class="['condition-item',conditionIndex==index?'condition-item-active':'']"
                        v-for="(item,index) in conditionData1"
                        :key="index"
                        @click="selectQuota(item,index)"
                    >
                        <td>
                            {{item.CommodityName}}{{item.ContractNo}}
                        </td><td>
                            {{item.Status==0?'运行中':item.Status==1?'暂停':item.Status==2?'已触发':item.Status==3?'已取消':item.StatusMsg}}
                        </td><td>
                            {{item.Direction==0?'多':'空'}}
                        </td><td>
                            {{item.ConditionType==0?'价格条件':'时间条件'}}
                        </td><td>
                            {{item.Num}}
                        </td><td>
                            {{item.ConditionType==0?item.CompareType==0?'&gt'+item.PriceTriggerPonit:item.CompareType==1?'&lt'+item.PriceTriggerPonit:item.CompareType==2?'&gt='+item.PriceTriggerPonit:item.CompareType==3?'&lt='+item.PriceTriggerPonit:'-':item.TimeTriggerPoint.split(' ')[1]}}
                            <span v-if="item.AdditionFlag">;{{item.ConditionType==0?item.AdditionType==0?'&gt':item.AdditionType==1?'&lt':item.AdditionType==2?'&gt=':item.AdditionType==3?'&lt=':'-':'='}}{{item.AdditionPrice}}</span>
                        </td><td>
						    {{item.PriceTriggerPonit}}
                        </td><td>
						    永久有效
                        </td><td>
						    {{item.InsertDateTime}}
                        </td>
                    </tr>
                </tbody>
                <tbody v-show="typeIndex==2">
                    <tr :class="['condition-item']"
                        v-for="(item,index) in conditionData2"
                        :key="index"
                    >
                        <td>
                            {{item.CommodityName}}{{item.ContractNo}}
                        </td><td>
                            {{item.Status==0?'运行中':item.Status==1?'暂停':item.Status==2?'已触发':item.Status==3?'已取消':item.StatusMsg}}
                        </td><td>
                            {{item.Direction==0?'多':'空'}}
                        </td><td>
                            {{item.ConditionType==0?'价格条件':'时间条件'}}
                        </td><td>
                            {{item.Num}}
                        </td><td>
                            {{item.ConditionType==0?item.CompareType==0?'&gt'+item.PriceTriggerPonit:item.CompareType==1?'&lt'+item.PriceTriggerPonit:item.CompareType==2?'&gt='+item.PriceTriggerPonit:item.CompareType==3?'&lt='+item.PriceTriggerPonit:'-':item.TimeTriggerPoint.split(' ')[1]}}
                            <span v-if="item.AdditionFlag">;{{item.ConditionType==0?item.AdditionType==0?'&gt':item.AdditionType==1?'&lt':item.AdditionType==2?'&gt=':item.AdditionType==3?'&lt=':'-':'='}}{{item.AdditionPrice}}</span>
                        </td><td>
						    {{item.PriceTriggerPonit}}
                        </td><td>
						    永久有效
                        </td><td>
						    {{item.InsertDateTime}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="layer-content confirm-layer" id="condition-tip-layer-content">
             <div class="confirm-item">
                 <span class="confirm-item">名称:</span>
                 <span>{{selectContractItem.CommodityName}}</span>
             </div>
             <div class="confirm-item">
                 <span class="confirm-item">代码:</span>
                 <span>{{selectContractItem.CommodityNo}}{{selectContractItem.ContractNo}}</span>
             </div>
        </div>
        <div class="layer-content condition-layer" id="condition-layer-content">
            <condition-layer ref="conditionLayer"
                :tabIndex=1
                :selectContractItem="selectContractItem"
            ></condition-layer>
        </div>
    </div>
</template>

<script>
import {mapState,mapActions} from 'vuex'
import {inserAfter,removeAfter} from '@/util/index'
import conditionLayer from './conditionLayer.vue'
export default {
    components:{
        conditionLayer
    },
    data(){
        return{
            conditionIndex:-1, //持仓列表索引
            selectContractItem:{}, //选中的仓位合约
            typeIndex:1,//1未触发 2已触发
            conditionData1:[], //未触发
            conditionData2:[], //已触发
        }
    },
    computed:{
        ...mapState([
            'rmbOrUsd',
            'rateList',
            'isSendData',
            'canCloseLayer'
        ]),
        ...mapState('trade',[
            'conditionList'
        ]),
        ...mapState('market',[
            'selectContract',
            'selectLastData',
            'allSubsCommodity',
        ])
    },
    watch:{
        conditionList:function(){
            this.conditionChange();
        }
    },
    mounted(){
        this.conditionChange();
        document.getElementsByClassName('condition-scroll-warp')[0].addEventListener('scroll',this.listenerScroll);
    },
    methods:{
        ...mapActions('trade',[
            'sendWS'
        ]),
        //止损止盈单变化
        conditionChange(){
            var conditionData1 = [];
            var conditionData2 = [];
            for(var i=0;i<this.conditionList.length;i++){
                if(this.conditionList[i].Status==0||this.conditionList[i].Status==1){
                    conditionData1.push(this.conditionList[i]);
                }else{
                    conditionData2.push(this.conditionList[i]);
                }
            }
            if(JSON.stringify(this.selectContractItem)!='{}'){
                var isDelete = true;
                for(var i=0;i<conditionData1.length;i++){
                    if(this.selectContractItem.ConditionNo==conditionData1[i].ConditionNo){
                        this.selectContractItem = conditionData1[i];
                        isDelete = false;
                        break;
                    }
                }
                if(isDelete){
                    this.selectQuota(this.selectContractItem,this.conditionIndex);
                }else{
                    if(document.getElementById('condition-btn1')){
                        if(this.selectContractItem.Status&&this.selectContractItem.Status==1){
                            document.getElementById('condition-btn1').innerText = '开启';
                        }else{
                            document.getElementById('condition-btn1').innerText = '暂停'
                        }
                    }
                }
            }
            this.conditionData1 = conditionData1.slice(0);
            this.conditionData2 = conditionData2.slice(0);
        },
        //监听滚动
        listenerScroll(e){
            var scrollTop = e.target.scrollTop;
            var scrollLeft = e.target.scrollLeft;
            var titleNode = document.getElementsByClassName('condition-title-item');
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
        switchType(index){
            if(this.typeIndex != index){
                this.typeIndex = index;
            }
        },
        //选中行情
        selectQuota(item,index){
            if(item.Status==2){
                return
            }
            var node = document.getElementsByClassName('condition-item')[index];
            if(this.conditionIndex != index){
                if(document.getElementById('option-btn')){
                    document.getElementById('condition-btn1').removeEventListener('click',this.switchStatus)
                    document.getElementById('condition-btn2').removeEventListener('click',this.changecondition)
                    document.getElementById('condition-btn3').removeEventListener('click',this.delcondition)
                    node.parentNode.removeChild(document.getElementById('option-btn'));
                }
                this.conditionIndex = index;
                this.selectContractItem = item;
                this.$store.state.market.selectContract = this.allSubsCommodity[item.CommodityNo];
                this.$store.state.market.selectLastData = this.allSubsCommodity[item.CommodityNo].quatoData;
                var html = `
                    <tr>
                        <td colspan="9">
                            <div class="position-btn-warp">
                                <span class="position-btn" id="condition-btn1">${item.Status&&item.Status==1?'开启':item.Status&&item.Status==0?'暂停':'暂停'}</span>
                                <span class="position-btn" id="condition-btn2">修改</span>
                                <span class="position-btn" id="condition-btn3">删除</span>
                            </div>
                        </td>
                    </tr>
                `;
                var newNode = document.createElement('tr');
                newNode.innerHTML = html;
                newNode.id = 'option-btn';
                inserAfter(newNode,node);
                document.getElementById('condition-btn1').addEventListener('click',this.switchStatus)
                document.getElementById('condition-btn2').addEventListener('click',this.changecondition)
                document.getElementById('condition-btn3').addEventListener('click',this.delcondition)
            }else{
                if(document.getElementById('option-btn')){
                    document.getElementById('condition-btn1').removeEventListener('click',this.switchStatus)
                    document.getElementById('condition-btn2').removeEventListener('click',this.changecondition)
                    document.getElementById('condition-btn3').removeEventListener('click',this.delcondition)
                    node.parentNode.removeChild(document.getElementById('option-btn'));
                    this.conditionIndex = -1;
                    this.selectContractItem = {};
                }else{
                    this.conditionIndex = index;
                    this.selectContractItem = item;
                    this.$store.state.market.selectContract = this.allSubsCommodity[item.CommodityNo];
                    this.$store.state.market.selectLastData = this.allSubsCommodity[item.CommodityNo].quatoData;
                    var html = `
                        <tr>
                            <td colspan="9">
                                <div class="position-btn-warp">
                                    <span class="position-btn" id="condition-btn1">${item.Status&&item.Status==1?'开启':item.Status&&item.Status==0?'暂停':'暂停'}</span>
                                    <span class="position-btn" id="condition-btn2">修改</span>
                                    <span class="position-btn" id="condition-btn3">删除</span>
                                </div>
                            </td>
                        </tr>
                    `;
                    var newNode = document.createElement('tr');
                    newNode.innerHTML = html;
                    newNode.id = 'option-btn'
                    inserAfter(newNode,node);
                    document.getElementById('condition-btn1').addEventListener('click',this.switchStatus)
                    document.getElementById('condition-btn2').addEventListener('click',this.changecondition)
                    document.getElementById('condition-btn3').addEventListener('click',this.delcondition)
                }
            }
        },
        //切换状态
        switchStatus(){
            console.log('切换')
            var method = 'ModifyCondition'; //调用方法
            var params = {
                ConditionNo:this.selectContractItem.ConditionNo, //条件单编号
                ModifyFlag:2,//操作类型 0-修改 1-删除 2-暂停 3-启动
            };
            if(this.selectContractItem.Status == 0){
                //暂停
                params.ModifyFlag = 2;
            }else if(this.selectContractItem.Status == 1){
                //开启
                params.ModifyFlag = 3;
            }
            this.sendWS({method,params})
        },
        //修改
        changecondition(){
            console.log('修改')
            this.$layer({
                headerText:'',
                isShowBg:true,
                contentText:'#condition-layer-content',
                isShowCloseBtn:false,
                btn:[{
                    text:'取消',
                    method:'关闭',
                },{
                    text:'确认',
                    method:this.changeConfirm,
                    active:true,
                }]
            })
        },
        //修改确认
        changeConfirm(){
            if(this.isSendData){
                return;
            }
            this.$store.state.canCloseLayer = false;
            this.$store.state.isSendData = true;
            var method = 'ModifyCondition'; //调用方法
            var params = {
                ConditionNo:this.selectContractItem.ConditionNo, //条件单编号
                ModifyFlag:0,//操作类型
                Num:Number(this.$refs.conditionLayer.handNum),//订单数量
                ConditionType:this.$refs.conditionLayer.typeIndex,//条件单类型
                PriceTriggerPonit:Number(this.$refs.conditionLayer.triggerPrice),//条件单价格
                CompareType:this.$refs.conditionLayer.triggerType,//价格触发方式
                TimeTriggerPoint:this.$refs.conditionLayer.triggerTime.replace(/\//g,'-'),//时间触发
                OrderType:1,
                Direction:this.$refs.conditionLayer.direction,
                AdditionFlag:this.$refs.conditionLayer.additionType!=-1?true:false,
                AdditionType:this.$refs.conditionLayer.additionType!=-1?this.$refs.conditionLayer.additionType:0,
                AdditionPrice:Number(this.$refs.conditionLayer.additionPrice),
            };
            this.sendWS({method,params})
            
        },
        //删除
        delcondition(){
            this.$layer({
                headerText:'确认删除条件单',
                isShowBg:true,
                contentText:'#condition-tip-layer-content',
                isShowCloseBtn:false,
                btn:[{
                    text:'取消',
                    method:'关闭',
                },{
                    text:'确认',
                    method:()=>{
                        if(this.isSendData){
                            return;
                        }
                        this.$store.state.canCloseLayer = false;
                        this.$store.state.isSendData = true;
                        var method = 'ModifyCondition'; //调用方法
                        var params = {
                            ConditionNo:this.selectContractItem.ConditionNo, //止损编号
                            ModifyFlag:1,//0-修改 1-删除 2-暂停 3-启动
                        }; 
                        this.sendWS({method,params});
                    },
                    active:true,
                }]
            })
        },
    }
}
</script>

<style lang="scss" scoped>
.condition-list{
    height:100%;
    .type-btn{
        height: 50px;
        display: flex;
        align-items: center;
        border-bottom: solid 1px $positionBorderColor;
        padding: 0 10px;
        .type-btn-item{
            cursor: pointer;
            margin-right: 10px;
        }
        .type-btn-item-active{
            color:$activeTabColor!important;
        }
    }
    .scroll-warp{
        height: calc(100% - 50px);
        overflow: auto;
        position: relative;
    }
}
table{
    min-width: 100%;
    border-collapse: collapse;
    thead{
        .condition-title{
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
    .condition-item{
        cursor: pointer;
        border-top: solid 1px $positionBorderColor;
    }
    .condition-item:last-child{
        border-bottom: solid 1px $positionBorderColor;
    }
    .condition-item:hover{
        background:$quotaChooseBgColor;
    }
    .condition-item-active{
        background:$quotaChooseBgColor;
    }
}
.condition-layer{
    width: 400px;
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
