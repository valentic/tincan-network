import { action, thunkOn } from 'easy-peasy'

const initialState = {
    view: 'Drone',
    active: false,
    pause: true,
    site: 'kirtland',
    feature: { 
        'tracks': true,
        'radar': true,
        'truth': true
        },
    speed: 5
}

const reset = action((state,payload) => {
    return initialState
})

const set_view = action((state,payload) => {
    state.view = payload
})

const set_pause = action((state,payload) => {
    state.pause = payload
})

const set_site = action((state,payload) => {
    state.site = payload 
})

const set_speed = action((state,payload) => {
    state.speed = payload
})

const set_feature = action((state,{feature, flag}) => {
    state.feature[feature] = flag 
})

const on_truth_data = thunkOn(
    (actions,storeActions) => storeActions.data.set_truth_data,
    async (actions,target) => {
        actions.set_pause(true) 
    }
)

const actions = {
    reset,
    set_view,
    set_pause,
    set_site,
    set_speed,
    set_feature,
    on_truth_data
}

const model = { ...initialState, ...actions }

export default model
