import { action, thunk, thunkOn } from 'easy-peasy'
import { apiService } from 'services'

const initialState = {
    sites: [],
    flights: [],
    truth_data: [],
    radar_data: [],
    radar_time_map: [],
    track_data: [],
    track_time_map: [],
    sites_loading: false,
    truth_loading: false,
    radar_loading: false,
    track_loading: false
}

const reset = action((state,payload) => {
    return initialState
})

const set_sites_loading = action((state,payload) => {
    state.sites_loading = payload
})

const set_truth_loading = action((state,payload) => {
    state.truth_loading = payload
})

const set_radar_loading = action((state,payload) => {
    state.radar_loading = payload
})

const set_track_loading = action((state,payload) => {
    state.track_loading = payload
})

const set_sites = action((state,payload) => {
    console.log('set_sites',payload)
    state.sites = payload 
})

const set_truth_data = action((state,payload) => {
    console.log('set_truth_data',payload)
    state.truth_data = Object.freeze(payload.truth)
    state.flights = Object.freeze(payload.flights)
})

const createTimeMap = (data) => {
    let bin_start = 0
    let bin_ts = data[bin_start].timestamp
    let timemap = []

    for (let k=0; k<data.length; k++) {
        const ts = data[k].timestamp
        if (ts>bin_ts) {
            timemap.push({'t':bin_ts,'start':bin_start,'stop':k-1})
            bin_start=k
            bin_ts = ts
        }
    }

    timemap.push({'t':bin_ts,'start':bin_start,'stop':data.length-1})

    return timemap 
}

const set_radar_data = action((state,payload) => {  
    if (payload !== null) {
        console.log('set_radar_data',payload)
        state.radar_data = Object.freeze(payload)
        state.radar_time_map = Object.freeze(createTimeMap(payload))
    }
})

const set_track_data = action((state,payload) => {  
    if (payload !== null) {
        console.log('set_track_data',payload)
        state.track_data = Object.freeze(payload)
        state.track_time_map = Object.freeze(createTimeMap(payload))
    }
})


const get_sites = thunk(async (actions,payload) => {
    actions.set_sites_loading(true)
    apiService.get_sites()
        .then(results => actions.set_sites(results.sites))
        .then(() => actions.set_sites_loading(false))
        .catch(err => {
            console.log('ERROR',err)
            actions.reset()
        })
})

const get_truth_data = thunk(async (actions,payload, { getStoreState }) => {
    const site = getStoreState().ui.site
    actions.set_truth_loading(true)
    apiService.get_truth_data(site)
        .then(results => actions.set_truth_data(results))
        .then(() => actions.set_truth_loading(false))
        .catch(err => {
            actions.reset()
        })
})

const get_radar_data = thunk(async (actions,payload, { getState }) => {
    actions.set_radar_loading(true)

    const { site, segment } = payload 
    const { start_ts, stop_ts } = getState().flights[segment]

    apiService.get_radar_data(site,start_ts,stop_ts)
        .then(results => actions.set_radar_data(results.radar))
        .then(() => actions.set_radar_loading(false))
        .catch(err => {
            actions.reset()
        })
})

const get_track_data = thunk(async (actions,payload, { getState }) => {
    actions.set_track_loading(true)

    const { site, segment } = payload 
    const { start_ts, stop_ts } = getState().flights[segment]

    apiService.get_track_data(site,start_ts,stop_ts)
        .then(results => actions.set_track_data(results.radar))
        .then(() => actions.set_track_loading(false))
        .catch(err => {
            actions.reset()
        })
})

const on_flight_segment = thunkOn(
    (actions,storeActions) => storeActions.flight.set_segment,
    async (actions,target, { getStoreState }) => { 
        const segment = target.payload
        const site = getStoreState().ui.site 
        actions.get_track_data({site,segment})
        actions.get_radar_data({site,segment})
    }
)

const actions = {
    reset,
    set_sites,
    get_sites,
    set_truth_data,
    get_truth_data,
    set_radar_data,
    get_radar_data,
    set_track_data,
    get_track_data,
    set_sites_loading,
    set_truth_loading,
    set_radar_loading,
    set_track_loading,
    on_flight_segment
}

const model = { ...initialState, ...actions }

export default model
