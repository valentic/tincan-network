import React, { useEffect } from 'react'
import { useStoreActions, useStoreState } from 'easy-peasy'
import { Confirm, Header, Button, Form, Segment } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AuthPage } from './AuthPage'

const ForgotPasswordForm = () => {

    const form = useForm()
    const forgotPassword = useStoreActions(actions => actions.auth.forgotPassword)

    const onChange = async (e,{name,value}) => {
        form.setValue(name,value)
    }

    const onSubmit = async (data) => {
        await form.triggerValidation()
        await forgotPassword(data)
    }

    const onError = error => {
        if (error) {
            return error.message ? { content: error.message } : true
        } else { 
            return false
        }
    }

    useEffect(() => {
        form.register({name:'username'},{
            required: true,
            maxLength: 20
            })
    },[form])
    
    return (
      <Form onSubmit={form.handleSubmit(onSubmit)}>

        <Form.Input
            name='username'
            label='Username'
            placeholder='username'
            icon='user'
            iconPosition='left'
            onChange={onChange}
            error={onError(form.errors.username)}
        />

        <Form.Field>
          <Form.Group>
            <Button type="submit" color="blue">Reset</Button> 
            <Button as={Link} to='/login'>Cancel</Button>
          </Form.Group>
        </Form.Field>

      </Form>
    )
}

const RequestPage = () => (
  <AuthPage>
    <Segment placeholder > 
      <Header as='h2' color='blue' textAlign='center'>
        Reset your password
      </Header>
      <ForgotPasswordForm />
      <Link to='/forgot/username'>Forgot your username?</Link>
      <Link to='/login'>Log in to your account</Link>
      <Link to='/signup'>Sign up for a new account</Link>
    </Segment>
  </AuthPage>
)

const SuccessPage = () => {
    const setForgotPasswordState = useStoreActions(actions => actions.auth.setForgotPasswordState)

    return (
        <Confirm
            open={true}
            content='Your password has been reset. Check your email. '
            onConfirm={() => setForgotPasswordState(undefined)}
            onCancel={() => setForgotPasswordState(undefined)}
        />
    )
}

const FailurePage = () => {
    const setForgotPasswordState = useStoreActions(actions => actions.auth.setForgotPasswordState)

    return (
        <Confirm
            open={true}
            content='No username was found.'
            onConfirm={() => setForgotPasswordState(undefined)}
            onCancel={() => setForgotPasswordState(undefined)}
        />
    )
}


const ForgotPasswordPage = () => {

    const auth = useStoreState(store => store.auth)

    if (typeof auth.forgotPasswordState == 'undefined') {
        return <RequestPage />
    } else if (auth.forgotPasswordState) {
        return <SuccessPage />
    } else {
        return <FailurePage />
    }
}

export { ForgotPasswordPage }
