import React from 'react'
import { 
    createStyles,
    Text
} from '@mantine/core'

const useStyles = createStyles((theme) => {
    
    return {
        footer: {
            padding: '0.5em',
            backgroundColor: '#f5f7fb', 
            color: '#888',
            textAlign: 'center',
            fontSize: 'smaller',
            borderTop: `1px solid ${theme.colors.gray[3]}`
        }
    }
})

const AppFooter = ({className, props}) => {

    const release = process.env.REACT_APP_RELEASE
    const { classes, cx } = useStyles()

    return (
        <footer className={cx(classes.footer, className)} {...props}>
          <Text size="xs" color="dimmer">
            Release {release} 
          </Text>
        </footer>
    )
}

export { AppFooter }
