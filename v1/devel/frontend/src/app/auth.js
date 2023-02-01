import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from 'services'
import { LoadingOverlay } from '@mantine/core'

const AuthContext = React.createContext(null)

const useAuth = () => {
    return React.useContext(AuthContext)
}

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
                }).catch(e => {
                    authService.logout()
                })
            }
            
            setReady(true)
        }

        fetchProfile()

    },[])    

    const login = async (payload) => {
        const data = await authService.login(payload)
        console.log('auth provider, data',data)
        setProfile(data)

        if (data) {
            const origin = location.state?.from?.pathname || '/admin'
            console.log('origin',origin)
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

export { AuthContext, useAuth, AuthProvider }

