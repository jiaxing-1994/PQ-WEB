<template>
    <div class="five">
        <div class="title">
            五档行情
        </div>
        <div class="content">
            <div class="list-warp list-title">
                <span class="li-item li-left">卖买</span>
                <span class="li-item">价格</span>
                <span class="li-item li-right">数量</span>
            </div>
            <div class="list">
                <div class="list-warp list-item">
                    <span class="li-item li-left colorDown">卖五</span>
                    <span class="li-item">{{sell5[0]}}</span>
                    <span class="li-item li-right">{{sell5[1]}}</span>
                </div>
                <div class="list-warp list-item">
                    <span class="li-item li-left colorDown">卖四</span>
                    <span class="li-item">{{sell4[0]}}</span>
                    <span class="li-item li-right">{{sell4[1]}}</span>
                </div>
                <div class="list-warp list-item">
                    <span class="li-item li-left colorDown">卖三</span>
                    <span class="li-item">{{sell3[0]}}</span>
                    <span class="li-item li-right">{{sell3[1]}}</span>
                </div>
                <div class="list-warp list-item">
                    <span class="li-item li-left colorDown">卖二</span>
                    <span class="li-item">{{sell2[0]}}</span>
                    <span class="li-item li-right">{{sell2[1]}}</span>
                </div>
                <div class="list-warp list-item">
                    <span class="li-item li-left colorDown">卖一</span>
                    <span class="li-item">{{LastData[11].toFixed(this.currentQuota.dotSize)}}</span>
                    <span class="li-item li-right">{{LastData[12]}}</span>
                </div>
                <div class="list-warp list-item">
                    <span class="li-item li-left colorUp">买一</span>
                    <span class="li-item">{{LastData[13].toFixed(this.currentQuota.dotSize)}}</span>
                    <span class="li-item li-right">{{LastData[14]}}</span>
                </div>
                <div class="list-warp list-item">
                    <span class="li-item li-left colorUp">买二</span>
                    <span class="li-item">{{buy2[0]}}</span>
                    <span class="li-item li-right">{{buy2[1]}}</span>
                </div>
                <div class="list-warp list-item">
                    <span class="li-item li-left colorUp">买三</span>
                    <span class="li-item">{{buy3[0]}}</span>
                    <span class="li-item li-right">{{buy3[1]}}</span>
                </div>
                <div class="list-warp list-item">
                    <span class="li-item li-left colorUp">买四</span>
                    <span class="li-item">{{buy4[0]}}</span>
                    <span class="li-item li-right">{{buy4[1]}}</span>
                </div>
                <div class="list-warp list-item">
                    <span class="li-item li-left colorUp">买五</span>
                    <span class="li-item">{{buy5[0]}}</span>
                    <span class="li-item li-right">{{buy5[1]}}</span>
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
            sell5:[0,0],
            sell4:[0,0],
            sell3:[0,0],
            sell2:[0,0],
            sell1:[0,0],
            buy1:[0,0],
            buy2:[0,0],
            buy3:[0,0],
            buy4:[0,0],
            buy5:[0,0],
        }
    },
    computed:{
        ...mapState([
            'currentQuota'
        ]),
        ...mapState('market',[
            'depthLastData',
            'LastData'
        ])
    },
    watch:{
		depthLastData:function(){
			if(this.depthLastData[2] == 2){
				this.sell2[0] = this.depthLastData[3].toFixed(this.currentQuota.dotSize);
				this.sell2[1] = this.depthLastData[4];
				this.buy2[0] = this.depthLastData[5].toFixed(this.currentQuota.dotSize);
				this.buy2[1] = this.depthLastData[6];
			}else if(this.depthLastData[2] == 3){
				this.sell3[0] = this.depthLastData[3].toFixed(this.currentQuota.dotSize);
				this.sell3[1] = this.depthLastData[4];
				this.buy3[0] = this.depthLastData[5].toFixed(this.currentQuota.dotSize);
				this.buy3[1] = this.depthLastData[6];
			}else if(this.depthLastData[2] == 4){
				this.sell4[0] = this.depthLastData[3].toFixed(this.currentQuota.dotSize);
				this.sell4[1] = this.depthLastData[4];
				this.buy4[0] = this.depthLastData[5].toFixed(this.currentQuota.dotSize);
				this.buy4[1] = this.depthLastData[6];
			}else if(this.depthLastData[2] == 5){
				this.sell5[0] = this.depthLastData[3].toFixed(this.currentQuota.dotSize);
				this.sell5[1] = this.depthLastData[4];
				this.buy5[0] = this.depthLastData[5].toFixed(this.currentQuota.dotSize);
				this.buy5[1] = this.depthLastData[6];
			}
        },
        currentQuota:function(){
            this.sell1 = [0,0];
            this.sell2 = [0,0];
            this.sell3 = [0,0];
            this.sell4 = [0,0];
            this.sell5 = [0,0];
            this.buy1 = [0,0];
            this.buy2 = [0,0];
            this.buy3 = [0,0];
            this.buy4 = [0,0];
            this.buy5 = [0,0];
        }
    }
}
</script>

<style lang="scss" scoped>
.five{
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
            .li-left{
                justify-content: flex-start;
            }
            .li-right{
                justify-content: flex-end;
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
