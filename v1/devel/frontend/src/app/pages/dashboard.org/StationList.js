import React from 'react'
import { useQueries } from '@tanstack/react-query'
import { Outlet, useNavigate } from 'react-router-dom'
import { apiService } from 'services'
import { StationMap } from './StationMap'
import { print } from 'support/helpers/print_kit'
import { RetiredStations } from 'support/assets/retiredstations'

import {
    Container,
    Title,
    LoadingOverlay,
    Table,
    Grid,
    Text,
    Paper,
    createStyles,
} from '@mantine/core'

const useStyles = createStyles((theme) => {

    return {
        row: {
            cursor: 'pointer'
        }
    }
})

const Heartbeat = ({jsdate, status}) => {

    let msg = '--'
    let color = 'gray.7' 

    if (status === 'retired') {
        msg = 'Retired'
    } else if (print.not_set(jsdate)) {
        msg = 'Unknown'
    } else {
        const minutes = 60
        const hour = 60*minutes
        const elapsed = (Date.now() - jsdate.getTime())/1000
        if (elapsed > hour) {
            color = 'red.9'
        } else if (elapsed > 10*minutes) {
            color = 'yellow.8'
        }
        msg = <> 
              {print.as_moment(jsdate, 'YYYY-MM-DD')}
              <br /> 
              {print.as_moment(jsdate, 'HH:mm')} UTC
              <br /> 
              {print.capitalize(print.as_fromnow(jsdate))}
              </>
    }

    return (
        <Text align="right" size={11} color={color}>
          {msg}
        </Text>
    )
}

const StationList = () => {

    const navigate = useNavigate()
    const { classes } = useStyles()
    const [ hoverStation, setHoverStation ] = React.useState(undefined)

    const refetchInterval = 60*1000     // 60 seconds

    const results = useQueries({
        queries: [
            { 
                queryKey: ['stations'], 
                queryFn: apiService.getStations,
                refetchInterval: refetchInterval
            },
            { 
                queryKey: ['meshnodes'], 
                queryFn: apiService.getMeshNodes, 
                refetchInterval: refetchInterval
            },
            { 
                queryKey: ['cameras'], 
                queryFn: apiService.getCameras, 
                refetchInterval: refetchInterval
            },
        ]
    })

    if (results.some(query => query.isLoading)) {
        return <LoadingOverlay visible={true} />
    }

    if (results.some(query => query.isError)) {
        // Show first error message
        const badQuery = results.filter(query => query.isError)[0]
        return (
            <Container>
                <Title>Problem Detected</Title>
                <Text>{badQuery.error.message}</Text> 
            </Container>
        )
    }

    const stations = results[0].data.stations
    const cameras = results[2].data.cameras
    const retirednodes = RetiredStations.reduce((a,v) => ({...a, [v.name]: v}), {})

    const stationnodes = results[1].data.meshnodes.filter(
        node => stations.some(station => station.name === node.name)
        )

    const meshnodes = stationnodes.reduce(
        (a,v) => ({...a, [v.name]: v}),
        retirednodes)

    const rows = stations.map((station) => {

        const showDetails = () => navigate(station.name)
        const lat = meshnodes[station.name]?.latitude
        const lon = meshnodes[station.name]?.longitude
        const heartbeat = meshnodes[station.name]?.checked_on
        const status = station.status

        const cameraNames = 
                    cameras
                    .filter(camera => camera.station === station.name)
                    .map(camera => 
                        <Text key={camera.instrument}
                              align="right"
                              color="gray.7"
                        >
                          {print.capitalize(camera.instrument)}&nbsp;camera
                        </Text>
                    )

        return (
            <tr key={station.id} 
                onClick={showDetails} 
                onMouseEnter={() => setHoverStation(station.name)}
                onMouseLeave={() => setHoverStation(undefined)}
                className={classes.row}
            >
              <td>
                <Text weight={700} size="sm">
                  {station.name.toUpperCase()}
                </Text>
                <Text color="gray.7">
                  {station.label}
                </Text>
                <Text color="gray.7"> 
                  {print.as_latitude_deg(lat)}
                  {", "} 
                  {print.as_longitude_deg(lon)}
                 </Text>
              </td>
              <td>
                {cameraNames}
              </td>
              <td>
                <Heartbeat jsdate={heartbeat} status={status} />
              </td>
            </tr>
        )
    })

    return (
        <>
          <Grid>
            <Grid.Col sm={6} order={2} orderSm={1}>
              <Paper withBorder>
                <Table highlightOnHover verticalSpacing="5" fontSize="xs"> 
                  <thead>
                    <tr>
                      <th>Site</th>
                      <th style={{textAlign: 'right'}}>Instruments</th>
                      <th style={{textAlign: 'right'}}>Heartbeat</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
              </Paper>
            </Grid.Col>
            <Grid.Col sm={6} order={1} orderSm={2}>
              <StationMap 
                sites={meshnodes} 
                active={hoverStation}
                setActive={setHoverStation}
              />
            </Grid.Col>
          </Grid>

          <Outlet />
        </>
    )
}

export { StationList }
