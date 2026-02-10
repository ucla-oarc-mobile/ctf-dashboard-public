import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { InputGroup, Button } from '@blueprintjs/core'

import '../styles/LoginForm.css'
import logo from '../images/logo.svg'

class ForgotPasswordForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: ''
    }
  }

  // RENDER METHODS //

  render() {
    return (
      <div className="LoginForm">
        <div className="inner-form">
          <img src={logo} alt="Coach to Fit" className="logo-large" />
          <h1 className="text-center">
            Forgot your Password?
          </h1>

          <form onSubmit={this.onSubmit}>
            <label className="pt-label" htmlFor="email">
              Login
              <InputGroup
                type="text"
                id="email"
                onChange={this.onUsernameChange}
                autoFocus
              />
            </label>

            <Button
              className="pt-fill button-primary reset-password-button"
              type="submit"
            >
              Reset Password
            </Button>

            <p className="text-center">
              <Link to="/login">
                Back to Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    )
  }

  // EVENT HANDLERS //

  onUsernameChange = (event) => {
    this.setState({
      username: event.currentTarget.value
    })
  }

  onSubmit = (event) => {
    event.preventDefault()
    this.props.onSubmit(this.state.username)
  }
}

ForgotPasswordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default ForgotPasswordForm
