import axios from 'axios'

const BASEURL = window.location.origin+process.env.REACT_APP_API_URL

const axios_api = axios.create({
    baseURL:    BASEURL,
    })

const getMeshGroups = async () => {
    const response = await axios_api.get('/mesh/groups')
    return response.data
}

const getMeshNodes = async () => {

    const response = await axios_api.get('/mesh/nodes')

    const result = response.data.map(entry => {
        entry.created_on = new Date(entry.created_on)
        entry.updated_on = new Date(entry.updated_on)
        entry.checked_on = new Date(entry.checked_on)
        return entry
    })

    response.data = result

    return response.data
}

export const apiService = {
    getMeshGroups,
    getMeshNodes,
}

