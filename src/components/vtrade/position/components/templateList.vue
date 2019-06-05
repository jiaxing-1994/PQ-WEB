<template>
    <div class="template-list">
        <div class="no-data" v-if="Object.keys(templateList).length==0">
            暂无数据
        </div>
        <div class="scroll-warp template-scroll-warp" v-show="Object.keys(templateList).length>0">
            <table border="0" cellpadding="10" cellspacing="0">
                <thead>
                    <tr class="template-title">
                        <th class="template-title-item fix-title">名称</th>
                        <th class="template-title-item fix-title">买卖</th>
                        <th class="template-title-item fix-title">委托价</th>
                        <th class="template-title-item fix-title">委托量</th>
                        <th class="template-title-item fix-title">挂单量</th>
                        <th class="template-title-item fix-title">挂单时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :class="['template-item',templateIndex==index?'template-item-active':'']"
                        v-for="(item,index) in templateList"
                        :key="index"
                        @click="selectQuota(item,index)"
                    >
                        <td>
                            {{item.CommodityName}}
                        </td><td>
                            {{item.Direction==0?'多':'空'}}
                        </td><td>
                            {{item.OrderPrice}}
                        </td><td>
                            {{item.OrderNum}}
                        </td><td>
                            {{item.OrderNum}}
                        </td><td>
						    {{item.InsertDateTime}}
                        </td>
                    </tr>
                    <tr class="position-item-all">
                        <td>
                            合计({{Object.keys(templateList).length}})
                        </td><td>
                        </td><td>
                        </td><td>
                            {{totalTemplateNum}}
                        </td><td>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="btn-warp" v-if="Object.keys(templateList).length>0">
            <span class="all-btn" @click="cancelOrderAll">
                全部撤单
            </span>
            <span class="award-btn">
                <!-- 领取100元现金红包 -->
            </span>
        </div>
        <div class="layer-content cancel-layer" id="cancal-layer-content">
             <div class="cancel-item">
                 <span class="cancel-item">名称:</span>
                 <span>{{selectContractItem.CommodityName}}</span>
             </div>
             <div class="cancel-item">
                 <span class="cancel-item">代码:</span>
                 <span>{{selectContractItem.CommodityNo}}{{selectContractItem.ContractNo}}</span>
             </div>
        </div>
        <div class="layer-content change-layer" id="change-layer-content">
            <div class="change-input-item">
                <span class="change-title">委托价格</span>
                <span class="change-input">
                    <input type="number" v-model="changePrice" />
                </span>
            </div>
            <div class="change-input-item">
                <span class="change-title">委托数量</span>
                <span class="change-input">
                    <input type="number" v-model="changeNum" />
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState,mapActions} from 'vuex'
import {inserAfter,removeAfter} from '@/util/index'
export default {
    data(){
        return{
            templateIndex:-1, //持仓列表索引
            selectContractItem:{}, //选中的仓位合约
            totalTemplateNum:0,//总挂单手数
            changePrice:0,
            changeNum:0,
        }
    },
    computed:{
        ...mapState([
            'rmbOrUsd',
            'rateList',
            'isSendData'
        ]),
        ...mapState('market',[
            'allSubsCommodity'
        ]),
        ...mapState('vtrade',[
            'templateList',
        ])
    },
    watch:{
        templateList:function(){
            this.templateTotalHoldNum();
        }
    },
    mounted(){
        document.getElementsByClassName('template-scroll-warp')[0].addEventListener('scroll',this.listenerScroll);
    },
    methods:{
        ...mapActions('vtrade',[
            'sendWS'
        ]),
        //计算挂单总手数
        templateTotalHoldNum(){
            this.totalTemplateNum = 0;
            var isDelete = true;
            for(var i=0;i<this.templateList.length;i++){
                this.totalTemplateNum+=this.templateList[i].OrderNum;
                if(JSON.stringify(this.selectContractItem)!='{}'&&this.templateList[i].OrderID == this.selectContractItem.OrderID){
                    this.selectContractItem = this.templateList[i];
                    isDelete = false;
                }
            }
            if(JSON.stringify(this.selectContractItem)!='{}'&&isDelete){
                this.selectQuota(this.selectContractItem,this.templateIndex);
            }
        },
        //监听滚动
        listenerScroll(e){
            var scrollTop = e.target.scrollTop;
            var scrollLeft = e.target.scrollLeft;
            var titleNode = document.getElementsByClassName('template-title-item');
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
            var node = document.getElementsByClassName('template-item')[index];
            if(this.templateIndex != index){
                if(document.getElementById('option-btn')){
                    document.getElementById('template-btn1').removeEventListener('click',this.sellTemplate)
                    document.getElementById('template-btn2').removeEventListener('click',this.changeTemplate)
                    node.parentNode.removeChild(document.getElementById('option-btn'));
                }
                this.templateIndex = index;
                this.selectContractItem = item;
                var html = `
                    <tr>
                        <td colspan="6">
                            <div class="position-btn-warp">
                                <span class="position-btn" id="template-btn1">撤单</span>
                                <span class="position-btn" id="template-btn2">改单</span>
                            </div>
                        </td>
                    </tr>
                `;
                var newNode = document.createElement('tr');
                newNode.innerHTML = html;
                newNode.id = 'option-btn';
                inserAfter(newNode,node);
                document.getElementById('template-btn1').addEventListener('click',this.sellTemplate)
                document.getElementById('template-btn2').addEventListener('click',this.changeTemplate)
            }else{
                if(document.getElementById('option-btn')){
                    document.getElementById('template-btn1').removeEventListener('click',this.sellTemplate)
                    document.getElementById('template-btn2').removeEventListener('click',this.changeTemplate)
                    node.parentNode.removeChild(document.getElementById('option-btn'));
                    this.templateIndex = -1;
                    this.selectContractItem = {};
                }else{
                    this.templateIndex = index;
                    this.selectContractItem = item;
                    var html = `
                        <tr>
                            <td colspan="6">
                                <div class="position-btn-warp">
                                    <span class="position-btn" id="template-btn1">撤单</span>
                                    <span class="position-btn" id="template-btn2">改单</span>
                                </div>
                            </td>
                        </tr>
                    `;
                    var newNode = document.createElement('tr');
                    newNode.innerHTML = html;
                    newNode.id = 'option-btn'
                    inserAfter(newNode,node);
                    document.getElementById('template-btn1').addEventListener('click',this.sellTemplate)
                    document.getElementById('template-btn2').addEventListener('click',this.changeTemplate)
                }
            }
        },
        //撤单
        sellTemplate(){
            console.log('撤单');
            this.$layer({
                headerText:'确认撤单?',
                isShowBg:true,
                contentText:'#cancal-layer-content',
                btn:[{
                    text:'取消',
                    method:'关闭'
                },{
                    text:'确认',
                    method:()=>{
                        if(this.isSendData){
                            return;
                        }
                        this.$store.state.canCloseLayer = false;
                        this.$store.state.isSendData = true;
                        var method = 'CancelOrder'; //调用方法
                        var params = {
                            OrderSysID:this.selectContractItem.OrderSysID, //1系统编号
                            OrderID:this.selectContractItem.OrderID, //1订单号
                        }; //传入参数
                        this.sendWS({method,params});
                    },
                    active:true,
                }]
            })
        },
        //全部撤单
        cancelOrderAll(){
            this.$layer({
                headerText:'确认全部撤单',
                isShowBg:true,
                contentText:'是否全部撤单',
                isShowCloseBtn:false,
                btn:[{
                    text:'取消',
                    method:'关闭'
                },{
                    text:'确认',
                    method:()=>{
                        var isCanSale = true;
                        for(var i=0;i<this.templateList.length;i++){
                            if(!this.allSubsCommodity[this.templateList[i].CommodityNo].isOnTrade){
                                isCanSale = false;
                            }
                        }
                        if(isCanSale){
                            if(this.isSendData){
                                return;
                            }
                            for(var i=0;i<this.templateList.length;i++){
                                this.$store.state.canCloseLayer = false;
                                this.$store.state.isSendData = true;

                                var method = 'CancelOrder'; //调用方法
                                var params = {
                                    OrderSysID:this.templateList[i].OrderSysID, //1系统编号
                                    OrderID:this.templateList[i].OrderID, //1订单号
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
        //改单
        changeTemplate(){
            console.log('改单')
            this.changePrice = this.selectContractItem.OrderPrice;
            this.changeNum = this.selectContractItem.OrderNum;
            this.$layer({
                headerText:'填写改单信息',
                isShowBg:true,
                contentText:'#change-layer-content',
                isShowCloseBtn:true,
                btn:[{
                    text:'取消',
                    method:'关闭'
                },{
                    text:'确认',
                    method:()=>{
                        if(this.changePrice==''){
                            this.$toast({
                                content:'请输入委托价格'
                            });
                            this.changePrice = this.selectContractItem.OrderPrice;
                            return;
                        }else if(this.changeNum == ''){
                            this.$toast({
                                content:'请输入委托数量'
                            });
                            this.changeNum = this.selectContractItem.OrderNum;
                            return;
                        }else{
                            if(this.isSendData){
                                return;
                            }
                            this.$store.state.canCloseLayer = false;
                            this.$store.state.isSendData = true;
                            var method = 'ModifyOrder'; //调用方法
                            var params = {
                                OrderSysID:this.selectContractItem.OrderSysID, //1系统编号
                                OrderID:this.selectContractItem.OrderID, //1订单号
                                OrderNum:Number(this.changeNum),
                                OrderPrice:Number(this.changePrice),
                            }; //传入参数
                            this.sendWS({method,params});
                        }
                    },
                    active:true,
                }]
            })
        },
    },
    beforeDestroy(){
        // document.removeEventListener('scroll',this.listenerScroll);
    }
}
</script>

<style lang="scss" scoped>
.template-list{
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
            background: $btnBgColor;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            color:$activeFontColor;
            cursor: pointer;
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
        .template-title{
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
    .template-item{
        cursor: pointer;
        border-top: solid 1px $positionBorderColor;
    }
    .template-item:last-child{
        border-bottom: solid 1px $positionBorderColor;
    }
    .template-item:hover{
        background:$quotaChooseBgColor;
    }
    .template-item-active{
        background:$quotaChooseBgColor;
    }
}
.cancel-layer{
    width: 190px;
    .cancel-item{
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .cancel-item{
            color: $layerTitleColor;
        }
    }
}
.change-layer{
    display: flex;
    flex-direction: column;
    .change-input-item{
        display: flex;
        align-items: center;
        height: 30px;
        margin-bottom: 10px;
        .change-title{
            color:$lowTitleColor;
            margin-right: 10px;
            font-size: 14px;
        }
        .change-input{
            height: 100%;
            input{
                background: $selectBg2;
                height: 100%;
                padding-left: 10px;
                border:solid 1px $selectBg2;
                border-radius: 3px;
            }
            input:focus{
                background: $optionBg;
                border-color: $selectActiveColor;
            }
        }
        .change-input:focus{
            background: $optionBg;
            border-color: $selectActiveColor;
        }
    }
}
</style>
