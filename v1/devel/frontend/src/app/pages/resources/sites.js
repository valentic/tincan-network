import React from 'react'

import { 
    Container, 
    Text,
    Title,
    Grid
    } from '@mantine/core'

const Sites = () => {

    return (
      <Container my="2em" size="md">
        <Title color="slate"> Sites </Title>

        <Grid gutter={60} justify="center">
          <Grid.Col span={6}>
            <Text size="sm" my="md" align="justify">
                Site stuff
            </Text>
            </Grid.Col> 
            <Grid.Col span={6}>
                Site stuff
            </Grid.Col>
          </Grid>
      </Container>
    )
}

export { Sites }
