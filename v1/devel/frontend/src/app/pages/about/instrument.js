import React from 'react'
import hco from './mango-hco.png'
import crf from './mango-crf.png'

import { 
    Container, 
    Title,
    Grid,
    Image,
    Table,
    Paper,
    createStyles,
    } from '@mantine/core'

const useStyles = createStyles((theme) => ({
    specs: {
        '& tbody tr td:first-of-type': {
            fontWeight: 700
        }
    }
}))

const Instrument = () => {

    const { classes } = useStyles()
    
    return (
      <Container my="2em" size="md">
        <Title color="slate"> Instrument </Title>

        <Grid gutter={30} justify="center" >
          <Grid.Col xs={7}>
            <Image radius="sm" src={hco} alt="Hat Creek Observatory" />

            <Paper withBorder mt="2em">

            <Table verticalSpacing="xs" fontSize="xs" striped className={classes.specs}>
              <thead></thead>
              <tbody>
                <tr>
                  <td className={classes.header}>Camera</td>
                  <td>Atik 314L+ Monochrome
                      <br />
                      Atik 414EX Monochrome
                  </td>
                </tr>

                <tr>
                  <td className={classes.header}>Overall system</td>
                  <td>F/7 35mm imaged on 1&Prime; CCD</td>
                </tr>
                
                <tr>
                  <td className={classes.header}>Filter (Red line)</td>
                  <td>2nm bandwidth centered at 630.3nm</td>
                </tr>

                <tr>
                  <td className={classes.header}>Filter (Green line)</td>
                  <td>2nm bandwidth centered at 557.7nm</td>
                </tr>

                <tr>
                  <td className={classes.header}>Power requirement</td>
                  <td>12V 0.8A</td>
                </tr>
                
                <tr>
                  <td>Cooling</td>
                  <td>Thermoelectric 25&deg;C below ambient
                      <br/>
                      Typical target temperature: -5&deg;C
                  </td>
                </tr>

                <tr>
                  <td>Exposure time (Red line)</td>
                  <td>4 minutes with 2x2 binning optimal</td>
                </tr>

                <tr>
                  <td>Exposure time (Green line)</td>
                  <td>2 minutes with 2x2 binning optimal</td>
                </tr>

              </tbody>
            </Table>
            </Paper>

          </Grid.Col>
          <Grid.Col xs={5}>
            <Image radius="sm" src={crf} alt="Capitol Reef Field Station" />
          </Grid.Col>
        </Grid>

      </Container>
    )
}

export { Instrument }
