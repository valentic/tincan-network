const getElapsed = (jsdate) => {

    if (jsdate === 'undefined' || jsdate === null) {
        return 'unknown'
    }

    const seconds = 1000
    const minutes = 60*seconds
    const hour = 60*minutes 
    
    const elapsed = Date.now() - jsdate.getTime()

    if (elapsed > hour) {
        return 'error'
    } else if (elapsed > 10*minutes) {
        return 'warning'
    } else {
        return 'info'
    }

}

export { getElapsed } 
