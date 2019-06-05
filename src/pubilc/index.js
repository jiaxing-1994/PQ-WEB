import toast from './toast'
import loading from './loading'
import layer from './layer'

const install = (Vue)=>{
    Vue.use(loading);
    Vue.prototype.$toast = toast.toast
    Vue.prototype.$layer = layer.layer
}

export default install