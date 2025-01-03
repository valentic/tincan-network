import React from 'react'
import { Outlet } from 'react-router-dom'

import { 
    AppShell
} from '@mantine/core'

import { Logo } from './logo'
import { Links } from './links'
import { AppHeader } from './header'
import { AppNavbar } from './navbar'

const Layout = () => {

    const header = <AppHeader logo={Logo} /> 
    const navbar = <AppNavbar links={Links} />

    return (
        <AppShell padding="md" navbar={navbar} header={header}> 
          <Outlet />
        </AppShell>
    )
}

export { Layout }
