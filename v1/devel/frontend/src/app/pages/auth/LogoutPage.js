import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from 'app/auth'

const LogoutPage = () => {
    const auth = useAuth() 

    useEffect(() => { 
        auth.logout()
    },[auth])

    return ( <Navigate to="/home" /> )
}

export { LogoutPage }
