import axios from 'axios'

const BASEURL = window.location.origin+process.env.REACT_APP_AUTH_URL
const TOKEN = 'user'

export const authService = {
    login,
    logout,
    signup,
    forgotUsername,
    forgotPassword,
    resetPassword,
    loggedIn,
    getProfile,
    getToken,
    hasToken,
    authHeader
}

const axios_auth = axios.create({
    baseURL: BASEURL
    })

axios_auth.interceptors.request.use(config => {
    config.headers = { ...config.headers, ...authHeader() }
    return config
})

// Manage user token ----------------------------------------------------- 

function loggedIn() {
    return localStorage.getItem(TOKEN) ? true : false
}

function getToken() {
    return JSON.parse(localStorage.getItem(TOKEN))
}

function setToken(data) {
    return localStorage.setItem(TOKEN,JSON.stringify(data))
}

function hasToken() {
    return !!getToken()
}

function removeToken() {
    localStorage.removeItem(TOKEN)
}

// Authorization header -------------------------------------------------- 

function authHeader() {
    const user = getToken()

    if (user && user.access_token) {
        return { 'Authorization': 'bearer ' + user.access_token }
    } else {
        return {} 
    }
}

// API Calls ------------------------------------------------------------- 

async function login({username, password}) {

    const response = await axios_auth.post('/login',{ username, password })
    const token = response.data

    setToken(token)

    return getProfile() 
}

async function getProfile() {
    const response = await axios_auth.get('/profile')
    return response.data 
}

async function signup(payload) {
    const response = await axios_auth.post('/signup', payload)
    return response.data 
}

async function forgotUsername(email) {
    const response = await axios_auth.post('/forgot_username', { email })
    return response.data 
}

async function forgotPassword(username) {
    const response = await axios_auth.post('/forgot_password', { username })
    return response.data 
}

async function resetPassword(password,token) {
    const response = await axios_auth.post('/reset_password', {password, token})
    return response.data 
}

function logout() {
    removeToken() 
}

