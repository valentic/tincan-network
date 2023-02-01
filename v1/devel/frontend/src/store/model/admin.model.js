import { action, thunk } from 'easy-peasy'
import { adminService } from 'services'

const initialState = {
    users: {},
    history: {}
}

const setUsers = action((state,payload) => {
    state.users = payload
})

const setHistory = action((state,payload) => {
    state.history = payload
})

const getUsers = thunk(async (actions,payload,{dispatch}) => {
    adminService.getUsers()
        .then(results => actions.setUsers(results.users))
        .catch(err => {
            actions.setUsers({})
            dispatch.auth.logout()
        })
})

const getHistory = thunk(async (actions,payload,{dispatch}) => {
    adminService.getHistory()
        .then(results => actions.setHistory(results.history))
        .catch(err => {
            actions.setHistory({})
            dispatch.auth.logout()
        })
})

const approveUser = thunk(async (actions,username,{dispatch}) => {
    adminService.approveUser(username)
        .then(results => actions.setUsers(results.users))
        .catch(err => {
            actions.setUsers({})
            dispatch.auth.logout()
        })
})

const denyUser = thunk(async (actions,username,{dispatch}) => {
    adminService.denyUser(username)
        .then(results => actions.setUsers(results.users))
        .catch(err => {
            actions.setUsers({})
            dispatch.auth.logout()
        })
})


const actions = {
    setUsers,
    getUsers,
    setHistory,
    getHistory,
    approveUser,
    denyUser,
}

const model = { ...initialState, ...actions }


export default model

