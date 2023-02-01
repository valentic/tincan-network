import { action } from 'easy-peasy'
import moment from 'moment-timezone'

const initialState = {
    now: moment() 
}

const update = action((state,payload) => {
    state.now = moment() 
})

const actions = {
    update
}

const model = { ...initialState, ...actions }

export default model
