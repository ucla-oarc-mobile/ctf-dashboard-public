import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Button, Switch, Dialog } from '@blueprintjs/core'

import SortableTable from './SortableTable'
import NewUserForm from './NewUserForm'
import config from '../config'

import '../styles/UserList.css'

class UserList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDialogOpen: false,
      search: ''
    }
  }

  // RENDER METHODS //

  render() {
    const roleNames = {
      participant: 'Participant',
      coach: 'Coach',
      researcher: 'Researcher',
      admin: 'Administrator'
    }

    // Add components for each editable field
    const users = this.applySearch(
      this.props.users.map((user) => {
        return Object.assign(user, {
          disabled: user.active ? null : 'disabled',
          usernameDisplay: this.renderUsername(user),
          roleDisplay: roleNames[user.attributes.role],
          statusEditable: this.renderStatusControl(user)
        })
      })
    )

    const header = [
      { id: 'usernameDisplay', label: 'Study ID or Username', sort: this.usernameSort },
      { id: 'roleDisplay',     label: 'Role' },
      { id: 'statusEditable',  label: 'Status' }
    ]

    return (
      <div className="UserList">
        {this.renderNewUserDialog()}

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

              {this.renderUpdateMessage()}
            </Col>

            <Col xs={4} className="text-center">
              <h1>
                Manage Users
              </h1>
            </Col>

            <Col xs={4} className="text-right">
              {this.renderSearchBar()}
              <br />
              <Button
                role="button"
                className="pt-button button-primary"
                onClick={this.openDialog}
              >
                <span className="button-icon-add" />
                Add new user
              </Button>
            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <SortableTable header={header} body={users} />
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }

  renderUsername(user) {
    const participantRE = new RegExp('^' + config.studyIdPrefix)
    let username = user.username
    if (user.attributes.role === 'participant') {
      username = username.replace(participantRE, '')
    }

    return (
      <span
        data-sort-value={user}
      >
        {username}
      </span>
    )
  }

  renderStatusControl(user) {
    // Don't allow users to deactivate themselves
    if (user.username === this.props.currentUsername) {
      return (
        <div data-sort-value={true}>
        </div>
      )
    }

    else {
      return (
        <div className="status-control" data-sort-value={user.attributes.active}>
          <label className="left">
            Deactivated
          </label>
          <Switch
            data-username={user.username}
            checked={user.attributes.active}
            onChange={this.changeUserStatus}
            aria-label="Active"
          />
          <label className="right">
            Active
          </label>
        </div>
      )
    }
  }

  renderNewUserDialog() {
    return (
      <Dialog
        title="Add New User"
        isOpen={this.state.isDialogOpen}
        onClose={this.closeDialog}
      >
        <NewUserForm
          coaches={this.getCoaches()}
          onSubmit={this.props.onCreateUser}
        />
      </Dialog>
    )
  }

  renderUpdateMessage() {
    if (this.props.usersUpdated) {
      return (
        <div className="success">
          Changes saved successfully!
        </div>
      )
    }
    else {
      return null
    }
  }

  renderSearchBar() {
    return (
      <div className="pt-input-group">
        <input
          className="pt-input"
          type="search"
          placeholder="Search"
          onChange={this.search}
        />
        <span className="pt-icon pt-icon-search"></span>
      </div>
    )
  }

  // EVENT HANDLERS //

  changeUserStatus = (event) => {
    const username = event.currentTarget.dataset.username
    const user = {
      ...this.props.users.find(user => user.username === username)
    }
    user.attributes.active = event.currentTarget.checked

    this.props.onUpdateUser(user)
  }

  openDialog = (event) => {
    this.setState({
      isDialogOpen: true
    })
  }

  closeDialog = (event) => {
    this.setState({
      isDialogOpen: false
    })
  }

  search = (event) => {
    this.setState({
      search: event.currentTarget.value
    })
  }

  // HELPER METHODS //

  getCoaches() {
    return this.props.users.filter(user => user.attributes.role === 'coach')
  }

  usernameSort(a, b) {
    const participantRE = new RegExp('^' + config.studyIdPrefix)

    // Participants come before non-participants
    if (a.attributes.role === 'participant' && b.attributes.role !== 'participant') {
      return -1
    }
    else if (a.attributes.role !== 'participant' && b.attributes.role === 'participant') {
      return 1
    }

    // When comparing participants, sort numerically by study ID
    else if (a.attributes.role === 'participant' && b.attributes.role === 'participant') {
      const aStudyId = parseInt(a.username.replace(participantRE, ''), 10)
      const bStudyId = parseInt(b.username.replace(participantRE, ''), 10)

      return aStudyId < bStudyId ? -1 : 1
    }

    // When comparing non-participants, sort alphabetically by username
    else {
      return a.username < b.username ? -1 : 1
    }
  }

  applySearch(users) {
    if (this.state.search) {
      return users.filter(user => {
        const fields = [
          user.username,
          user.attributes.role
        ]
        const ciSearch = new RegExp(this.state.search, 'i')

        return fields.some(field => (field || '').match(ciSearch))
      })
    }

    else {
      return users
    }
  }
}

UserList.propTypes = {
  currentUsername: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  onUpdateUser: PropTypes.func.isRequired,
  onCreateUser: PropTypes.func.isRequired,
  usersUpdated: PropTypes.bool
}

export default UserList
