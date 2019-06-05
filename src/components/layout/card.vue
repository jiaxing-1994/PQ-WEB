<template>
    <div class="card" :class="[float?'floatCard':'',hide?'floatCardHide':'']" 
        :style="{
            flex:flex&&flex,
            'min-width':minWidth,
            'height':fixHeight&&height,
            'overflow':overflowHidden&&('hidden')}"
    >
        <slot></slot>
    </div>    
</template>

<script>
export default {
    props:{
        flex:{
            type:Number,
        },
        float:{
            type:Boolean,
            default:false
        },
        hide:{
            type:Boolean,
            default:false,
        },
        minWidth:{
            type:String,
            default:'300px'
        },
        fixHeight:{
            type:Boolean,
            default:false
        },
        height:{
            type:String,
            default:'250px'
        },
        overflowHidden:{
            type:Boolean,
            default:false,
        }
    }    
}
</script>

<style lang="scss" scoped>
.card{
    display: flex;
    // flex: 1;
    transition: all .2s;
    // overflow: hidden;
}
.floatCard{
    position: absolute;
    width: 300px;
    height: calc(100% - #{px2vh(12px)});
    left: 0px;
    transition: left .3s;
    z-index: 80;
}
.floatCardHide{
    left:-300px; 
    .quota-warp{
        background: $mainColor;
    }
}
</style>
