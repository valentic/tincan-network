import { Home } from './Home'
import { StationList } from './StationList'
import { InstrumentView } from './InstrumentView'
import { InstrumentViewRedirect } from './InstrumentViewRedirect'
import { InstrumentRedirect } from './InstrumentRedirect'

const Dashboard = {
    
    Home:   Home,

    Stations: {
        List:   StationList
    },

    Instrument: {
        View:           InstrumentView,
        Redirect:       InstrumentRedirect,
        ViewRedirect:   InstrumentViewRedirect
    }
}

export { Dashboard }

