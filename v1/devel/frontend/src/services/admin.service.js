import { authService } from 'services'
import axios from 'axios'

const BASEURL = window.location.origin+process.env.REACT_APP_ADMIN_URL

const axios_admin = axios.create({
    baseURL:    BASEURL,
    })

axios_admin.interceptors.request.use(config => {
    config.headers = { ...config.headers, ...authService.authHeader() }
    return config
    }
)

const getUsers = async () => {
    const response = await axios_admin.get('/users')
    return response.data
}

const getUser = async ({ queryKey }) => {
    /* eslint-disable no-unused-vars */
    const [_key, { id }] = queryKey
    const response = await axios_admin.get(`/users/${id}`)
    return response.data
}

const createUser = async (payload) => {
    const response = await axios_admin.post('/users', payload) 
    return response.data
}

const updateUser = async (payload) => {
    const response = await axios_admin.patch(`/users/${payload.id}`, payload) 
    return response.data
}

const deleteUser = async (id) => {
    const response = await axios_admin.delete(`/users/${id}`) 
    return response.data
}

const getRoles = async () => {
    const response = await axios_admin.get('/roles')
    return response.data
}


const getPending = async () => {
    const response = await axios_admin.get('/pending')
    return response.data
}

const getHistory = async () => {
    const response = await axios_admin.get('/history')
    return response.data
}

const getApplications = async () => {
    const response = await axios_admin.get('/applications')
    return response.data
}

const updateApplication = async (payload) => {
    const response = await axios_admin.patch(`/applications/${payload.id}`, payload) 
    return response.data
}

export const adminService = {
    getUsers,
    getUser,
    getRoles,
    getPending,
    getHistory,
    getApplications,
    updateApplication,
    createUser,
    updateUser,
    deleteUser
}


