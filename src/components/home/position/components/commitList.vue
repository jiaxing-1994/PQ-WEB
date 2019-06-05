<template>
    <div class="commit-list">
        <div class="no-data" v-if="Object.keys(allOrderList).length==0">
            暂无数据
        </div>
        <div class="scroll-warp commit-scroll-warp" v-show="Object.keys(allOrderList).length>0">
            <table border="0" cellpadding="10" cellspacing="0">
                <thead>
                    <tr class="commit-title">
                        <th class="commit-title-item fix-title">名称</th>
                        <th class="commit-title-item fix-title">状态</th>
                        <th class="commit-title-item fix-title">买卖</th>
                        <th class="commit-title-item fix-title">委托价</th>
                        <th class="commit-title-item fix-title">委托量</th>
                        <th class="commit-title-item fix-title">已成交</th>
                        <th class="commit-title-item fix-title">已撤单</th>
                        <th class="commit-title-item fix-title">下单时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :class="['commit-item',commitIndex==index?'commit-item-active':'']"
                        v-for="(item,key,index) in allOrderList"
                        :key="index"
                    >
                        <td>
                            {{item.CommodityName}}
                        </td>
                        <td>
                            {{item.StatusMsg}}
                        </td>
                        <td>
                            {{item.Direction==0?'买':'卖'}}
                        </td>
                        <td>
                            {{item.OrderPriceType==0?'限价':'市价'}}
                        </td>
                        <td>
                            {{item.OrderNum}}
                        </td>
                        <td>
                            {{item.TradeNum}}
                        </td>
                        <td>
                            {{item.OrderStatus==4?'是':'否'}}
                        </td>
                        <td>
						    {{item.InsertDateTime}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import {inserAfter,removeAfter} from '@/util/index'
export default {
    data(){
        return{
            commitIndex:-1, //持仓列表索引
            selectContractItem:{}, //选中的仓位合约
        }
    },
    computed:{
        ...mapState([
            'rmbOrUsd',
            'rateList'
        ]),
        ...mapState('trade',[
            'allOrderList',
        ])
    },
    mounted(){
        document.getElementsByClassName('commit-scroll-warp')[0].addEventListener('scroll',this.listenerScroll);
    },
    methods:{
        //监听滚动
        listenerScroll(e){
            var scrollTop = e.target.scrollTop;
            var scrollLeft = e.target.scrollLeft;
            var titleNode = document.getElementsByClassName('commit-title-item');
            for(var i=0;i<titleNode.length;i++){
                if(scrollTop!=0){
                    titleNode[i].style.top = scrollTop+'px';
                }else{
                    titleNode[i].style.top = '0px';
                }
            }
        },
    },
    beforeDestroy(){
    }
}
</script>

<style lang="scss" scoped>
.commit-list{
    height:100%;
    .scroll-warp{
        height: 100%;
        overflow: auto;
    }
}
table{
    min-width: 100%;
    border-collapse: collapse;
    thead{
        .commit-title{
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
    .commit-item{
        border-top: solid 1px $positionBorderColor;
    }
    .commit-item:last-child{
        border-bottom: solid 1px $positionBorderColor;
    }
}
</style>
