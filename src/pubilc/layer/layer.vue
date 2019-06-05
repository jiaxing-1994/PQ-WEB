<template>
    <div class="jx-layer">
        <div class="jx-layer-box" :style="{'min-width':width}">
            <img v-if="isShowCloseBtn" @click="chooseBtn({method:'关闭'})" class="jx-layer-close" src="@/assets/imgs/layer/delete.png" />
            <div v-if="headerText" class="jx-layer-header" :style="{'height':headerText!=''?height[0]:''}">
                {{headerText}}
            </div>
            <div 
                class="jx-layer-content" 
                :style="{'min-height':headerText!=''?height[1]:height[0]}"
                :id="'jx-layer-warp'+uId"
            >
            </div>
            <div 
                v-if="btn.length>0" 
                :class="['jx-layer-btn',haveBtnBorder?'jx-layer-btn-top-border':'']"
                :style="{'height':headerText!=''?height[2]:height[1]}">
                <span
                    :class="['jx-layer-btn-item',item.active?'jx-layer-btn-item-active':'']"
                    @click="chooseBtn(item)" 
                    v-for="(item,index) in btn" :key="index"
                >
                    {{item.text}}
                </span>
            </div>
        </div>
        <div v-if="isShowBg" @click="chooseBtn({method:'关闭'})" class="jx-layer-bg"></div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import { setTimeout } from 'timers';
export default {
    name:'jxLayer',
    data(){
        return{
            isShowBg:true, //是否显示遮罩层
            headerText:'系统提示', //头部
            contentText:'', //内容
            btn:[],//按钮
            width:'400px',//宽
            height:[],//高
            animationType:'layer-fade', //动画
            haveBtnBorder:false, //底部按钮是否有顶部border
            isShowCloseBtn:true, //是否显示关闭按钮
            dom:null,
            parentNode:null,
            uId:1,
            closeFunc:null
        }
    },
    computed:{
        canCloseLayer:function(){
            return vue.$store.state.canCloseLayer;
        }
    },
    watch:{
        canCloseLayer:function(){
            if(this.canCloseLayer){
                this.chooseBtn({method:'关闭'});
            }
        }
    },
    mounted(){
        this.$nextTick(()=>{
            if(this.contentText[0]=='#'){
                this.getContentDom();
            }else{
                document.getElementById('jx-layer-warp'+this.uId).innerHTML = this.contentText;
            }
            this.middleStyle();
            this.openAnim();
        })
    },
    methods:{
        //获取内容dom
        getContentDom(){
            this.dom = null;
            if(this.contentText[0]=='#'){
                var id = this.contentText.replace('#','');
                this.dom = document.getElementById(id);
                this.parentNode = this.dom.parentNode;
            }
            this.dom.classList.remove('layer-content')
            document.getElementById('jx-layer-warp'+this.uId).appendChild(this.dom);
        },
        //居中
        middleStyle(){
            var boxDom = this.$el.childNodes[0];
            var bodyHight = document.body.clientHeight;
            var layerHight = boxDom.clientHeight;
            var bodyWidth = document.body.clientWidth;
            var layerWidth = boxDom.clientWidth;
            boxDom.style.top = (bodyHight/2-layerHight/2)+'px';
            boxDom.style.left = (bodyWidth/2-layerWidth/2)+'px';
        },
        openAnim(){
            var boxDom = this.$el.childNodes[0];
            boxDom.style.animation = this.animationType+'-in .2s ease';
            boxDom.style.animationFillMode = 'forwards';
        },
        closeAnim(){
            var boxDom = this.$el.childNodes[0];
            var bgDom = document.getElementsByClassName('jx-layer-bg')[0];
            boxDom.style.animation = this.animationType+'-out .2s ease';
            boxDom.style.animationFillMode = 'forwards';
            // bgDom.style.animation = this.animationType+'layer-fade-bg-out .1s ease-out';
            // bgDom.style.animationFillMode = 'forwards';
        },
        chooseBtn(item){
            if(item.method == '关闭'){
                this.isShowBg = false;
                this.closeAnim();
                if(this.closeFunc){
                    this.closeFunc();
                }
                if(this.contentText[0]=='#'&&this.dom){
                    this.dom.classList.add('layer-content');
                    this.parentNode.appendChild(this.dom);
                }
                setTimeout(()=>{
                    this.$emit('close');
                },200);
            }else{
                item.method();
                if(item.isClose){
                    this.chooseBtn({method:'关闭'});
                }
            }
        },
    }
}
</script>

<style lang="scss">
.jx-layer{
    /* position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 100;
    transition: all .5s; */
}
.jx-layer-box{
    background: $layerBgColor;
    border-radius: 3px;
    color: $layerFontColor;
    position: absolute;
    // top: 50%;
    // left: 50%;
    // transform: translate(-50%,-50%);
    z-index: 101;
    animation-duration: .3s;
    animation-timing-function: ease-in;
    animation-fill-mode: forwards;
    opacity: 0;
    .jx-layer-close{
        position: absolute;
        width: 10px;
        height: 10px;
        top: 10px;
        right: 10px;
        z-index: 10;
        cursor: pointer;
    }
}
.jx-layer-bg{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(38,45,76,.4);
    z-index: 100;
}
.jx-layer-header{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    // border-bottom: solid 1px $layerBorderColor;
}
.jx-layer-content{
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
}
.jx-layer-btn{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70px;
    .jx-layer-btn-item{
        cursor: pointer;
        min-width: 90px;
        white-space: nowrap;
        height: 30px;
        color: $layerFontColor;
        border: solid 1px $layerBorderColor;
        border-radius: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 5px;
    }
    .jx-layer-btn-item-active{
        background: $layerActiveColor;
        border: solid 1px $layerActiveColor;
        color: $layerBgColor;
    }
    .jx-layer-btn-item:hover{
        opacity: 0.95;
    }
    .jx-layer-btn-item:active{
        opacity: 0.9;
    }
}
.jx-layer-btn-top-border{
    border-top: solid 1px $layerBorderColor;
}
@keyframes layer-fade-in{
    0%{
        opacity: 0;
        transform: scale(0,0)
    }
    100%{
        opacity: 1;
        transform: scale(1,1)
    }
}
@keyframes layer-fade-out{
    0%{
        opacity: 1;
        transform: scale(1.1,1.1);
    }
    100%{
        opacity: 0;
        transform: scale(0,0);
    }
}
@keyframes layer-fade-bg-out{
    0%{
        opacity: 1;
    }
    100%{
        opacity: 0;
    }
}
</style>
