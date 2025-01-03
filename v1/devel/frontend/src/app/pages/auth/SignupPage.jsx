import React, { useEffect } from 'react'
import { useStoreState, useStoreActions } from 'easy-peasy'
import { Link } from 'react-router-dom'
import { Confirm, Container, Header, Button, Divider, Form, Segment } from 'semantic-ui-react'
import { useForm } from 'react-hook-form'
import { AuthPage } from './AuthPage'

const SignupForm = () => {

    const form = useForm()
    const signup = useStoreActions(actions => actions.auth.signup)

    const onChange = async (e,{name,value}) => {
        form.setValue(name,value)
    }

    const onSubmit = async (data) => {
        await form.triggerValidation()
        await signup(data)
    }

    const formatError = error => {
        if (error) {
            return error.message ? { content: error.message } : true
        } else {
            return false
        }
    }

    useEffect(() => {
        form.register({name: 'username'}, { required: true, maxLength: 20 })
        form.register({name: 'firstname'}, { required: true, maxLength: 50 })
        form.register({name: 'lastname'}, { required: true, maxLength: 50 })
        form.register({name: 'affiliation'}, { required: true, maxLength: 50 })

        form.register({name: 'email'}, {
                required: true, 
                pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                   message: "invalid email address"
                   },
                maxLength: 50})

         form.register({name: 'password'}, {
                required: true, 
                minLength: { 
                    value: 8, 
                    message: 'Must be 8-20 characters'
                    }, 
                maxLength: { 
                    value: 20, 
                    message: 'Must be 8-20 characters'
                    }})
            
    },[form])

    return (
      <Form onSubmit={form.handleSubmit(onSubmit)}>

        <Form.Input
            name='username'
            label='Username'
            placeholder='username'
            icon='user'
            iconPosition='left'
            required
            onChange={onChange}
            error={formatError(form.errors.username)}
        />

        <Form.Input
            name='password'
            label='Password'
            placeholder='password'
            icon='lock'
            iconPosition='left'
            type='password'
            required
            onChange={onChange}
            error={formatError(form.errors.password)}
        />

        <Form.Input
            name='email'
            label='Email Address'
            placeholder='email'
            icon='mail'
            iconPosition='left'
            required
            onChange={onChange}
            error={formatError(form.errors.email)}
        />

        <Form.Input
            name='firstname'
            label='First name'
            placeholder='first name'
            icon='user circle'
            iconPosition='left'
            onChange={onChange}
            error={formatError(form.errors.firstname)}
        />

        <Form.Input
            name='lastname'
            label='Last name'
            placeholder='last name'
            icon='user circle'
            iconPosition='left'
            onChange={onChange}
            error={formatError(form.errors.lastname)}
        />

        <Form.Input
            name='affiliation'
            label='Affiliation'
            placeholder='affiliation'
            icon='building outline'
            iconPosition='left'
            onChange={onChange}
            error={formatError(form.errors.affiliation)}
        />

        <Button type="submit" color="blue">Signup</Button> 
      </Form>
    )
}

const RequestPage = () => (
    <AuthPage>
      <Segment placeholder> 
        <Header as='h2' color='blue'>Request an account</Header>
        <SignupForm />
        <Divider hidden />
        <Container>
          Already have an account?&nbsp;&nbsp;
          <Link to="/login">Log in.</Link>
        </Container>
      </Segment>
    </AuthPage>
)

const SuccessPage = () => {
    const setSignupState = useStoreActions(actions => actions.auth.setSignupState)

    return (
      <Confirm
        open={true}
        content='Your request is being processed. You will be emailed when your account is ready to use.'
        onConfirm={() => setSignupState(undefined)}
        onCancel={() => setSignupState(undefined)}
      />
    )
}


const FailurePage = () => {
    const setSignupState = useStoreActions(actions => actions.auth.setSignupState)

    return (
      <Confirm
        open={true}
        content='Sorry, that user already exists'
        onConfirm={() => setSignupState(undefined)}
        onCancel={() => setSignupState(undefined)}
      />
    )
}

const SignupPage = () => {
    
    const auth = useStoreState(store => store.auth)

    if (typeof auth.signupState === 'undefined') {
        return <RequestPage/>
    } else if (auth.signupState) {
        return <SuccessPage/>
    } else { 
        return <FailurePage/>
    }
}

export { SignupPage }

