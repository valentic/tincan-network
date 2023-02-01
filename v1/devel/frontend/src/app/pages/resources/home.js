import React from 'react'
import { Outlet } from 'react-router-dom'

import {
    Container,
} from '@mantine/core'

const Home = () => {

    return (
        <Container my="1em" size="md">
          <Outlet />
        </Container>
    )
}

export { Home }

