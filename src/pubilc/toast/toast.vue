
<template>
    <div class='toast' :class="['toast'+styleType]" v-html="content">
    </div>
</template>

<script>
export default {
    data(){
        return{
            closeTime:2000,
            content:'',
            position:'bottom',
            styleType:1,
            nId:1,
        }
    },
    mounted(){
        this.setTimer();
        this.$nextTick(()=>{
            this.middleStyle();
            this.$el.style.animation = 'fade-in .2s ease'
            this.$el.style.animationFillMode = 'forwards'
        })
    },
    methods:{
        middleStyle(){
            var bodyWidth = document.body.clientWidth;
            var bodyHeight = document.body.clientHeight;
            var layerWidth = this.$el.clientWidth;
            var layerHight = this.$el.clientHeight;
            this.$el.style.left = (bodyWidth/2-layerWidth/2)+'px';
            if(this.position == 'middle'){
                var bodyHight = document.body.clientHeight;
                this.$el.style.top = (bodyHight/2-layerHight/2)+'px';
            }else if(this.position == 'top'){
                this.$el.style.top = '10%';
            }else if(this.position == 'bottom'){
                if(document.getElementById('toast-'+(this.nId-1))){
                    var preToastHeight = document.getElementById('toast-'+(this.nId-1)).clientHeight;
                    var preTop = document.getElementById('toast-'+(this.nId-1)).offsetTop;
                    var bottom = bodyHeight-preTop+10
                }else{
                    var bottom = 20;
                }
                this.$el.style.bottom = bottom+'px';
            }
        },
        close(){
            this.visible = false;
            this.$el.style.animation = 'fade-out .2s ease'
            this.$el.style.animationFillMode = 'forwards'
            setTimeout(()=>{
                // this.$destroy();
                // this.$el.parentNode.removeChild(this.$el);
                this.$emit('close');
            },500)
        },
        setTimer(){
            setTimeout(()=>{
                this.close();
            },this.closeTime)
        }
    },
}
</script>

<style>
.toast{
    position: absolute;
    padding: 10px;
    background: rgba(0,0,0,.6);
    color:#fff;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    border-radius: .4rem;
    /* box-shadow:0 0 3px 3px #ddd; */
}
.toast2{
    background: #333;
    color: #fff;
}
@keyframes fade-in{
    0%{
        opacity: 0;
        transform: scale(0,0);
    }
    100%{
        opacity: 1;
        transform: scale(1,1);
    }
}
@keyframes fade-out{
    0%{
        opacity: 1;
        transform: scale(1,1);
    }
    100%{
        opacity: 0;
        transform: scale(0,0);
    }
}
</style>
