import React from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import { apiService } from 'services'
import { DateTime } from 'luxon'
import { IconVideo, IconArrowLeft, IconArrowRight } from '@tabler/icons'

import { Calendar } from '@mantine/dates'
import { isSameDate } from '@mantine/dates'

import { MovieViewer } from './MovieViewer'

import { 
    useParams, 
    useLocation, 
    useNavigate, 
    Link, 
    Navigate 
} from 'react-router-dom'

import {
    Box,
    Paper,
    Card,
    Container,
    Title,
    Text,
    Group,
    Grid,
    Stack,
    Tabs,
    ActionIcon,
    Button,
    useMantineTheme,
    LoadingOverlay,
    createStyles
} from '@mantine/core'

// https://github.com/Hacker0x01/react-datepicker/issues/1787
// https://github.com/JohnStarich/sage/blob/b422b0ccef05fffe29143f335017ad2fc24f76fc/web/src/UTCDatePicker.js

const convertUTCToLocal = (date) => {
    if (!date) {
        return date
    }
    date = new Date(date)
    date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    return date
}

const convertLocalToUTC = (date) => {
    if (!date) {
        return date
    }
    date = new Date(date)
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    return date
}

const useStyles = createStyles((theme) => {
    
    return {

        wrapper: {
            height: '100%',
            display: 'grid',

            gridTemplateColumns: '1fr 2fr',
            gridTemplateRows: '1fr',
            gridTemplateAreas: "'calendar viewer'",
            columnGap: 15,

            [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
              gridTemplateColumns: '1fr',
              gridTemplateAreas: "'viewer' 'calendar'",
              columnGap: 15,
            }
        },

        calendar: {
            gridArea: 'calendar',
        },

        header: {
            gridArea: 'header',
        },

        station: {
            margin: '0 0 5px 0',
            padding: '5px 10px',
            backgroundColor: theme.colors.gray[3]
        },

        title: {
            lineHeight: 1
        },

        viewer: {
            gridArea: 'viewer',
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
        }
    }
    
})

const DayNavigation = ({selectedDate, quicklooks, onPrev, onNext}) => {

    const disablePrev = quicklooks ? selectedDate <= quicklooks[0].timestamp : true
    const disableNext = quicklooks ? selectedDate >= quicklooks[quicklooks.length-1].timestamp : true

    return (
        <Group position="center">
            <Button 
                onClick={onPrev} 
                leftIcon={<IconArrowLeft/>}
                disabled={disablePrev}
            >
                Prev Day
            </Button>
            <Button 
                onClick={onNext} 
                rightIcon={<IconArrowRight/>}
                disabled={disableNext}
            >
                Next Day
            </Button>
        </Group>
    )
}

const CalendarView = ({selectedDate, station, instrument}) => {

    const theme = useMantineTheme()
    const navigate = useNavigate()

    const query = useQuery(['quicklooks',station,instrument], 
        () => apiService.getQuicklooks(station, instrument))

    if (query.isError) {
        return (
          <div>
            <Title>Error</Title>
            <div>{query.error.message}</div>
          </div>
        )

    } else if (query.isSuccess) {

        const quicklooks = query.data.quicklooks

        if (quicklooks.length===0) {
            return null
        }

        const minTime = convertUTCToLocal(quicklooks[0].timestamp)
        const maxTime = convertUTCToLocal(quicklooks[quicklooks.length-1].timestamp)

        maxTime.setMinutes(1)   // Need to make sure first of month is shown

        const excludeDate = localdate => {
            const utcdate = convertLocalToUTC(localdate)
            return !quicklooks.some(e => isSameDate(utcdate, e.timestamp))
        }

        const changeDay = (utcdate, inc) => {
            const dt = DateTime.fromJSDate(utcdate, { zone: 'UTC' })
            const newday = dt.plus({days: inc})
            navigate('../' + newday.toISODate(), { replace: true })
        }

        const onDateChange = localdate => {
            changeDay(convertLocalToUTC(localdate), 0)
        }

        const prevDay = () => changeDay(selectedDate, -1)
        const nextDay = () => changeDay(selectedDate, +1)

        const localDate = convertUTCToLocal(selectedDate)

        const dayStyle = (date, modifiers) => {
            if (modifiers.selected) {
                if (modifiers.disabled) {
                    return { 
                        border: `1px solid ${theme.colors.slate[6]}`,
                        backgroundColor: 'none', 
                        borderRadius: 100,
                        position: 'relative'
                    }
                } else {
                    return { 
                        backgroundColor: theme.colors.slate[6],
                        borderRadius: 100,
                        position: 'relative'
                    }
                }
            }
        }

        return (
          <>
            <Calendar     
                my={10}
                size="sm"
                value={localDate}
                month={localDate}
                minDate={minTime} 
                maxDate={maxTime} 
                firstDayOfWeek='sunday' 
                weekendDays={[]}
                hideOutsideDates={true}
                onChange = { onDateChange } 
                onMonthChange = { onDateChange }
                excludeDate = { excludeDate }
                dayStyle = {dayStyle}
            />
            <DayNavigation
                selectedDate={selectedDate}
                quicklooks={quicklooks}
                onPrev={prevDay}
                onNext={nextDay}
            />
          </>
        )
    } else if (query.isLoading) {
        return (
          <>
            <Calendar
                my={10}
                size="sm"
                value={convertUTCToLocal(selectedDate)}
                month={convertUTCToLocal(selectedDate)}
                firstDayOfWeek="sunday" 
                weekendDays={[]}
                hideOutsideDates={true}
                excludeDate = {date => true}
            />
            <DayNavigation />
          </>
        )
    }
    
    return null
}

const StationHeader = ({station, label, onPrev, onNext }) => {

    const { classes } = useStyles()

    return (
        <Grid className={classes.station} justify="space-between" align="center">
          <ActionIcon onClick={onPrev} variant="light" color="gray">
            <IconArrowLeft />
          </ActionIcon>
          <Stack spacing={0} justify="flex-start" align="center">
            <Text weight={500} size="lg" className={classes.title}>
              {station.toUpperCase()}
            </Text>
            <Text size='xs' lineClamp={1} color="gray.8" mt={3}>
              {label}
            </Text>
          </Stack>
          <ActionIcon onClick={onNext} variant="light" color="gray">
            <IconArrowRight />
          </ActionIcon>
        </Grid>
    )

}

const InstrumentView = () => {

    const { classes } = useStyles()
    const params = useParams()
    const station = params.station 
    const instrument = params.instrument
    const navigate = useNavigate()
    const location = useLocation()

    const unixtime = Date.parse(params.date)

    if (isNaN(unixtime)) {
        navigate(`../../${instrument}`)
    }

    const utcdate = new Date(unixtime)
    const refetchInterval = 60*1000 // 60-seconds

    const changeInstrument = newInstrument => {
        const path = location.pathname.split('/').slice(-1).join('/')
        navigate(`../../${newInstrument}/${path}`)
    }

    const changeStation = newStation => {
        const path = location.pathname.split('/').slice(-2).join('/')
        navigate(`../../../${newStation}/${path}`)
    }

    const results = useQueries({
        queries: [
            {
                queryKey: ['stations'],
                queryFn: apiService.getStations,
                refetchInterval: refetchInterval
            },
            {
                queryKey: ['cameras'],
                queryFn: apiService.getCameras,
                refetchInterval: refetchInterval
            }
        ]
    })

    const [ stationQuery, cameraQuery ] = results 
    const stations = stationQuery.data?.stations
    const cameras = cameraQuery.data?.cameras.filter(e => e.station === station)

    if (results.some(query => query.isLoading)) {
        return <LoadingOverlay visible={true} />
    } 

    if (results.some(query => query.isError)) {
        const badQuery = results.filter(query => query.isError)[0]
        return (
            <Container>
                <Title>Problem Detected</Title>
                <Text>{badQuery.error.message}</Text>
            </Container>
        )
    }

    const nextStation = () => {
        const k = stations.findIndex(e => e.name === station)
        const d = stations.length
        const kp = (((k+1) % d) + d) % d
        const newStation = stations[kp]
        changeStation(newStation.name)
        }

    const prevStation = () => {
        const k = stations.findIndex(e => e.name === station)
        const d = stations.length
        const kp = (((k-1) % d) + d) % d
        const newStation = stations[kp]
        changeStation(newStation.name)
        }

    const hasCamera = name => {
        return cameras.some(camera => camera.instrument === name)
    }

    const stationInfo = stationQuery.data.stations.find(e => e.name === station)

    if (stationInfo === undefined) {  
        return <Navigate to="../../../" replace /> 
    }

    if (!hasCamera(instrument)) {
        if (cameras.length>0) {
            const path = location.pathname.split('/').slice(-1).join('/')
            return <Navigate to={`../../${cameras[0].instrument}/${path}`} replace />
        } else {
            return <Navigate to="../../.." replace /> 
        }
    }

    return (
        <Box className={classes.wrapper}> 
          <Card className={classes.calendar} withBorder>
            <Card.Section>
              <StationHeader 
                station={station} 
                label={stationInfo.label} 
                onPrev={prevStation}
                onNext={nextStation}
              />
            </Card.Section>
            <Stack align="center" justify="flex-start">
              <CalendarView 
                station={station} 
                instrument={instrument} 
                selectedDate={utcdate} 
              /> 
              <Button component={Link} to="../../.."> 
                Back to Site List
              </Button>
            </Stack>
          </Card>
          <Paper radius="sm" withBorder className={classes.viewer} >
            <Tabs
                value={instrument} 
                onTabChange={changeInstrument}
                variant="pills"
            >
              <Tabs.List position="center" m={5} > 
                <Tabs.Tab 
                  value="greenline"
                  color="green.4"
                  icon={<IconVideo size={20} />}
                  disabled={!hasCamera('greenline')}
                >
                  Greenline Camera
                </Tabs.Tab>

                <Tabs.Tab 
                  value="redline"
                  color="red.4"
                  icon={<IconVideo size={20} />}
                  disabled={!hasCamera('redline')}
                >
                  Redline Camera
                </Tabs.Tab>
              </Tabs.List>
 
              <Tabs.Panel value="greenline">
                <MovieViewer 
                  date={utcdate} 
                  station={station} 
                  instrument={instrument} 
                /> 
              </Tabs.Panel>

              <Tabs.Panel value="redline">
                <MovieViewer 
                  date={utcdate} 
                  station={station} 
                  instrument={instrument} 
                /> 
              </Tabs.Panel>

            </Tabs>
          </Paper>
        </Box>
    )
}

export { InstrumentView }

