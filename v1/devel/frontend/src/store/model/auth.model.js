import { action, thunk } from 'easy-peasy'
import { authService } from 'services'

const initialState = {
    user: undefined,
    profile: undefined,
    loginState: undefined,
    signupState: undefined,
    forgotPasswordState: undefined,
    forgotUsernameState: undefined,
    resetPasswordState: undefined,
}

const success = action((state,payload) => {
    state.user = payload.user
    state.profile = payload.profile
})

const failure = action((state,payload) => {
    authService.logout()
    state.user = undefined
    state.profile = undefined
})

const logout = action((state,payload) => {
    authService.logout()
    state.user = undefined
    state.profile = undefined
})

const bootstrap = thunk(async (actions,payload) => {
    const user = authService.getToken()

    if (user) {
        try {
            const profile = await authService.getProfile()
            actions.success({user,profile})
        } catch(err) {
            actions.failure()
        }
    }
})

const setLoginState = action((state,payload) => {
    state.loginState = payload
})

const login = thunk(async (actions,payload) => {
    
    const { username, password } = payload

    try {
        const user = await authService.login(username,password)
        const profile = await authService.getProfile()
        actions.success({user,profile})
        actions.setLoginState(true)
    } catch(err) {
        actions.failure()
        actions.setLoginState(false)
    }

})

const setSignupState = action((state,payload) => {
    state.signupState = payload
})

const signup = thunk(async (actions,payload) => {
    
    try {
        await authService.signup(payload)
        actions.setSignupState(true)
    } catch(err) {
        actions.setSignupState(false)
    }

    return {}

})

const setForgotUsernameState = action((state,payload) => {
    state.forgotUsernameState = payload
})

const forgotUsername = thunk(async (actions,payload) => {
    
    const { email } = payload

    try { 
        await authService.forgotUsername(email)
        actions.setForgotUsernameState(true)
    } catch(err) {
        actions.setForgotUsernameState(false)
    }

    return {}
})

const setForgotPasswordState = action((state,payload) => {
    state.forgotPasswordState = payload
})

const forgotPassword = thunk(async (actions,payload) => {
    
    const { username } = payload

    try {
        await authService.forgotPassword(username)
        actions.setForgotPasswordState(true)
    } catch(err) {
        actions.setForgotPasswordState(false)
    }
})

const setResetPasswordState = action((state,payload) => {
    state.resetPasswordState = payload
})

const resetPassword = thunk(async (actions,payload) => {
    
    const { password, token } = payload

    try {
        await authService.resetPassword(password,token)
        actions.setResetPasswordState(true)
    } catch(err) {
        actions.setResetPasswordState(false)
    }
})


const actions = {
    success,
    failure,
    login,
    logout,
    signup,
    setSignupState,
    setForgotPasswordState,
    setForgotUsernameState,
    setResetPasswordState,
    setLoginState,
    forgotUsername,
    forgotPassword,
    resetPassword,
    bootstrap
}

const model = { ...initialState, ...actions }


export default model

