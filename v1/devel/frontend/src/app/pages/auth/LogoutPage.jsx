import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '~/app'

const LogoutPage = () => {
    const auth = useAuth() 

    useEffect(() => { 
        auth.logout()
    },[auth])

    return ( <Navigate to="/home" /> )
}

export { LogoutPage }
