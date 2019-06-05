import state from './state'
import actions from './actions'
import mutations from './mutations'

const trade = {
    namespaced:true,
    state:state,
    mutations:mutations,
    actions:actions
}

export default trade;