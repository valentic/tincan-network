import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { IconVideo } from '@tabler/icons'

import geoUrl from 'support/assets/states-10m.json'

import {
    useMantineTheme,
    createStyles
} from '@mantine/core'

const useStyles = createStyles((theme) => {
    return {
        marker: {
            cursor: 'pointer',
        }
    }
})

const StationMap = ({sites, cameras, active, setActive}) => {

    const theme = useMantineTheme()
    const navigate = useNavigate()
    const { classes } = useStyles()

    const colorMap = {
        'redline': {
            'stroke': theme.colors.red[7],
            'fill': theme.colors.red[9]
        },
        'greenline': {
            'stroke': theme.colors.green[7],
            'fill': theme.colors.green[9]
        }
    }

    const markers = Object.values(sites).map(site => {
        const coord = [site.longitude, site.latitude]
        const stroke = theme.colors.gray[7]
        const icons = cameras.filter(c => c.station === site.name)
                            .map((c,index,a) => {
                                const n = a.length
                                const s = 24
                                const gutter = s/4
                                const dx = (n*s + (n-1)*gutter)/2
                                const x = (s+gutter)*index - dx
                                const y = -s/2
                                return <IconVideo 
                                         key={c.instrument} 
                                         size={s} 
                                         strokeWidth={1}
                                         x={x} y={y}
                                         {...colorMap[c.instrument]}
                                        />
                                })

        return (
            <Marker 
              coordinates={coord} 
              key={site.name} 
              onClick={() => navigate(site.name)} 
              onMouseEnter={() => setActive(site.name)}
              onMouseLeave={() => setActive(undefined)}
              className={classes.marker}
            >
              { icons } 
              <text textAnchor="middle" fill="black" dy={25}> 
                { site.name.toUpperCase() }
              </text>
              { site.name === active ? 
                <circle r={40} stroke={stroke} strokeWidth={3} fill="none" />
                : null
              }
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
