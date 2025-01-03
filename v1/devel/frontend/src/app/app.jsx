import { 
    Routes, 
    Route, 
    Navigate, 
    Outlet, 
    useLocation 
} from 'react-router-dom'
import { PropTypes } from 'prop-types'

import { Layout } from './layout'
import * as Page from './pages'
//import { useAuth } from './auth'

const ProtectedRoute = ({
    isAllowed,
    redirectPath = '/login',
    children
}) => {
    const location = useLocation()

    if (!isAllowed) {
        return <Navigate to={redirectPath} replace state={{ from: location }} />
    }

    return children ? children : <Outlet /> 
}

ProtectedRoute.propTypes = {
    isAllowed: PropTypes.bool.isRequired,
    redirectPath: PropTypes.string,
    children: PropTypes.node
}

const App = () => {
    
    return (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Page.Home />} />
            <Route path="login" element={<Page.Auth.Login />} />
            <Route path="logout" element={<Page.Auth.Logout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
    )
}

/*
const AppOrg = () => {

    const auth = useAuth()
    const is_admin = auth.hasRole('admin')
    const is_manager = auth.hasRole('manager')
    const is_member = auth.hasRole('member') 

    return (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Page.Home />} />
            <Route path="login" element={<Page.Auth.Login />} />
            <Route path="logout" element={<Page.Auth.Logout />} />
            <Route element={<ProtectedRoute isAllowed={is_member || is_manager || is_admin} />}>
              <Route path="dashboard" element={<Page.Dashboard.Home />} /> 
                <Route path="nodes">
                  <Route index element={<Page.Dashboard.Nodes.List />} />
                </Route>
                <Route index element={<Navigate to="nodes" replace />} />
              </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
    )
}
*/

export { App } 
