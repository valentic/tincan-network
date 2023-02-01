import React from 'react'
import { Center, Text } from '@mantine/core'
import { IconGizmo } from '@tabler/icons'

const Logo = () => (
    <Center inline>
      <IconGizmo stroke={2}/>
      <Text fw={700} tt="uppercase" fz="xl" pl="sm">
        { process.env.REACT_APP_TITLE } 
      </Text>
    </Center>
)

export { Logo }
