import Vue from 'vue'
import Loading from './loading'
const loadingConstructor = Vue.extend(Loading);

const loadingDirective = {};
loadingDirective.install = Vue => {
    Vue.directive('loading',{
        bind:function(el,binding){
            const loading = new loadingConstructor({
                el:document.createElement('div'),
                data:{
                    fullscreen:binding.modifiers.fullscreen,
                    text:el.getAttribute('loading-text'),
                    type:el.getAttribute('loading-type')?el.getAttribute('loading-type'):1
                }
            });
            el.instance = loading;
            el.loadingDom = loading.$el;
            toggleLoading(el,binding);
        },
        inserted:function(el,binding){

        },
        update:function(el,binding){
            el.instance.text = el.getAttribute('loading-text')
            toggleLoading(el,binding);
        },
        componentUpdated:function(el,binding){

        },
        unbind:function(el,binding){
            if(el.domInserted){
                if(binding.modifiers.fullscreen){
                    document.body.removeChild(el.loading);
                }else{
                    el.loadingDom&&
                    el.loadingDom.parentNode&&
                    el.loadingDom.parentNode.removeChild(el.loadingDom);
                }
            }
        },
    });
    
    const toggleLoading = (el,binding)=>{
        if(binding.value){
            //开启加载
            var parent = null;
            if(binding.modifiers.fullscreen){
                //全屏
                el.originPosition = document.body.style.position;
                el.originOverflow = document.body.style.overflow;
                document.body.style.position = 'relative'
                document.body.style.overflow = 'hidden'
                parent = document.body;
            }else{
                //当前dom
                //保存原始的css值
                el.originPosition = el.style.position;
                el.originOverflow = el.style.overflow;
                const overflow = window.getComputedStyle(el,null).getPropertyValue("overflow")
                if(el.style.position !== 'absolute'){
                    el.style.position = 'relative'
                }
                // el.style.overflow = 'hidden'
                parent = el;
            }
            if(el.domInserted){
                el.instance.visible = true;
            }else{
                insertDom(parent,el,binding);
            }
        }else{
            //关闭加载
            if(binding.modifiers.fullscreen){
                //全屏
                document.body.style.position = el.originPosition;
                document.body.style.overflow = el.originOverflow;
            }else{
                //当前dom
                el.style.position = el.originPosition;
                // el.style.overflow = el.originOverflow;
            }
            el.instance.visible = false;
        }
    }
    const insertDom = (parent,el,binding)=>{
        parent.appendChild(el.loadingDom);
        el.domInserted = true;
    }
}
export default loadingDirective