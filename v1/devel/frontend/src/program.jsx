import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

import { MultiProvider } from '~/support/helpers'

import { App, AuthProvider } from '~/app'

const Program = () => {

    const queryClient = new QueryClient()

    const providers = [
        <React.StrictMode key="react"/>,
        <BrowserRouter basename={import.meta.env.VITE_ROOT_URL} key="3"/>,
        <MantineProvider defaultColorScheme="dark" key="4"/>,
        <ModalsProvider key="5"/>,
        <QueryClientProvider client={queryClient} key="6"/>,
        <AuthProvider key="7"/>
    ]

    return (
      <MultiProvider providers={providers}>
        <Notifications />
        <App />
      </MultiProvider>
    )
}

export { Program }
