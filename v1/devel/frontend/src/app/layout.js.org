import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box, createStyles } from '@mantine/core'

import { AppHeader } from './header'
import { AppFooter } from './footer'
import { useAuth } from 'app'

const useStyles = createStyles((theme) => {

    return {

        page: {
            height: '100vh',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: 'auto 1fr auto',
            gridTemplateAreas: "'header' 'main' 'footer'",
        },

        header: {
            gridArea: 'header'
        },

        main: {
            gridArea: 'main',
            overflow: 'auto',
            backgroundColor: '#f5f7fb'
        },

        footer: {
            gridArea: 'footer'
        }
    }
})

const Layout = () => {

    const { classes } = useStyles()
    const auth = useAuth()

    const resourcesMenu = [
        { label: 'Software',        link:   '/resources/software' },
        { label: 'Mail Lists',      link:   '/resources/maillists' },
        { label: 'Publications',    link:  '/resources/publications' },
        ]

    const aboutMenu = [
        { label: 'Science',         link:   '/about/science' },
        { label: 'Instrument',      link:   '/about/instrument' },
        { label: 'Sites',           link:   '/about/sites' }
        ]

    let links = [
        { label: 'Home',        link: '/' },
        { label: 'About',       menu: aboutMenu },
        { label: 'Resources',   menu: resourcesMenu },
        { label: 'Database',    link: '/database' },
        { label: 'Contact Us',  link: '/contacts' },
        ]

    if (auth.loggedIn()) {
        links.push({link: '/admin',     label: 'Dashboard'  })
        links.push({link: '/logout',    label: 'Sign out' })
    }
    
    return (
        <Box className={classes.page}> 
          <AppHeader className={classes.header} links={links} /> 
          <main className={classes.main}> 
            <section className={classes.section} > 
              <Outlet />
            </section>
          </main>
          <AppFooter className={classes.footer}/> 
        </Box>
    )
}

export { Layout }
