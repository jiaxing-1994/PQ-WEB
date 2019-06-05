import Vue from 'vue'
import toastComponent from './toast.vue'

const ToastConstructor = Vue.extend(toastComponent)

let nId = 0;
const toast = (options)=>{
  let id = 'toast-' + ++nId;
  var dataParams = {};
  if(options&&typeof options == 'object'){
      Object.keys(options).forEach((item)=>{
          dataParams[item] = options[item];
      })
  }
  const toastInstance = new ToastConstructor({
    data: {
      ...dataParams,
      nId:nId,
    }
  })
  toastInstance.vm = toastInstance.$mount()
  toastInstance.vm.visible = true
  toastInstance.dom = toastInstance.vm.$el
  toastInstance.dom.id = id
  document.body.appendChild(toastInstance.dom)
  toastInstance.dom.style.zIndex = nId + 1001
  toastInstance.vm.$on('close',()=>{
      nId--;
      toastInstance.dom = null;
      toastInstance.vm.$destroy();
      toastInstance.vm.$el.parentNode.removeChild(toastInstance.vm.$el);
  })
  return toastInstance.vm
}
export default {
  install: Vue => {
    Vue.prototype.$toast = toast
  },
  toast
}