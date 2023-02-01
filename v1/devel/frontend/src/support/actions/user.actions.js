
import { store } from 'support/helpers'

const login = (username,password) => {
    store.dispatch.authentication.login({username,password})
}

const logout = () => {
    store.dispatch.authentication.logout()
}

const signup = (firstname,lastname,email) => {  
    store.dispatch.authentication.signup({firstname,lastname,email})
}

const profile = () => {
    store.dispatch.authentication.getUserProfile()
}

export const userActions = {
    login,
    logout,
    signup,
    profile 
}
