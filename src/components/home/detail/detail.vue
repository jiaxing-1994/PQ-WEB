<template>
    <div class="detail">
        <div class="title">
            逐笔明细
        </div>
        <div class="content">
            <div class="list-warp list-title">
                <span class="li-item li-left">时间</span>
                <span class="li-item">价格</span>
                <span class="li-item li-right">数量</span>
            </div>
            <div class="list">
                <div 
                    class="list-warp list-item"
                    v-for="(item,index) in tickerList"
                    :key="index"
                >
                    <span class="li-item li-left li-time">{{item[1].split(' ')[1].split('.')[0]}}</span>
                    <span class="li-item">{{item[3].toFixed(currentQuota.dotSize)}}</span>
                    <span class="li-item li-right">{{item[4]}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    data(){
        return{
        }
    },
    computed:{
        ...mapState([
            'currentQuota'
        ]),
        ...mapState('market',[
            'tickerList'
        ])
    },
    watch:{
        currentQuota:function(){
            this.$store.state.market.tickerList = [];
        }
    }
}
</script>

<style lang="scss" scoped>
.detail{
    width: 100%;
    height: 100%;
    background: $mainColor;
    color: $normalFontColor;
    .title{
        height: 50px;
        border-bottom: solid 1px $borderLineColor;
        display: flex;
        justify-content: flex-start;
        padding: 0 10px;
        align-items: center;
    }
    .content{
        height: calc(100% - 50px);
        padding: 0 10px;
        .list-warp{
            display: flex;
            justify-content: space-between;
            align-items: center;
            .li-item{
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .li-time{
                color:$detailColor;
            }
            .li-left{
                justify-content: flex-start;
            }
            .li-right{
                justify-content: flex-end;
                padding-right: 3px;
            }
        }
        .list-title{
            color: $placeHolderColor;
            height: 30px;
        }
        .list{
            height: calc(100% - 30px);
            overflow: auto;
            color: $normalFontColor;
        }
    }
}
</style>
