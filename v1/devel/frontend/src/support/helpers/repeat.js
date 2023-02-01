
function repeat(callback, interval) {
    
    // https://stackoverflow.com/questions/53891790/make-javascript-interval-synchronize-with-actual-time

    const interval_ms = 1000 * interval
    const  timerFunc = () => { 
        const now = interval_ms * Math.floor(Date.now() / interval_ms)
        callback(now)
        setTimeout(timerFunc, now + interval_ms - Date.now());
        }
    timerFunc()
}

export { repeat }
