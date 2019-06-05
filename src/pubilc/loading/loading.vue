<template>
    <div v-show="visible" :class="[fullscreen?'fullscreen':'','loading','loading'+type]">
        <div class="loading-item">
            <svg version="1.1" id="L9" x="0px" y="0px"
            viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
                <path :fill="type==1?fill1:fill2" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                    <animateTransform 
                        attributeName="transform" 
                        attributeType="XML" 
                        type="rotate"
                        dur="1s" 
                        from="0 50 50"
                        to="360 50 50" 
                        repeatCount="indefinite" />
                </path>
            </svg>
        </div>
        <div class="loading-item" v-if="text">{{text}}</div>
    </div>    
</template>

<script>
export default {
    name:'loading',
    data(){
        return {
            fullscreen:true,
            text:'',
            visible:true,
            type:1,
            fill1:'#1873f2',
            fill2:'#c2c2c2'
        }
    }
}
</script>

<style scoped>
.loading{
    background: rgba(0,0,0,.8);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    color: #fff;
    z-index:100;
}
.loading2{
    background: rgba(233, 233, 233, 0.8);
    color: #333;
}
.fullscreen{
    position: fixed;
}
svg{
  width: 80px;
  height: 80px;
  display: inline-block;
}
</style>
