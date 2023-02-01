import React from 'react'
import { NavLink } from 'react-router-dom'

import { 
    IconLogout,
    IconLogin,
    IconUserCircle
} from '@tabler/icons'

import { 
    Navbar,
    Stack,
    Tooltip,
    UnstyledButton,
    createStyles 
} from '@mantine/core'

import { useAuth } from 'app'

const useStyles = createStyles((theme) => {
    
    const variant = theme.fn.variant({
                        variant: 'filled', 
                        color: theme.primarColor })

    return {

        navbar: {
            backgroundColor: variant.background 
        },

        link: {
            width: 50,
            height: 30,
            borderRadius: theme.radius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.white,
            opacity: 0.85,

            '&:hover': {
                opacity: 1,
                backgroundColor: theme.fn.lighten(variant.background, 0.1)
            }
        }
    }
})

const NavbarLink = ({icon: Icon, label, link}) => {
    const { classes } = useStyles()

    return (
        <NavLink to={link} replace> 
          <Tooltip label={label} position="right" transitionDuration={0}>
            <UnstyledButton>
              <Icon stroke={1.5} className={classes.link} /> 
            </UnstyledButton>
          </Tooltip>
        </NavLink>
    )
}

const AppNavbar = ({links}) => {

    const { classes } = useStyles()
    const auth = useAuth()

    let authlinks = []

    if (auth.loggedIn()) {
        authlinks.push({icon: IconUserCircle,   link: '/account',   label: 'Account'  })
        authlinks.push({icon: IconLogout,       link: '/logout',    label: 'Sign out' })
    } else {
        authlinks.push({icon: IconLogin,    link: '/login',     label: 'Sign in' })
    }

    const items = links.map((entry) => (
        <NavbarLink key={entry.label} {...entry} />
    ))

    const authitems = authlinks.map((entry) => (
        <NavbarLink key={entry.label} {...entry} />
    ))

    return ( 
        <Navbar width={{ base: 80 }} p="md" className={classes.navbar} >
          <Navbar.Section grow >
            {items}
          </Navbar.Section>

          <Navbar.Section>
            <Stack justify="center" spacing={0}>
              { authitems }
            </Stack>
          </Navbar.Section>

        </Navbar>
    )
    
}

export { AppNavbar }
