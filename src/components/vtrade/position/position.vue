<template>
    <div class="position">
        <div class="tabs">
            <span 
                :class="['tabs-item',tabIndex==index?'tabs-item-active':'']" 
                v-for="(item,index) in tabsList" 
                :key="index"
                @click="switchTab(item,index)"
            >
                <span class="tabs-item-text">
                    <span v-if="item.name=='挂单'&&Object.keys(templateList).length>0" class="circle"></span>
                    {{item.name}}
                </span>
            </span>
        </div>
        <div class="position-warp">
            <div class="login-tip" v-if="!isLoginApp">
                请先<span @click="goToLogin(1)" class="login-tip-btn">登录</span>或<span @click="goToLogin(0)" class="login-tip-btn">开户</span>查看持仓
            </div>
            <!-- <keep-alive> -->
                <component v-loading="isLoading" v-if="isLoginApp" :is="chooseComponent"></component>
            <!-- </keep-alive> -->
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import positionList from './components/positionList.vue'
import templateList from './components/templateList.vue'
import commitList from './components/commitList.vue'
import stopList from './components/stopList.vue'
import conditionList from './components/conditionList.vue'
import successList from './components/successList.vue'
export default {
    components:{
        positionList,
        templateList,
        commitList,
        stopList,
        conditionList,
        successList
    },
    data(){
        return{
            tabsList:[{
                name:'持仓',
                value:'positionList'
            },{
                name:'挂单',
                value:'templateList'
            },{
                name:'委托',
                value:'commitList'
            },{
                name:'止损单',
                value:'stopList'
            },{
                name:'条件单',
                value:'conditionList'
            },{
                name:'成交',
                value:'successList'
            },],
            tabIndex:0,
            chooseComponent:'positionList',
            isLoading:true,
            data:{},
        }
    },
    computed:{
        ...mapState([
            'isLoginApp'
        ]),
        ...mapState('vtrade',[
            'templateList',
            'isLoadPosition'
        ])
    },
    watch:{
        isLoadPosition:function(){
            this.isLoading = this.isLoadPosition;
        }
    },
    mounted(){
        if(!this.isLoginApp){
            this.tabIndex = -1;
        }else{
            this.tabIndex = 0;
        }
        this.isLoading = this.isLoadPosition;
    },
    methods:{
        //切换tab
        switchTab(item,index){
            if(this.tabIndex != index){
                this.tabIndex = index;
                if(this.isLoginApp){
                    // document.getElementsByClassName('scroll-warp')[0].removeEventListener('scroll',this.listenerScroll)
                    this.chooseComponent = item.value;
                }
            }
        },
        goToLogin(index){
            this.$router.push({
                path:'/login',
                query:{
                    tabIndex:index
                }
            })
        }
    }
}
</script>

<style lang="scss">
.position{
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: $mainColor;
    .tabs{
        height: 30px;
        border-bottom: solid 1px $borderLineColor;
        display: flex;
        color: $placeHolderColor;
        .tabs-item{
            height: 100%;
            padding: 0 10px;
            display: flex;
            align-items: center;
            cursor: pointer;
            .tabs-item-text{
                position: relative;
                white-space: nowrap;
                .circle{
                    position: absolute;
                    top:0;
                    right: -7px;
                    border-radius: 50%;
                    width: 7px;
                    height: 7px;
                    background: $colorUp;
                }
            }
        }
        .tabs-item:hover{
            background-color: $quotaChooseBgColor;
        }
        .tabs-item-active{
            color:$activeTabColor;
            background-color: $quotaChooseBgColor;
        }
    }
    .position-warp{
        height: calc(100% - 31px);
        overflow: hidden;
        position: relative;
        z-index: 10;
        color: $placeHolderColor;
        .login-tip{
            color: $placeHolderColor;
            width: 100%;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            justify-content: center;
            cursor: pointer;
            span{
                color: $activeTabColor;
                text-decoration: underline;
            }
        }
    }
}
</style>
