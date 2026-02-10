import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Button } from '@blueprintjs/core'

import config from '../config'
import { displayName } from '../helpers/types'

import '../styles/CoachList.css'

class CoachList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedCoach: '',
      selectedUnassigned: '',
      selectedAssigned: '',
      searchUnassigned: '',
      searchAssigned: ''
    }
  }

  // RENDER METHODS //

  render() {
    return (
      <Grid fluid>
        <Row>
          <Col xs={4}>
            <Link
              to="/"
              role="button"
              className="pt-button button-inverse"
            >
              <span className="button-icon-back" />
              Back to panel management
            </Link>
          </Col>

          <Col xs={4} className="text-center">
            <h1>
              Assign Coaches
            </h1>
          </Col>
        </Row>

        <Row>
          <Col xsOffset={3} xs={2} className="text-right">
            <label className="pt-label coach-dropdown-label" htmlFor="coach">
              Select Coach
            </label>
          </Col>
          <Col xs={2}>
            <div className="styled-select coach-dropdown">
              <select id="coach" onChange={this.onCoachChange}>
                <option key="" value=""></option>
                {this.renderCoachOptions()}
              </select>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={3}>
            <div className="pt-input-group">
              <input
                className="pt-input"
                type="search"
                placeholder="Search Unassigned Participant ID"
                onChange={this.searchUnassigned}
              />
              <span className="pt-icon pt-icon-search"></span>
            </div>
          </Col>

          <Col xsOffset={4} xs={3}>
            <div className="pt-input-group">
              <input
                className="pt-input"
                type="search"
                placeholder="Search Assigned Participant ID"
                onChange={this.searchAssigned}
              />
              <span className="pt-icon pt-icon-search"></span>
            </div>
          </Col>

          <Col xsOffset={1} xs={1}>
            <div className="total-assigned-label">
              Total Assigned
            </div>
            <div className="total-assigned-value">
              {this.getTotalAssigned()}
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={5}>
            <div className="panel participant-list">
              <h2 className="panel-heading">
                Unassigned Participant Study ID
              </h2>
              {this.renderUnassignedParticipants()}
            </div>
          </Col>

          <Col xs={2}>
            <Button
              id="assign-button"
              className="button-inverse"
              disabled={!this.state.selectedCoach || !this.state.selectedUnassigned}
              onClick={this.assignParticipant}
              aria-label="Assign coach"
            />
            <Button
              id="unassign-button"
              className="button-inverse"
              disabled={!this.state.selectedAssigned}
              onClick={this.unassignParticipant}
              aria-label="Unassign coach"
            />
          </Col>

          <Col xs={5}>
            <div className="panel participant-list">
              <h2 className="panel-heading">
                Assigned Participant Study ID
              </h2>
              {this.renderAssignedParticipants()}
            </div>
          </Col>
        </Row>
      </Grid>
    )
  }

  renderCoachOptions() {
    return this.getCoaches().map((coach) => {
      return (
        <option key={coach.username} value={coach.username}>
          {coach.first_name} {coach.last_name}
        </option>
      )
    })
  }

  renderUnassignedParticipants() {
    return this.getUnassignedParticipants().map(user => (
      this.renderParticipant(user, this.state.selectedUnassigned, this.selectUnassigned)
    ))
  }

  renderAssignedParticipants() {
    return this.getAssignedParticipants().map(user => (
      this.renderParticipant(user, this.state.selectedAssigned, this.selectAssigned)
    ))
  }

  renderParticipant(user, selectedUsername, onClick) {
    let className = 'panel-section'
    if (user.username === selectedUsername) {
      className += ' selected'
    }

    return (
      <div
        key={user.username}
        data-username={user.username}
        className={className}
        onClick={onClick}
        onKeyUp={onClick}
        tabIndex={0}
      >
        {this.getStudyId(user.username)}
      </div>
    )
  }

  // EVENT HANDLERS //

  onCoachChange = (event) => {
    this.setState({
      selectedCoach: event.currentTarget.value
    })
  }

  selectUnassigned = (event) => {
    // If handling a keyboard event, only activate on space/enter
    if (event.type === 'keyup') {
      if (event.key !== ' ' && event.key !== 'Enter') {
        return
      }
    }

    this.setState({
      selectedUnassigned: event.currentTarget.dataset.username
    })
  }

  selectAssigned = (event) => {
    // If handling a keyboard event, only activate on space/enter
    if (event.type === 'keyup') {
      if (event.key !== ' ' && event.key !== 'Enter') {
        return
      }
    }

    this.setState({
      selectedAssigned: event.currentTarget.dataset.username
    })
  }

  assignParticipant = (event) => {
    let user = this.props.users.find(user => user.username === this.state.selectedUnassigned)
    user.attributes.coach = this.state.selectedCoach
    this.setState({
      selectedUnassigned: null,
      selectedAssigned: this.state.selectedUnassigned
    })
    this.props.onUpdateUser(user)
  }

  unassignParticipant = (event) => {
    let user = this.props.users.find(user => user.username === this.state.selectedAssigned)
    user.attributes.coach = null
    this.setState({
      selectedUnassigned: this.state.selectedAssigned,
      selectedAssigned: null
    })
    this.props.onUpdateUser(user)
  }

  searchUnassigned = (event) => {
    this.setState({
      searchUnassigned: event.currentTarget.value
    })
  }

  searchAssigned = (event) => {
    this.setState({
      searchAssigned: event.currentTarget.value
    })
  }

  // HELPER METHODS //

  getCoaches() {
    let coaches = this.props.users.filter(user => (
      user.attributes.role === 'coach' && user.attributes.active
    ))

    coaches.sort((a, b) => {
      return displayName(a) < displayName(b) ? -1 : 1
    })

    return coaches
  }

  getUnassignedParticipants() {
    let participants = this.getParticipants(null)

    if (this.state.searchUnassigned) {
      participants = participants.filter(user => {
        return user.username.match(this.state.searchUnassigned)
      })
    }

    return participants
  }

  getAssignedParticipants() {
    if (this.state.selectedCoach) {
      let participants = this.getParticipants(this.state.selectedCoach)

      if (this.state.searchAssigned) {
        participants = participants.filter(user => {
          return user.username.match(this.state.searchAssigned)
        })
      }

      return participants
    }

    else {
      return []
    }
  }

  getParticipants(coachName) {
    let participants = this.props.users.filter(user => user.attributes.role === 'participant')

    participants.sort((a, b) => {
      const studyA = parseInt(this.getStudyId(a.username), 10)
      const studyB = parseInt(this.getStudyId(b.username), 10)

      return studyA < studyB ? -1 : 1
    })

    return participants.filter(user => user.attributes.coach === coachName)
  }

  getStudyId(username) {
    const participantRE = new RegExp('^' + config.studyIdPrefix)
    return username.replace(participantRE, '')
  }

  getTotalAssigned() {
    if (this.state.selectedCoach) {
      return this.getParticipants(this.state.selectedCoach).length
    }
    else {
      return 0
    }
  }
}

CoachList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  onUpdateUser: PropTypes.func.isRequired
}

export default CoachList
