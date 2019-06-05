import state from './state'
import actions from './actions'
import mutations from './mutations'

const market = {
    namespaced:true,
    state:state,
    mutations:mutations,
    actions:actions
}

export default market;