import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'

import geoUrl from 'support/assets/states-10m.json'
//import { getElapsed } from './GetElapsed'

import {
    useMantineTheme,
    createStyles
} from '@mantine/core'

const useStyles = createStyles((theme) => {
    return {
        marker: {
            cursor: 'pointer'
        }
    }
})

const StationMap = ({sites, active, setActive}) => {

    const theme = useMantineTheme()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const minute = 60
    const hour = 60*minute

    const markers = Object.values(sites).map(site => {
        const coord = [site.longitude, site.latitude]
        const size = site.name === active ? 8 : 6

        let fill=theme.colors.gray[5]
        let stroke = theme.colors.gray[8]

        if (site.checked_on) {
            const elapsed = (Date.now() - site.checked_on.getTime())/1000
            if (elapsed > hour) {
                fill = theme.colors.red[6]
                stroke = theme.colors.red[9]
            } else if (elapsed > 10*minute) {
                fill = theme.colors.yellow[6]
                stroke = theme.colors.yellow[9]
            } else {
                fill = theme.colors.green[6]
                stroke = theme.colors.green[9]
            }
        } 

        return (
            <Marker 
                coordinates={coord} 
                key={site.name} 
                onClick={() => navigate(site.name)} 
                onMouseEnter={() => setActive(site.name)}
                onMouseLeave={() => setActive(undefined)}
                className={classes.marker}
            >
              <circle r={size} fill={fill} stroke={stroke}/>
              { site.name === active? 
                <circle r={40} stroke={stroke} strokeWidth={3} fill="none"/> 
                : null 
              }
              <text textAnchor="middle" fill="black" dy={25}> 
                { site.name.toUpperCase() }
              </text>
            </Marker>
        )
    })

    return (
        <ComposableMap
          projection='geoAlbersUsa'
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) => 
              geographies.map((geo) => (
                <Geography 
                    key={geo.rsmKey} 
                    geography={geo} 
                    fill={theme.colors.gray[3]}
                    stroke={theme.white}
                />
              ))
            }
          </Geographies>
          {markers}
        </ComposableMap>
    )
}

export { StationMap }
