import { Outlet } from 'react-router-dom'
import { Box } from '@mantine/core'

import { useAuth } from '~/app'

import { Header } from './header'
import { Footer } from './footer'
import classes from './layout.module.css'

const Layout = () => {

    const auth = useAuth()

    /*
    const submenu = [
        { label: 'Home',        link: '/'           },
        { label: 'Contacts',    link: '/contacts'   }
    ]
    */

    let links = [
        { label: 'Home',        link: '/'           },
        { label: 'About Us',    link: '/about'      },
        { label: 'Contact',     link: '/contact'    },
    ]

    if (auth.loggedIn()) {
        links.push({link: '/admin',     label: 'Dashboard'  })
        links.push({link: '/logout',    label: 'Sign out' })
    }
    
    return (
        <Box className={classes.page}> 
          <Header links={links} /> 
          <main className={classes.main}> 
            <section className={classes.section} > 
              <Outlet />
            </section>
          </main>
          <Footer /> 
        </Box>
    )
}

export { Layout }
