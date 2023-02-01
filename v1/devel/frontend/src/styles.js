// https://google-webfonts-helper.herokuapp.com/fonts/roboto-condensed?subsets=latin
// https://google-webfonts-helper.herokuapp.com/fonts/roboto?subsets=latin

import roboto100 from 'support/fonts/roboto-v30-latin-100.woff2'
import roboto400 from 'support/fonts/roboto-v30-latin-regular.woff2'
import roboto300 from 'support/fonts/roboto-v30-latin-300.woff2'
import roboto700 from 'support/fonts/roboto-v30-latin-700.woff2'

import robotoCondensed400 from 'support/fonts/roboto-condensed-v25-latin-regular.woff2'
import robotoCondensed700 from 'support/fonts/roboto-condensed-v25-latin-700.woff2'

export const GlobalStyles = [
    { /* roboto-condensed-regular - latin */
        '@font-face': {
            fontFamily: 'Roboto Condensed',
            fontStyle: 'normal',
            fontWeight: 400,
            src: `url(${robotoCondensed400}) format('woff2')`
        }
    },
    { /* roboto-condensed-700 - latin */
        '@font-face': {
            fontFamily: 'Roboto Condensed',
            fontStyle: 'normal',
            fontWeight: 700,
            src: `url(${robotoCondensed700}) format('woff2')`
        }
    },
    { /* roboto-100 - latin */
        '@font-face': {
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            fontWeight: 100,
            src: `url(${roboto100}) format('woff2')`
        }
    },
    { /* roboto-300 - latin */
        '@font-face': {
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            fontWeight: 300,
            src: `url(${roboto300}) format('woff2')`
        }
    },
    { /* roboto-regular - latin */
        '@font-face': {
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            fontWeight: 400,
            src: `url(${roboto400}) format('woff2')`
        }
    },
    { /* roboto-700 - latin */
        '@font-face': {
            fontFamily: 'Roboto',
            fontStyle: 'normal',
            fontWeight: 700,
            src: `url(${roboto700}) format('woff2')`
        }
    }
]
