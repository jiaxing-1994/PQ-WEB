<template>
    <div :class="['value-select',isShowOptions?'value-select-active'+styleType:'','value-select-'+styleType]">
        <span class="select-value" @click="selectType">
            {{type}}
        </span>
        <span class="select-btn" @click="selectType" v-if="styleType==1">
            <span class="triangle"></span>
        </span>
        <span class="select-btn" @click="selectType" v-if="styleType==2">
            <span class="triangle"></span>
        </span>
        <span class="select-btn" @click="selectType" v-if="styleType==3">
            <span class="triangle"></span>
        </span>
        <span class="select-option">
            <span
                class="options-item"
                v-for="(item,index) in options"
                :key="index"
                @click="chooseOption(item)"
            >
                {{item.name}}
            </span>
        </span>
    </div>
</template>

<script>
export default {
    props:{
        options:{
            type:Array,
            default:function(){
                return []
            }
        },
        value:{
            type:String
        },
        defaultOption:{
            type:Object,
            // default:this.options[0]
        },
        maxLength:{
            type:Number,
            default:5
        },
        styleType:{
            type:Number,
            default:1,
        }
    },
    data(){
        return{
            isShowOptions:false,
            type:'',
        }
    },
    watch:{
        defaultOption:function(){
          if(this.defaultOption.name){
            this.chooseOption(this.defaultOption);
          }
        }
    },
    mounted(){
        if(this.options.length>0){
            this.chooseOption(this.options[0]);
        }
    },
    methods:{
        calculatorHeight(){
            var optionsDom = this.$el.childNodes[this.$el.childNodes.length-1];
            if(this.isShowOptions){
                var num = this.options.length;
                if(num>this.maxLength){
                    num = this.maxLength;
                }
                var height = num*30;
                optionsDom.style.height = height+'px';
            }else{
                optionsDom.style.height = 0;
            }

        },
        selectType(){
            this.isShowOptions = !this.isShowOptions;
            this.calculatorHeight();
        },
        chooseOption(item){
          if(item.name){
            this.type = item.name;
            this.isShowOptions = false;
            this.calculatorHeight();
            this.$emit('change',item);
          }
        }
    }
}
</script>

<style lang="scss" scoped>
.value-select{
    width: 100%;
    height: 100%;
    border: solid 1px $selectBorderColor;
    display: flex;
    position: relative;
    background: $selectBg;
    border-radius: 3px;
    box-sizing: border-box;
    .select-value{
        flex: 1;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color:$selectFontColor;
    }
    .select-btn{
        width: 30px;
        height: 100%;
        background: $btnBgColor;
        display: flex;
        justify-content: center;
        align-items: center;
        color:$selectFontColor;
        cursor: pointer;
        .triangle{
            cursor: pointer;
            width: 0;
            height: 0;
            border: solid 6px rgba(0,0,0,0);
            border-bottom-width: 0;
            border-top-color: $btnIconFont;
            transition: all .2s;
        }
    }
    .select-option{
        position: absolute;
        top: 40px;
        min-width: 100%;
        height: 0;
        overflow: hidden;
        transition: height .2s ease-out;
        background: $optionBg;
        color:$optionFontColor;
        overflow: auto;
        z-index: 9999;
        font-size: 13px;
        .options-item{
            cursor: pointer;
            height: 30px;
            display: flex;
            align-items: center;
            padding: 0 10px;
            white-space: nowrap;
        }
        .options-item:hover{
            background:$optionHover;
        }
    }
}
.value-select-active1{
    border-color:$activeTabColor;
    .select-btn{
        background: $activeTabColor;
        .triangle{
            border-top-color: $btnActiveIconFont;
            transform: rotate(-180deg);
        }
    }
}
.value-select-2{
    background: $selectBg2;
    height: 100%;
    border: solid 1px $selectBg2;
    .select-value{
        color:$selectFontColor2;
    }
    .select-btn{
        width: 15px;
        height: 100%;
        position: relative;
        background: none;
        .triangle{
            position: absolute;
            bottom: 2px;
            right: 0;
            cursor: pointer;
            width: 0;
            height: 0;
            border: solid 6px rgba(0,0,0,0);
            border-bottom-width: 0;
            border-top-color: $btnIconFont;
            transform: rotate(-45deg);
        }
    }
}
.value-select-active2{
    background:#fff;
    border-color:$activeTabColor;
    .select-btn{
        .triangle{
            border-top-color: $activeTabColor;
        }
    }
    .select-option{
        box-shadow: 0 0 3px 3px rgba(61,68,102,.2);
    }
}
.value-select-3{
    background: $selectBg3;
    height: 100%;
    .select-value{
        color:$selectFontColor3;
    }
    .select-btn{
        // width: 50px;
        height: 100%;
        background: $selectBg3;
        position: relative;
        .triangle{
            position: absolute;
            top:50%;
            left:50%;
            transform: translate(-50%,-50%);
            cursor: pointer;
            width: 0;
            height: 0;
            border: solid 6px rgba(0,0,0,0);
            border-bottom-width: 0;
            border-top-color: $btnIconFont;
        }
    }
}
/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
.select-option::-webkit-scrollbar
{
    width: 8px;
    height: 8px;
    background-color: $selectScrollBg;
}
/*定义滚动条轨道 内阴影+圆角*/
.select-option::-webkit-scrollbar-track
{
    border-radius: 0px;
    background-color: $selectScrollBg;
}
/*定义滑块 内阴影+圆角*/
.select-option::-webkit-scrollbar-thumb
{
    border-radius: 5px;
    background-color: $selectScrollBar;
}
</style>
