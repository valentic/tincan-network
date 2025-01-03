import React from 'react'

import { 
    IconSun, 
    IconMoonStars,
} from '@tabler/icons'

import { 
    ActionIcon,
    Group,
    Header,
    useMantineColorScheme
} from '@mantine/core'

const AppHeader = ({logo: Logo}) => {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme()

    return (
        <Header height={60} p="xs">
          <Group sx={{height: '100%' }} px={20} position="apart">
            <Logo colorScheme={colorScheme} />
            <ActionIcon variant="default" onClick={() => toggleColorScheme()} size={30}>
              { colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoonStars size={16} />}
            </ActionIcon>
          </Group>
        </Header>
    )

}

export { AppHeader }
