import { useDisclosure } from '@mantine/hooks'
import { NavLink } from 'react-router-dom'
import classes from './header.module.css'
import { IconChevronDown } from '@tabler/icons-react'
import { PropTypes } from 'prop-types'

import { 
    Burger, 
    Center,
    Container,
    Group, 
    Menu,
    Text,
    } from '@mantine/core'

const Header = ({ links }) => {

    const [opened, { toggle } ] = useDisclosure(false)

    const items = links.map((link) => {

        const menuItems = link.links?.map((item) => (
            <Menu.Item key={item.link}>
              <NavLink to={item.link} replace className={classes.menuLink}>
                {item.label}
              </NavLink>
            </Menu.Item>
        ))

        if (menuItems) {
            return (
              <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
                <Menu.Target>
                  <a
                    href={link.link}
                    className={classes.link}
                    onClick={(event) => event.preventDefault()}
                  >
                    <Center>
                      <span className={classes.linkLabel}>{link.label}</span>
                      <IconChevronDown size="0.9rem" stroke={1.5} />
                    </Center>
                  </a>
                </Menu.Target>
                <Menu.Dropdown>{menuItems}</Menu.Dropdown>
              </Menu>
            )
        }

        return (
          <NavLink
            key={link.label}
            to={link.link}
            replace
            className={classes.link}
          >
            {link.label}
          </NavLink>
        )
    })

    return (
      <header className={classes.header}>
        <Container size="md">
          <div className={classes.inner}>
            <Text size="lg" fw={700}>{import.meta.env.VITE_TITLE}</Text>
            <Group gap={5} visibleFrom="sm">{items}</Group>
            <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
          </div>
        </Container>
      </header>
    )
}

Header.propTypes = {
    links: PropTypes.arrayOf(PropTypes.object)
}

export { Header }
