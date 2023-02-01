import { action, thunk } from 'easy-peasy'
import { apiService } from 'services'
import moment from 'moment-timezone'

const initialState = {
    groups: [],
    nodes: [],
}

const setGroups = action((state,payload) => {
    state.groups = payload
})

const getGroups = thunk(async (actions,payload) => {
    
    try {
        const groups = await apiService.getGroups()
        actions.setGroups(groups)
    } catch(err) {
        actions.setGroups([])
    }

    return {}

})

const setNodes = action((state,payload) => {
    try {
        payload = payload.map(entry => {
            entry.created_on = moment(entry.created_on)
            entry.updated_on = moment(entry.updated_on)
            entry.checked_on = moment(entry.checked_on)
            return entry
        })
        console.log(payload)
    } catch (error) {
        console.error(error)
    }
    state.nodes = payload
})

const getNodes = thunk(async (actions,payload) => {
    
    try {
        const nodes = await apiService.getNodes()
        actions.setNodes(nodes)
    } catch(err) {
        actions.setGroups([])
    }

    return {}

})


const actions = {
    setGroups,
    getGroups,
    setNodes,
    getNodes
}

const model = { ...initialState, ...actions }

export default model

