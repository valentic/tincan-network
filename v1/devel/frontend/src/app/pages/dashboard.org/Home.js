import React from 'react'
import { Outlet } from 'react-router-dom'

import {
    Container,
} from '@mantine/core'

const Home = () => {

    return (
        <Container sx={{ flexGrow: 1 }} my="2em" size="xl">
          <Outlet />
        </Container>
    )
}

export { Home }

