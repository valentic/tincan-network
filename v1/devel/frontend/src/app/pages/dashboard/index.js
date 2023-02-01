import { Home } from './Home'
import { NodeList } from './NodeList'
import { InstrumentView } from './InstrumentView'
import { InstrumentViewRedirect } from './InstrumentViewRedirect'
import { InstrumentRedirect } from './InstrumentRedirect'

const Dashboard = {
    
    Home:   Home,

    Nodes: {
        List:   NodeList
    },

    Instrument: {
        View:           InstrumentView,
        Redirect:       InstrumentRedirect,
        ViewRedirect:   InstrumentViewRedirect
    }
}

export { Dashboard }

