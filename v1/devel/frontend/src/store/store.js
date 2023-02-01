import { createStore } from 'easy-peasy'
import timerMiddleware from 'redux-timer-middleware'

import model from './model'

const middleware = [
    timerMiddleware
]

export const store = createStore(model, { middleware })

