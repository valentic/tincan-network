import React, { useEffect } from 'react'
import { useStoreActions, useStoreState } from 'easy-peasy'
import { Confirm, Header, Button, Form, Segment } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AuthPage } from './AuthPage'

const ForgotUsernameForm = () => {

    const form = useForm()
    const forgotUsername = useStoreActions(actions => actions.auth.forgotUsername)

    const onChange = async (e,{name,value}) => {
        form.setValue(name,value)
    }

    const onSubmit = async (data) => {
        await form.triggerValidation()
        await forgotUsername(data)
    }

    const onError = error => { 
        if (error) {
            return error.message ? { content: error.message } : true
        } else {
            return false
        }
    }

    useEffect(() => {
        form.register({name: 'email'},{ required: true })
    },[form])

    return (
      <Form onSubmit={form.handleSubmit(onSubmit)}>

        <Form.Input
            name='email'
            label='Email address'
            placeholder='email'
            icon='mail'
            iconPosition='left'
            onChange={onChange}
            error={onError(form.errors.email)}
        />

        <Form.Field>
          <Form.Group>
            <Button type="submit" color="blue">Lookup</Button> 
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
          Lookup your username 
        </Header>
        <ForgotUsernameForm />
        <Link to='/forgot/password'>Forgot your password?</Link>
        <Link to='/login'>Log in to your account</Link>
        <Link to='/signup'>Sign up for a new account</Link>
      </Segment>
    </AuthPage>
)

const SuccessPage = () => {
    const setForgotUsernameState = useStoreActions(actions => actions.auth.setForgotUsernameState)

    return (
      <Confirm
        open={true}
        content='Your username has been sent to your email address.'
        onConfirm={() => setForgotUsernameState(undefined)} 
        onCancel={() => setForgotUsernameState(undefined)} 
      /> 
    )
}

const FailurePage = () => {
    const setForgotUsernameState = useStoreActions(actions => actions.auth.setForgotUsernameState)

    return (
      <Confirm
        open={true}
        content='No username was found for that email address.'
        onConfirm={() => setForgotUsernameState(undefined)} 
        onCancel={() => setForgotUsernameState(undefined)} 
      /> 
    )
}


const ForgotUsernamePage = () => {
    const auth = useStoreState(store => store.auth)

    if (typeof auth.forgotUsernameState === 'undefined') {
        return <RequestPage/>
    } else if (auth.forgotUsernameState) {
        return <SuccessPage/>
    } else {
        return <FailurePage/>
    }
}


export { ForgotUsernamePage }


