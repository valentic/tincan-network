import React from 'react'
import { useQueries } from '@tanstack/react-query'
import { Outlet, useNavigate } from 'react-router-dom'
import { apiService } from 'services'
import { print } from 'support/helpers/print_kit'

import {
    Container,
    Title,
    LoadingOverlay,
    Table,
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

const NodeList = () => {

    const navigate = useNavigate()
    const { classes } = useStyles()

    const refetchInterval = 60*1000     // 60 seconds

    const results = useQueries({
        queries: [
            { 
                queryKey: ['meshnodes'], 
                queryFn: apiService.getMeshNodes, 
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

    const meshnodes = results[0].data

    const rows = meshnodes.map((node) => {

        const showDetails = () => navigate(node.name)
        const heartbeat = node.checked_on

        return (
            <tr key={node.id} 
                onClick={showDetails} 
                className={classes.row}
            >
              <td>
                <Text weight={700} size="sm">
                  {node.name.toUpperCase()}
                </Text>
                <Text color="gray.7">
                  {node.label}
                </Text>
                <Text color="gray.7"> 
                  {print.as_latitude_deg(node.latitude)}
                  {", "} 
                  {print.as_longitude_deg(node.longitude)}
                 </Text>
              </td>
              <td> {node.uuid} </td>
              <td> { node.pending ? "Pending" : node.active ? "Active" : "" } </td> 
              <td>
                <Heartbeat jsdate={heartbeat} status="active"/>
              </td>
            </tr>
        )
    })

    return (
      <>
        <Paper withBorder>
          <Table highlightOnHover verticalSpacing="5" fontSize="xs"> 
            <thead>
              <tr>
                <th>Mesh Node</th>
                <th>UUID</th>
                <th>Status</th>
                <th style={{textAlign: 'right'}}>Heartbeat</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </Paper>

        <Outlet />
      </>
    )
}

export { NodeList }
