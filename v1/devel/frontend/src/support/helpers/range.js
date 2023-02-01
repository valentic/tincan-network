// https://stackoverflow.com/questions/8069315/create-array-of-all-integers-between-two-numbers-inclusive-in-javascript-jquer

function range(start, end, step = 1) {
    const len = Math.floor((end - start) / step) 
    return Array(len).fill().map((_, idx) => start + (idx * step))
}

export { range }

