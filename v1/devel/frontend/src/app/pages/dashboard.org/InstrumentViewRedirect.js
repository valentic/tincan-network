//////////////////////////////////////////////////////////////////////////
//
//  InstrumentViewRedirect
//
//  Shown when only the station/instrument is present in the path. It 
//  redirects to the date of the last data record. 
//
//  2022-07-29  Todd Valentic
//              Initial implementation
//
//////////////////////////////////////////////////////////////////////////

import React from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiService } from 'services'
import { DateTime } from 'luxon'

import { Container } from '@mantine/core'

const InstrumentViewRedirect = () => {

    const params = useParams()
    const station = params.station 
    const instrument = params.instrument

    const query = useQuery(['quicklooks',station,instrument],
        () => apiService.getQuicklooks(station, instrument),
        {
            retry: (count, { response }) => response.status !== 404
        })

    if (query.isError) {
        return <Navigate to="/dashboard" replace/>
    }

    if (query.isSuccess) {

        if (query.data?.quicklooks.length>0) {
            const quicklooks = query.data.quicklooks
            const jsdate = quicklooks[quicklooks.length-1].timestamp
            const dt = DateTime.fromJSDate(jsdate, { zone: 'UTC' })
            const path = dt.toISODate()
            return <Navigate to={`./${path}`} />
        } else {
            return <Navigate to='/dashboard' replace/>
        }
    }

    return (
        <Container>
            Waiting for data
        </Container>
    )
}

export { InstrumentViewRedirect }

