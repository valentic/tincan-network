import React from 'react'
import image from './icon_emissions.png'

import { 
    Container, 
    Text,
    Title,
    Grid,
    Image,
    MediaQuery
    } from '@mantine/core'

const Science = () => {

    return (
      <Container my="2em" size="md">
        <Title color="slate"> Science </Title>
        <Grid gutter={60} justify="center">
          <Grid.Col xs={6}>

            <MediaQuery largerThan="xs" styles={{display: 'none'}}>
              <Image radius="sm" src={image} alt="Icon Emissions" />
            </MediaQuery>

            <Text size="sm" my="md" align="justify">
                The Midlatitude Allsky-imaging Network for GeoSpace
                Observations (MANGO) is a collection of cameras spread
                across the continental United States with the goal of
                imaging large-scale airglow and aurora features. MANGO
                will be used to observe the generation, propagation, and
                dissipation of medium and large-scale wave activity in
                the subauroral, mid and low-latitude thermosphere. This
                network is actively being deployed and will ultimately
                consist of nine all-sky imagers. These imagers form a
                network providing continuous coverage over the western
                United States, including California, Oregon, Washington,
                Utah, Arizona and Texas extending south into Mexico. This
                network sees high levels of both medium and large scale
                wave activity.
            </Text>

            <Text size="sm" my="md" align="justify">
                The oxygen-related 630-nm airglow has long been used to
                characterize processes in the upper atmosphere. We use
                a network of all-sky imagers in across the continental
                United States to study  propagating waves in the upper
                atmosphere, called traveling ionospheric disturbances
                (TIDs) and expansion in the auroral oval over low
                latitudes, called stable auroral red (SAR) arcs, which
                occur during extreme geomagnetic conditions. Although
                these phenomena span continents, optical observations
                over North America have been conducted only at isolated
                camera sites, and a global-scale view is currently
                lacking. An all-sky camera has a maximum field-of-view
                of 1200-1500 km2 at ionospheric altitudes between 250 and
                350 km, making this instrument an excellent ground-based
                observing tool to monitor large-scale dynamics in the
                ionosphere. The combined view from multiple cameras can
                be used to image continent-scale structures and provides
                an unprecedented coverage of ionospheric airglow dynamics
                in the Western United States.
            </Text>

            <Text size="sm" my="md" align="justify">
                Each camera in the MANGO network has a red filter centered
                at 630 nm with a view of the entire sky. Designed for
                low-cost ease of replication, each system is configured
                entirely from off-the shelf parts with an amateur
                astronomy-grade camera as the detector. Images are
                acquired every five minutes and are stitched together
                to provide a mosaic view of airglow across the entire
                United States.
            </Text> 

          </Grid.Col> 

          <Grid.Col xs={6}>
            <MediaQuery smallerThan="sm" styles={{display: 'none'}}>
              <Image radius="sm" src={image} alt="Icon Emissions" />
            </MediaQuery>
          </Grid.Col>
        </Grid>
      </Container>
    )
}

export { Science }
