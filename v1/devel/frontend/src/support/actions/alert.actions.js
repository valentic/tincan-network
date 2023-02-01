import { store } from 'support/helpers'

const success = message => {
    return store.dispatch.alert.success(message)
}

const error = message => {
    return store.dispatch.alert.error(message)
}

const clear = () => {
    return store.dispatch.alert.clear()
}

export const alertActions = {
    success,
    error,
    clear
}


