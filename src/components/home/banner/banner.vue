<template>
    <div :class="['banner',isOpenBanner?'open-banner':'']">
        <span class="banner-btn" @click="switchBanner">
            <span :class="['triangle',isOpenBanner?'':'triangle-active']"></span>
        </span>
        <!-- <div v-show="!isOpenBanner" class="hide-banner">
            <span>新手推荐品种>></span>
            <span class="contract-btn">美黄金</span>
        </div> -->
        <div v-loading="isLoading" v-show="isOpenBanner" class="img-content">
            <span v-if="!isGetImg" @click="reGetImg">
                点击重新获取
            </span>
            <img v-if="isGetImg&&!isLoading" :src="webApi+imgUrl1.imgUrl" @click="jumpAd(imgUrl1.imgLinkUrl)"/>
        </div>
        <div v-loading="isLoading" v-show="!isOpenBanner" class="img-content">
            <span v-if="!isGetImg" @click="reGetImg">
                点击重新获取
            </span>
            <img v-if="isGetImg&&!isLoading" :src="webApi+imgUrl2.imgUrl" @click="jumpAd(imgUrl2.imgLinkUrl)"/>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    data(){
        return{
            isOpenBanner:true,
            imgUrl1:{
                imgUrl:'',
                imgLinkUrl:'',
            },
            imgUrl2:{
                imgUrl:'',
                imgLinkUrl:'',
            },
            isLoading:true,
            isGetImg:true,
        }
    },
    computed:{
        ...mapState([
            'api',
            'webApi'
        ])
    },
    watch:{
        api:function(){
            if(this.api!=''){
                this.getBannerImg();  
            }
        }
    },
    mounted(){
        if(this.api!=''){
            this.getBannerImg();  
        }
    },
    methods:{
        //展开收缩banner
        switchBanner(){
            this.isOpenBanner = !this.isOpenBanner;
        },
        //获取banner图片
        getBannerImg(){
            this.isLoading = true;
            this.$http.post(this.api+'/banner',{'type':'030'})
            .then((res)=>{
                if(res.code == '010'&&res.success){
                    // for(var i=0;i<res.data.length;i++){
                    //     if(res.data[i].){

                    //     }
                    // }
                    this.imgUrl1 = res.data[0];
                    this.imgUrl2 = res.data[1];
                    this.isGetImg = true;
                }else{
                    this.isGetImg = false;
                }
                this.isLoading = false;
            }).catch((err)=>{
                this.isGetImg = false;
                this.isLoading = false;
            })
        },
        //重新获取图片
        reGetImg(){
            this.getBannerImg();
        },
        jumpAd(url){
            if(url){
                window.open(url,'_blank')
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.banner{
    width: 100%;
    height: 100%;
    background: $tabColor;
    height: 50px;
    border-bottom: solid 1px $borderLineColor;
    display: flex;
    justify-content: center;
    align-content: center;
    position: relative;
    transition: all .2s;
    .banner-btn{
        position: absolute;
        width: 20px;
        height: 20px;
        top: 0;
        right: 10px;
        background: $borderColor;
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom-left-radius: 3px;
        border-bottom-right-radius: 3px;
        cursor: pointer;
        .triangle{
            width: 0;
            height: 0;
            border: solid 6px rgba(0,0,0,0);
            border-bottom-width: 0;
            border-top-color: $btnIconFont;
            transform: rotate(-180deg);
        }
        .triangle-active{
            transform: rotate(0);
        }
    }
    .hide-banner{
        color: $placeHolderColor;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        .contract-btn{
            cursor: pointer;
            color:$activeTabColor;
            text-decoration: underline;
        }
    }
    .img-content{
        flex: 1;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        color:$activeTabColor;
        text-decoration: underline;
        span{
            cursor: pointer;
        }
        img{
            cursor: pointer;
            width: 100%;
            height: 100%;
        }
    }
}
.open-banner{
    height: 150px;
}
</style>
