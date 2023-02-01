import React from 'react'
import { useQueries } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
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
    useMantineTheme
} from '@mantine/core'

const Sites = () => {

    const theme = useMantineTheme()
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
            }
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

        const lat = meshnodes[station.name]?.latitude
        const lon = meshnodes[station.name]?.longitude
        const cameraNames = cameras.filter(c => c.station === station.name)
                                .map(c => 
                                    <Text key={c.instrument} 
                                          align="right" 
                                          color="gray.7"
                                    >
                                      {print.capitalize(c.instrument)}
                                    </Text>
                                    )

        return (
            <tr key={station.id} 
                onMouseEnter={() => setHoverStation(station.name)}
                onMouseLeave={() => setHoverStation(undefined)}
            >
              <td>
                <Text weight={700} size="sm">
                  {station.name.toUpperCase()}
                </Text>
                <Text color={theme.colors.gray[7]}> 
                  {station.label}
                </Text>
              </td>
              <td>
                <Text align="right" size="11" color="gray.7"> 
                  {print.as_latitude_deg(lat)}
                  <br/> 
                  {print.as_longitude_deg(lon)}
                 </Text>
              </td>
              <td>{cameraNames}</td>
              <td>
                <Text align="right" color="gray.7"> 
                  {print.capitalize(station.status)}
                </Text>
              </td>
            </tr>
        )
    })

    return (
        <Container my="2em" size="xl">
          <Grid>
            <Grid.Col sm={6} order={2} orderSm={1}>
              <Paper withBorder>
                <Table highlightOnHover verticalSpacing="5" fontSize="xs"> 
                  <thead>
                    <tr>
                      <th>Site</th>
                      <th style={{textAlign: 'right'}}>Coordinates</th>
                      <th>Cameras</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>{rows}</tbody>
                </Table>
              </Paper>
            </Grid.Col>
            <Grid.Col sm={6} order={1} orderSm={2}>
              <StationMap 
                sites={meshnodes} 
                cameras={cameras}
                active={hoverStation}
                setActive={setHoverStation}
              />
            </Grid.Col>
          </Grid>

          <Outlet />
        </Container>
    )
}

export { Sites }
