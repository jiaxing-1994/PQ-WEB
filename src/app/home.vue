<template>
    <Contain id="home" v-loading="isConnecting">
        <Card class="card-margin card-no-left-margin" :flex=0 :float="isFloatQuota" :hide="isHideCard">
            <Quota :float="isFloatQuota" :switchHideCard="switchHideCard" :isHideCard="isHideCard"></Quota>
        </Card>
        <Card :flex=1>
            <Contain direction="column">
                <Card :class="['card-margin',isFloatQuota?'card-no-left-margin':'']" :flex=1 :overflowHidden="true">
                    <!-- <component :is="tradeType==0?'VChart':'Chart'" /> -->
                    <Chart :isHideCard="isHideCard"/>
                </Card>
                <Card :class="['card-margin',isFloatQuota?'card-no-left-margin':'']" :fixHeight="true">
                    <Contain direction="column">
                        <Card>
                            <component :is="tradeType==0?'VCaptialBar':'CaptialBar'"></component>
                        </Card>
                        <Contain>
                            <Card :flex=1>
                                <component :is="tradeType==0?'VPosition':'Position'" />
                                <!-- <Position /> -->
                            </Card>
                            <Card :flex=0 minWidth="370px">
                                <component :is="tradeType==0?'VTrade':'Trade'" />
                                <!-- <Trade /> -->
                            </Card>
                        </Contain>
                    </Contain>
                </Card>
            </Contain>
        </Card>
        <Card :flex=0>
            <Contain direction="column">
                <Card class="card-margin card-no-right-margin">
                    <Banner/>
                </Card>
                <Card class="card-margin card-no-right-margin" :fixHeight="true" height="280px">
                    <Five />
                </Card>
                <Card class="card-margin card-no-right-margin" :flex=1>
                    <Detail />
                </Card>
            </Contain>
        </Card>
    </Contain>
</template>

<script>
import Card from '@/components/layout/card.vue'
import Contain from '@/components/layout/contain.vue'
import Quota from '@/components/home/quota/quota.vue'
import Trade from '@/components/home/trade/trade.vue'
import VTrade from '@/components/vtrade/trade/trade.vue'
import Chart from '@/components/home/chart/chart.vue'
import Position from '@/components/home/position/position.vue'
import VPosition from '@/components/vtrade/position/position.vue'
import Five from '@/components/home/five/five.vue'
import Detail from '@/components/home/detail/detail.vue'
import Banner from '@/components/home/banner/banner.vue'
import CaptialBar from '@/components/home/chart/components/captialBar.vue'
import VCaptialBar from '@/components/home/chart/components/vCaptialBar.vue'
import {mapState,mapActions} from 'vuex'
export default {
    components:{
        Contain,
        Card,
        Quota,
        Trade,
        VTrade,
        Chart,
        Position,
        VPosition,
        Five,
        Detail,
        Banner,
        CaptialBar,
        VCaptialBar
    },
    data(){
        return{
            isFloatQuota:false, //是否浮动行情框
            isHideCard:false, //是否隐藏浮动行情框
            minWidth:1300, //浮动行情框的最小宽度
        }
    },
    computed:{
        ...mapState([
            'tradeType'
        ]),
        ...mapState('market',[
            'isConnecting'
        ]),
        ...mapState('trade',[
            'isTradeLogin'
        ]),
        ...mapState('vtrade',[
            'isVTradeLogin'
        ])
    },
    watch:{
        isTradeLogin:function(){
            if(this.isTradeLogin){
                this.checkActivity();
            }
        },
        isVTradeLogin:function(){
            console.log(this.isVTradeLogin);
            if(this.isVTradeLogin){
                setTimeout(()=>{
                    this.vCheckActivity();
                },2000);
            }
        },
    },
    mounted(){
        //判断窗口宽度
        if(this.$el.clientWidth<this.minWidth){
            this.isFloatQuota = true;
            setTimeout(()=>{
                this.isHideCard = true;
            },3000)
        }
        window.addEventListener('resize',this.resize)
    },
    methods:{
        ...mapActions('trade',[
            'checkActivity'
        ]),
        ...mapActions('vtrade',[
            'vCheckActivity'
        ]),
        resize(e){
            if(e.target.innerWidth<this.minWidth){
                this.isFloatQuota = true
                this.isHideCard = false;
            }else{
                this.isFloatQuota = false
            }
        },
        switchHideCard(){
            this.isHideCard = !this.isHideCard
        }
    },
    beforeDestroy(){
        window.removeEventListener('resize',this.resize);
    }
}
</script>

<style lang="scss" scoped>
#home{
    display: flex;
    width: 100%;
    position: relative;
    overflow: hidden;
    background: $borderColor;
    padding-top: px2vh(3px);
    padding-bottom: px2vh(3px);
}
.card-margin{
    margin: px2vh(3px);
}
.card-no-left-margin{
    margin-left: 0;
}
.card-no-right-margin{
    margin-right: 0;
}
</style>
