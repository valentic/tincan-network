import React, { useEffect } from 'react'
import { useStoreActions, useStoreState } from 'easy-peasy'
import { Confirm, Header, Button, Form, Segment } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AuthPage } from './AuthPage'

const ResetPasswordForm = ({token}) => {

    const form = useForm()
    const resetPassword = useStoreActions(actions => actions.auth.resetPassword)

    const onChange = async (e,{name,value}) => {
        form.setValue(name,value)
    }

    const onSubmit = async (data) => {
        await form.triggerValidation()
        await resetPassword({password:data.password,token})
    }

    const onError = error => {
        if (error) {
            return error.message ? { content: error.message } : true
        } else { 
            return false
        }
    }

    useEffect(() => {

        form.register({name: 'password'}, {
                        required: true, 
                        minLength: { 
                            value: 8, 
                            message: 'Must be 8-20 characters'
                        }, 
                        maxLength: { 
                            value: 20, 
                            message: 'Must be 8-20 characters'
                        }
                    })
    },[form])

    return (
      <Form onSubmit={form.handleSubmit(onSubmit)}>

        <Form.Input
            name='password'
            label='New Password'
            placeholder='password'
            type='password'
            icon='lock'
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

const ResultPage = ({content,history}) => {

    const setResetPasswordState = useStoreActions(actions => actions.auth.setResetPasswordState)

    const clear = () => {
        setResetPasswordState(undefined)
        history.push('/')
    }

    return (
        <Confirm
            open={true}
            content={content}
            onConfirm={clear}
            onCancel={clear}
        />
    )
}

const RequestPage = ({token}) => (
  <AuthPage>
    <Segment placeholder > 
      <Header as='h2' color='blue' textAlign='center'>
        Enter your new password
      </Header>
      <ResetPasswordForm token={token}/>
      <Link to='/login'>Log in to your account</Link>
      <Link to='/signup'>Sign up for a new account</Link>
    </Segment>
  </AuthPage>
)

const ResetPasswordPage = ({history,match}) => {
    const auth = useStoreState(store => store.auth)

    if (typeof auth.resetPasswordState == 'undefined') {
        return <RequestPage token={match.params.token}/> 
    } else if (auth.resetPasswordState) {
        return <ResultPage history={history} content='Your password has been changed.'/>
    } else {
        return <ResultPage history={history} content='Sorry, not able to change your password.'/>
    }
}

export { ResetPasswordPage }
