import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { InputGroup, Button } from '@blueprintjs/core'

import '../styles/LoginForm.css'
import logo from '../images/logo.svg'

class LoginForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: '',
      password: ''
    }
  }

  // RENDER METHODS //

  render() {
    return (
      <div className="LoginForm">
        <div className="inner-form">
          <img src={logo} alt="Coach to Fit" className="logo-large" />

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

            <div className="pt-form-group">
              <label className="pt-label" htmlFor="password">
                Password
              </label>
              <div className="pt-form-content">
                <input
                  type="password"
                  id="password"
                  className="pt-input"
                  onChange={this.onPasswordChange}
                />
                <div className="pt-form-helper-text">
                  <Link to="/forgot-password">
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>

            <Button className="pt-fill button-primary" type="submit">
              Login
            </Button>
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

  onPasswordChange = (event) => {
    this.setState({
      password: event.currentTarget.value
    })
  }

  onSubmit = (event) => {
    event.preventDefault()
    this.props.onSubmit(this.state.username, this.state.password)
  }
}

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default LoginForm
