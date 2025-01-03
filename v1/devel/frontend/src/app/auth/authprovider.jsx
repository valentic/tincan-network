import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '~/services'
import { LoadingOverlay } from '@mantine/core'
import { PropTypes } from 'prop-types'

import { AuthContext } from './authcontext'

const AuthProvider = ({ children }) => {
    
    const navigate = useNavigate()
    const location = useLocation()
    const [ profile, setProfile ] = useState()
    const [ ready, setReady ] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => { 
            if (authService.hasToken()) {
                await authService.getProfile().then(data => {
                    setProfile(data)
                }).catch(() => {
                    authService.logout()
                })
            }
            
            setReady(true)
        }

        fetchProfile()

    },[])    

    const login = async (payload) => {
        const data = await authService.login(payload)
        setProfile(data)

        if (data) {
            const origin = location.state?.from?.pathname || '/admin'
            navigate(origin,{replace:true})
        } 

        return data
    }

    const logout = () => {
        authService.logout()
        setProfile()
        navigate('/')
    }

    const hasRole = (...roles) => {    
        if (loggedIn()) {
            return roles.includes(profile.role)
        }

        return false
    }

    const loggedIn = () => {
        return !!profile
    }

    const value = {
        profile,
        hasRole,
        loggedIn,
        login,
        logout
    }

    return (
      <AuthContext.Provider value={value}>
        { ready ? children : <LoadingOverlay visible /> } 
      </AuthContext.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export { AuthProvider }

