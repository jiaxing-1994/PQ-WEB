<template>
    <div class="contain" :style="{flex:flex,'flex-direction':direction}">
        <slot></slot>
    </div>    
</template>

<script>
export default {
    props:{
        flex:{
            type:Number,
            default:1
        },
        direction:{
            type:String,
            default:'row'
        }
    }
}
</script>

<style lang="scss" scoped>
.contain{
    display: flex;
    width: 100%;
    // flex-wrap: wrap;
    overflow: hidden;
}
</style>
