<template>
    <div class="stop-list">
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
        <div class="scroll-warp stop-scroll-warp">
            <div class="no-data" v-if="(typeIndex==1&&stopData1.length==0)||(typeIndex==2&&stopData2.length==0)">
                暂无数据
            </div>
            <table v-show="(typeIndex==1&&stopData1.length>0)||(typeIndex==2&&stopData2.length>0)" border="0" cellpadding="10" cellspacing="0">
                <thead>
                    <tr class="stop-title">
                        <th class="stop-title-item fix-title">名称</th>
                        <th class="stop-title-item fix-title">状态</th>
                        <th class="stop-title-item fix-title">多空</th>
                        <th class="stop-title-item fix-title">类别</th>
                        <th class="stop-title-item fix-title">手数</th>
                        <th class="stop-title-item fix-title">触发条件</th>
                        <th class="stop-title-item fix-title">委托价</th>
                        <th class="stop-title-item fix-title">有效期</th>
                        <th class="stop-title-item fix-title">下单时间</th>
                    </tr>
                </thead>
                <tbody v-show="typeIndex==1">
                    <tr :class="['stop-item',stopIndex==index?'stop-item-active':'']"
                        v-for="(item,index) in stopData1"
                        :key="index"
                        @click="selectQuota(item,index)"
                    >
                        <td>
                            {{item.CommodityName}}{{item.ContractNo}}
                        </td><td>
                            {{item.Status==0?'运行中':item.Status==1?'暂停':item.Status==2?'已触发':item.Status==3?'已取消':item.StatusMsg}}
                        </td><td>
                            {{item.HoldDirection==0?'多':'空'}}
                        </td><td>
                            {{item.StopLossTypeName}}
                        </td><td>
                            {{item.Num}}
                        </td><td>
                            达到{{item.StopLossPrice}}
                        </td><td>
						    市价
                        </td><td>
						    永久有效
                        </td><td>
						    {{item.InsertDateTime}}
                        </td>
                    </tr>
                </tbody>
                <tbody v-show="typeIndex==2">
                    <tr :class="['stop-item']"
                        v-for="(item,index) in stopData2"
                        :key="index"
                    >
                        <td>
                            {{item.CommodityName}}{{item.ContractNo}}
                        </td><td>
                            {{item.Status==0?'运行中':item.Status==1?'暂停':item.Status==2?'已触发':item.Status==3?'已取消':item.StatusMsg}}
                        </td><td>
                            {{item.HoldDirection==0?'多':'空'}}
                        </td><td>
                            {{item.StopLossTypeName}}
                        </td><td>
                            {{item.Num}}
                        </td><td>
                            达到{{item.StopLossPrice}}
                        </td><td>
						    市价
                        </td><td>
						    永久有效
                        </td><td>
						    {{item.InsertDateTime}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="layer-content confirm-layer" id="stop-tip-layer-content">
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
            stopIndex:-1, //持仓列表索引
            selectContractItem:{}, //选中的仓位合约
            typeIndex:1,//1未触发 2已触发
            stopData1:[], //未触发
            stopData2:[], //已触发
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
            'stopLossList'
        ]),
        ...mapState('market',[
            'selectContract',
            'selectLastData',
            'allSubsCommodity',
        ])
    },
    watch:{
        stopLossList:function(){
            this.stopChange();
        }
    },
    mounted(){
        this.stopChange();
        document.getElementsByClassName('stop-scroll-warp')[0].addEventListener('scroll',this.listenerScroll);
    },
    methods:{
        ...mapActions('trade',[
            'sendWS'
        ]),
        //止损止盈单变化
        stopChange(){
            var stopData1 = [];
            var stopData2 = [];
            for(var i=0;i<this.stopLossList.length;i++){
                if(this.stopLossList[i].Status==0||this.stopLossList[i].Status==1){
                    stopData1.push(this.stopLossList[i]);
                }else{
                    stopData2.push(this.stopLossList[i]);
                }
            }
            if(JSON.stringify(this.selectContractItem)!='{}'){
                var isDelete = true;
                for(var i=0;i<stopData1.length;i++){
                    if(this.selectContractItem.StopLossNo==stopData1[i].StopLossNo){
                        this.selectContractItem = stopData1[i];
                        isDelete = false;
                        break;
                    }
                }
                if(isDelete){
                    this.selectQuota(this.selectContractItem,this.stopIndex);
                }else{
                    if(document.getElementById('stop-btn1')){
                        if(this.selectContractItem.Status&&this.selectContractItem.Status==1){
                            document.getElementById('stop-btn1').innerText = '开启';
                        }else{
                            document.getElementById('stop-btn1').innerText = '暂停'
                        }
                    }
                }
            }
            this.stopData1 = stopData1.slice(0);
            this.stopData2 = stopData2.slice(0);
        },
        //监听滚动
        listenerScroll(e){
            var scrollTop = e.target.scrollTop;
            var scrollLeft = e.target.scrollLeft;
            var titleNode = document.getElementsByClassName('stop-title-item');
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
            var node = document.getElementsByClassName('stop-item')[index];
            if(this.stopIndex != index){
                if(document.getElementById('option-btn')){
                    document.getElementById('stop-btn1').removeEventListener('click',this.switchStatus)
                    document.getElementById('stop-btn2').removeEventListener('click',this.changeStop)
                    document.getElementById('stop-btn3').removeEventListener('click',this.delStop)
                    node.parentNode.removeChild(document.getElementById('option-btn'));
                }
                this.stopIndex = index;
                this.selectContractItem = item;
                this.$store.state.market.selectContract = this.allSubsCommodity[item.CommodityNo];
                this.$store.state.market.selectLastData = this.allSubsCommodity[item.CommodityNo].quatoData;
                var html = `
                    <tr>
                        <td colspan="9">
                            <div class="position-btn-warp">
                                <span class="position-btn" id="stop-btn1">${this.selectContractItem.Status&&this.selectContractItem.Status==1?'开启':this.selectContractItem.Status&&this.selectContractItem.Status==0?'暂停':'暂停'}</span>
                                <span class="position-btn" id="stop-btn2">修改</span>
                                <span class="position-btn" id="stop-btn3">删除</span>
                            </div>
                        </td>
                    </tr>
                `;
                var newNode = document.createElement('tr');
                newNode.innerHTML = html;
                newNode.id = 'option-btn';
                inserAfter(newNode,node);
                document.getElementById('stop-btn1').addEventListener('click',this.switchStatus)
                document.getElementById('stop-btn2').addEventListener('click',this.changeStop)
                document.getElementById('stop-btn3').addEventListener('click',this.delStop)
            }else{
                if(document.getElementById('option-btn')){
                    document.getElementById('stop-btn1').removeEventListener('click',this.switchStatus)
                    document.getElementById('stop-btn2').removeEventListener('click',this.changeStop)
                    document.getElementById('stop-btn3').removeEventListener('click',this.delStop)
                    node.parentNode.removeChild(document.getElementById('option-btn'));
                    this.stopIndex = -1;
                    this.selectContractItem = {};
                }else{
                    this.stopIndex = index;
                    this.selectContractItem = item;
                    this.$store.state.market.selectContract = this.allSubsCommodity[item.CommodityNo];
                    this.$store.state.market.selectLastData = this.allSubsCommodity[item.CommodityNo].quatoData;
                    var html = `
                        <tr>
                            <td colspan="9">
                                <div class="position-btn-warp">
                                    <span class="position-btn" id="stop-btn1">${item.Status&&item.Status==1?'开启':item.Status&&item.Status==0?'暂停':'暂停'}</span>
                                    <span class="position-btn" id="stop-btn2">修改</span>
                                    <span class="position-btn" id="stop-btn3">删除</span>
                                </div>
                            </td>
                        </tr>
                    `;
                    var newNode = document.createElement('tr');
                    newNode.innerHTML = html;
                    newNode.id = 'option-btn'
                    inserAfter(newNode,node);
                    document.getElementById('stop-btn1').addEventListener('click',this.switchStatus)
                    document.getElementById('stop-btn2').addEventListener('click',this.changeStop)
                    document.getElementById('stop-btn3').addEventListener('click',this.delStop)
                }
            }
        },
        //切换状态
        switchStatus(){
            var method = 'ModifyStopLoss'; //调用方法
            var params = {
                StopLossNo:this.selectContractItem.StopLossNo, //止损编号
                ModifyFlag:2,//0-修改 1-删除 2-暂停 3-启动
                Num:Number(this.selectContractItem.Num),//订单数量
                StopLossType:this.selectContractItem.StopLossType,//0-限价触发止损1-限价触发止盈2-浮动止损
                OrderType:1,//市价-1，对价-2 
                StopLossPrice:this.selectContractItem.StopLossPrice,//止损(赢)价
                StopLossDiff:this.selectContractItem.StopLossDiff,//动态止损的点差
            }; 
            if(this.selectContractItem.Status == 0){
                //暂停
                params.ModifyFlag = 2;
            }else if(this.selectContractItem.Status == 1){
                //开启
                params.ModifyFlag = 3;
            }
            this.sendWS({method,params});
        },
        //修改
        changeStop(){
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
			var method = 'ModifyStopLoss'; //调用方法
			var params = {
                StopLossNo:this.selectContractItem.StopLossNo, //止损编号
                ModifyFlag:0,
                Num:Number(this.$refs.stopLayer.handNum),
                StopLossType:this.$refs.stopLayer.tabType==2?1:this.$refs.stopLayer.priceType.value,
                OrderType:1,
                StopLossPrice:this.$refs.stopLayer.priceType.value==2?(this.selectContractItem.HoldDirection==0?Number(this.selectLastData[3]-this.$refs.stopLayer.floatPrice):Number(Number(this.selectLastData[3])+Number(this.$refs.stopLayer.floatPrice))):Number(this.$refs.stopLayer.price),
                StopLossDiff:Number(this.$refs.stopLayer.floatPrice)
			}
            this.sendWS({method,params});
        },
        //删除
        delStop(){
            this.$layer({
                headerText:'确认删除止损止盈单',
                isShowBg:true,
                contentText:'#stop-tip-layer-content',
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
                        var method = 'ModifyStopLoss'; //调用方法
                        var params = {
                            StopLossNo:this.selectContractItem.StopLossNo, //止损编号
                            ModifyFlag:1,//0-修改 1-删除 2-暂停 3-启动
                            Num:this.selectContractItem.Num,//订单数量
                            StopLossType:this.selectContractItem.StopLossType,//0-限价触发止损1-限价触发止盈2-浮动止损
                            OrderType:1,//市价-1，对价-2 
                            StopLossPrice:this.selectContractItem.StopLossPrice,//止损(赢)价
                            StopLossDiff:this.selectContractItem.StopLossDiff,//动态止损的点差
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
.stop-list{
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
        .stop-title{
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
    .stop-item{
        cursor: pointer;
        border-top: solid 1px $positionBorderColor;
    }
    .stop-item:last-child{
        border-bottom: solid 1px $positionBorderColor;
    }
    .stop-item:hover{
        background:$quotaChooseBgColor;
    }
    .stop-item-active{
        background:$quotaChooseBgColor;
    }
}
.stop-layer{
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
