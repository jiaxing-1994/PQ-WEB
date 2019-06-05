import Vue from 'vue';
import Layer from './layer.vue';

const LayerConstructor = Vue.extend(Layer);
let uId = 1;
const layer = (options)=>{
    /*
    @params
    isShowBg 是否显示遮罩层 boolean
    headerText 头部文字 string
    contentText 内容文字 string
    btn 按钮 array [{text:文字,method:方法}] 如果method为关闭则关闭弹窗
    width 弹窗宽度 string
    height 弹窗高度 array [a,b,c] a头部高度 b内容最小高度 c按钮高度
    animationType 动画样式 string
    */
    var dataParams = {};
    if(options){
        Object.keys(options).forEach((item)=>{
            dataParams[item] = options[item];
        })
    }
    const layerInstance = new LayerConstructor({
        data:{
            ...dataParams,
            uId:uId,
        }
    })
    layerInstance.id='layer'+uId;
    layerInstance.vm = layerInstance.$mount();
    layerInstance.vm.visible = true;
    layerInstance.vm.$el.id = 'layer'+uId;
    const dom = layerInstance.vm.$el;
    document.body.style.position = 'relative';
    if(layerInstance.vm.$el.children[1]){
        layerInstance.vm.$el.children[1].style.zIndex = 100+uId;
    }
    uId++;
    layerInstance.vm.$el.children[0].style.zIndex = 100+uId;
    document.body.appendChild(layerInstance.vm.$el);
    layerInstance.vm.$on('close',()=>{
        uId--;
        if(dom&&dom.parentNode){
            layerInstance.vm.$destroy();
            dom.parentNode.removeChild(dom);
        }
    })
    return layerInstance.vm;
}

export default {
    install: Vue=>{
        Vue.prototype.$layer = layer;
    },
    layer
}