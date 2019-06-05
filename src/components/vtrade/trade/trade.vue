<template>
    <div class="trade">
        <div class="tabs-bar">
            <span 
                :class="['tabs-item',tabIndex==index?'tabs-item-active':'']"
                v-for="(item,index) in tabs"
                :key="index"
                @click="switchTab(item,index)"
            >
                {{item.name}}
            </span>
        </div>
        <div class="trade-warp">
            <keep-alive>
                <component :is="chooseComponent"></component>
            </keep-alive>
        </div>
    </div>    
</template>

<script>
import buy from './components/buy.vue'
import sell from './components/sell.vue'
import condition from './components/condition.vue'
export default {
    components:{
        buy,
        sell,
        condition
    },
    data(){
        return{
            tabs:[{
                name:'普通单',
                value:'buy'
            },{
                name:'条件单',
                value:'condition'
            }],
            tabIndex:0,
            chooseComponent:'buy',
        }
    },
    methods:{
        switchTab(item,index){
            if(this.tabIndex != index){
                this.tabIndex = index;
                this.chooseComponent = item.value;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.trade{
    width: 100%;
    height: 100%;
    background: $tabColor;
    color: $normalFontColor;
    border-left: solid 1px $borderLineColor;
    .tabs-bar{
        display: flex;
        .tabs-item{
            height: 30px;
            border-bottom:solid 1px $borderLineColor;
            background: $mainColor;
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        }
        .tabs-item-active{
            color: $activeFontColor;
            border-bottom-color:$tabColor;
            background: $tabColor;
            position: relative;
        }
        .tabs-item-active::after{
            content: '';
            width: 100%;
            height: 4px;
            position: absolute;
            top: 0;
            left:0;
            background: $activeTabColor;
        }
    }
    .trade-warp{
        height: calc(100% - 31px);
        overflow: hidden;
    }
}
</style>
