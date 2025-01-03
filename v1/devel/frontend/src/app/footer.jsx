import { Link } from 'react-router-dom'
import { PropTypes } from 'prop-types'

import { 
    Text,
} from '@mantine/core'

import classes from './footer.module.css'

const Footer = ({props}) => {

    const release = import.meta.env.VITE_RELEASE

    return (
        <footer className={classes.footer} {...props}>
          <Text size="xs" color="dimmer">
            Release {release} &nbsp; <Link to='/admin/'>Admin</Link>
          </Text>
        </footer>
    )
}

Footer.propTypes = {
    props: PropTypes.any
}

export { Footer }
