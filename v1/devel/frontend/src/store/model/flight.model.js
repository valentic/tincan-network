import { action, thunkOn } from 'easy-peasy'

const initialState = {
    segment: 0,     // Selected flight segment 
    clock: 0,       // Clock time in flight segment
    start: 0,       // Flight segmnet start time
    index: 0        // Index into selected flight segment 
}

const reset = action((state,payload) => {
    return initialState
})

const set_clock = action((state,count) => {
    state.start = count
    state.clock = count
})

const update_clock = action((state,count) => {
    state.clock = count 
})

const set_segment = action((state,segment) => {
    state.segment = segment 
    state.index = 0
})

const set_index = action((state,index) => {
    state.index = index
})

const on_truth_data = thunkOn(
    (actions,storeActions) => storeActions.data.set_truth_data,
    async (actions,target) => {
        const flights = target.payload.flights
        actions.reset()

        if (flights.length>0) {
            const seg=0
            actions.set_segment(seg)
            actions.set_clock(flights[seg].start_ts)
        }
    }
)

const actions = {
    reset,
    set_clock,
    update_clock,
    set_segment,
    set_index,
    on_truth_data
}

const model = { ...initialState, ...actions }

export default model
