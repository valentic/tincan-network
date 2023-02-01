import React from 'react'

import { 
    Container, 
    Text,
    Title,
    Table
    } from '@mantine/core'

const Software = () => {

    const repos = [
        {
            name:   'MCS',
            desc:   'MANGO Camera System (MCS) embedded system build package',
            url:    'https://github.com/valentic/mango-mcs'
        },
        {
            name:   'Network server',
            desc:   'Data Transport application for the MANGO network server',
            url:    'https://github.com/valentic/mango-network-transport'
        },
        {
            name:   'Data server',
            desc:   'Data Transport application for the MANGO data server',
            url:    'https://github.com/valentic/mango-dataserver-transport'
        },
        {
            name:   'MANGO website',
            desc:   'Web application for the MANGO camera network',
            url:    'https://github.com/valentic/mango-network-website'
        },
        {
            name:   'Raw image processing',
            desc:   'Low level MANGO data processing',
            url:    'https://github.com/mangonetwork/raw-image-processing'
        },
    ]

    const rows = repos.map(repo => (
        <tr key={repo.name}>
          <td>
            <a href={repo.url} target="_blank" rel="noreferrer">
              {repo.name}
            </a>  
          </td>
          <td>
            <Text>{repo.desc}</Text>
          </td>
        </tr>
    )) 

    return (
      <Container my="2em" size="md">

        <Title color="slate"> Software </Title>

        <Table striped mt="1em">
          <thead>
            <tr>
              <th>GitHub Repo</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            { rows }
          </tbody>
        </Table>

      </Container>
    )
}

export { Software }
