import React from 'react'
import PropTypes from 'prop-types'
import { Tag, InputGroup, Button } from '@blueprintjs/core'

import '../styles/NewUserForm.css'
import config from '../config'

class NewUserForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      role: 'participant',
      username: '',
      password: '',
      passwordConfirm: '',
      firstName: '',
      lastName: '',
      coach: null
    }
  }

  // RENDER METHODS //

  render() {
    return (
      <form onSubmit={this.onSubmit} className="NewUserForm">

        <label className="pt-label" htmlFor="role">
          Role
          <span className="required">*</span>
          <div className="styled-select">
            <select id="role" onChange={this.onInputChange}>
              <option value="participant">Participant</option>
              <option value="coach">Coach</option>
              <option value="researcher">Researcher</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </label>

        {this.renderRoleSpecificInputs()}

        <Button
          className="button-primary pt-fill"
          type="submit"
          disabled={!this.isFormValid()}
        >
          Add new user
        </Button>

        <small className="required text-center">
          * Required Fields
        </small>
      </form>
    )
  }

  renderRoleSpecificInputs() {
    if (this.state.role === 'participant') {
      return (
        <div>
          <div className="pt-form-group pt-fill">
            <label className="pt-label" htmlFor="studyId">
              Study ID
              <span className="required">*</span>
            </label>
            <div className="pt-form-content">
              <input
                type="number"
                id="studyId"
                className="pt-input"
                onChange={this.onStudyIdChange}
              />
            </div>
          </div>

          <div className="pt-form-group">
            {this.renderParticipantMessage()}
          </div>

          <label className="pt-label" htmlFor="coach">
            Assign Coach
            <div className="styled-select">
              <select id="coach" onChange={this.onInputChange}>
                <option key="" value=""></option>
                {this.renderCoachOptions()}
              </select>
            </div>
          </label>
        </div>
      )
    }

    else {
      const emailTag = (
        <Tag>
          @{config.emailDomain}
        </Tag>
      )

      return (
        <div>
          <label className="pt-label" htmlFor="username">
            Email
            <span className="required">*</span>
            <InputGroup
              type="text"
              id="username"
              onChange={this.onInputChange}
              rightElement={emailTag}
              autoFocus
            />
          </label>

          <div className="pt-form-group">
            <label className="pt-label" htmlFor="password">
              Password
              <span className="required">*</span>
            </label>
            <div className="pt-form-content">
              <input
                type="password"
                id="password"
                className="pt-input"
                onChange={this.onInputChange}
              />
            </div>
          </div>

          <div className="pt-form-group">
            <label className="pt-label" htmlFor="passwordConfirm">
              Confirm Password
              <span className="required">*</span>
            </label>
            <div className="pt-form-content">
              <input
                type="password"
                id="passwordConfirm"
                className="pt-input"
                onChange={this.onInputChange}
              />
            </div>
          </div>

          <div className="pt-form-group">
            <label className="pt-label" htmlFor="firstName">
              First Name
              <span className="required">*</span>
            </label>
            <div className="pt-form-content">
              <input
                type="text"
                id="firstName"
                className="pt-input"
                onChange={this.onInputChange}
              />
            </div>
          </div>

          <div className="pt-form-group">
            <label className="pt-label" htmlFor="lastName">
              Last Name
              <span className="required">*</span>
            </label>
            <div className="pt-form-content">
              <input
                type="text"
                id="lastName"
                className="pt-input"
                onChange={this.onInputChange}
              />
            </div>
          </div>
        </div>
      )
    }
  }

  renderParticipantMessage() {
    if (this.state.studyId) {
      return (
        <small>
          The new participant's username will be: {this.state.username}<br />
          The new participant's password will be: {this.state.password}
        </small>
      )
    }

    else {
      return (
        <small>
          &nbsp;<br />
          &nbsp;
        </small>
      )
    }
  }

  renderCoachOptions() {
    return this.props.coaches.map((coach) => {
      return (
        <option key={coach.username} value={coach.username}>
          {coach.first_name} {coach.last_name}
        </option>
      )
    })
  }

  // EVENT HANDLERS //

  onInputChange = (event) => {
    let newState = {}
    newState[event.currentTarget.id] = event.currentTarget.value.trim()
    this.setState(newState)
  }

  onStudyIdChange = (event) => {
    // Special case for study ID: it controls both the username and password
    const studyId = event.currentTarget.value.trim()

    this.setState({
      studyId: studyId,
      username: config.studyIdPrefix + studyId,
      password: config.studyIdPrefix + studyId,
      passwordConfirm: config.studyIdPrefix + studyId
    })
  }

  onSubmit = (event) => {
    event.preventDefault()
    this.props.onSubmit(this.state)
  }

  // HELPER METHODS //

  isFormValid() {
    // For participants, the only requirement is a numeric study ID
    // (and combined with the prefix must make a password of 8+ characters)
    if (this.state.role === 'participant') {
      return (
        this.state.studyId &&
        this.isPasswordValid()
      )
    }

    // For other users, they must have all fields filled in
    else {
      return (
        this.state.username &&
        this.state.firstName &&
        this.state.lastName &&
        this.isPasswordValid()
      )
    }
  }

  isPasswordValid() {
    return (
      this.state.password.length >= 8 &&
      this.state.password === this.state.passwordConfirm
    )
  }
}

NewUserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  coaches: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default NewUserForm
