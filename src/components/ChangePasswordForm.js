import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { InputGroup, Button } from '@blueprintjs/core'

import '../styles/ChangePasswordForm.css'

class ChangePasswordForm extends React.Component {
  constructor(props) {
    super(props)

    // If the user is already logged in, we have their username
    this.state = {
      username: this.props.session.username || '',
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: ''
    }
  }

  // RENDER METHODS //

  render() {
    return (
      <form onSubmit={this.onSubmit} className="ChangePasswordForm">
        <Grid fluid>
          <Row>
            <Col xs={4}>
              {this.renderBackButton()}
            </Col>

            <Col xs={4}>
              <h1 className="text-center">
                Change Password
              </h1>
              <p className="text-center">
                Passwords must be at least 8 characters.
              </p>

              {this.renderUsernameInput()}

              <div className="pt-form-group">
                <label className="pt-label" htmlFor="currentPassword">
                  Current Password
                </label>
                <div className="pt-form-content">
                  <input
                    type="password"
                    id="currentPassword"
                    className="pt-input"
                    onChange={this.onInputChange}
                  />
                </div>
              </div>

              <div className="pt-form-group">
                <label className="pt-label" htmlFor="newPassword">
                  New Password
                </label>
                <div className="pt-form-content">
                  <input
                    type="password"
                    id="newPassword"
                    className="pt-input"
                    onChange={this.onInputChange}
                  />
                </div>
              </div>

              <div className="pt-form-group">
                <label className="pt-label" htmlFor="newPasswordConfirm">
                  Retype New Password
                </label>
                <div className="pt-form-content">
                  <input
                    type="password"
                    id="newPasswordConfirm"
                    className="pt-input"
                    onChange={this.onInputChange}
                  />
                </div>
              </div>
            </Col>
          </Row>

          <Row>
            <Col xs={2} xsOffset={4}>
              <Link
                role="button"
                className="pt-button button-gray"
                to="/"
              >
                Cancel
              </Link>
            </Col>

            <Col xs={2}>
              <Button
                className="button-primary"
                type="submit"
                disabled={!this.isFormValid()}
              >
                Update
              </Button>
            </Col>
          </Row>
        </Grid>
      </form>
    )
  }

  renderBackButton() {
    if (this.props.session.isLoggedIn()) {
      return (
        <Link
          to="/"
          role="button"
          className="pt-button button-inverse"
        >
          <span className="button-icon-back" />
          Back to panel management
        </Link>
      )
    }

    else {
      return null
    }
  }

  renderUsernameInput() {
    if (this.props.session.isLoggedIn()) {
      return null
    }

    // If the user isn't logged in, they have to tell us their username
    return (
      <div className="pt-form-group">
        <label className="pt-label" htmlFor="username">
          Login
          <InputGroup
            type="text"
            id="username"
            onChange={this.onInputChange}
            autoFocus
          />
        </label>
      </div>
    )
  }

  // EVENT HANDLERS //

  onInputChange = (event) => {
    let newState = {}
    newState[event.currentTarget.id] = event.currentTarget.value.trim()
    this.setState(newState)
  }

  onSubmit = (event) => {
    event.preventDefault()
    this.props.onSubmit(this.state.username, this.state.currentPassword, this.state.newPassword)
  }

  // HELPER METHODS //

  isFormValid() {
    return (
      this.state.username &&
      this.state.currentPassword &&
      this.isPasswordValid()
    )
  }

  isPasswordValid() {
    return (
      this.state.newPassword.length >= 8 &&
      this.state.newPassword === this.state.newPasswordConfirm
    )
  }
}

ChangePasswordForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default ChangePasswordForm
