const check_email = (value) => /^\S+@\S+$/.test(value)
//const check_password = (value) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(value)
const check_password = (value) => /^^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/.test(value)
const check_username = (value) => value.trim().length >= 2

const email_help = 'Not a valid email'
const password_help = 'Password must be 7 to 15 characters with at least one numeric digit and a special character'
const username_help = 'Needs to be at least two characters'

const validate = {
    email:      (value) => check_email(value) ? null : email_help,
    password:   (value) => check_password(value) ? null : password_help,
    username:   (value) => check_username(value) ? null : username_help
}

export { validate }

