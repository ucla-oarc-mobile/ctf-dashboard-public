import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import UserList from '../components/UserList'
import {
  usersFetchData,
  userUpdateActive,
  userCreate
} from '../actions/users'

class Users extends React.Component {
  componentDidMount() {
    this.props.fetchData()
  }

  render() {
    if (!this.props.session.isLoggedIn()) {
      return (
        <Redirect to="/login" />
      )
    }
    else if (this.props.session.attributes.role !== 'admin') {
      return (
        <Redirect to="/" />
      )
    }

    if (this.props.users) {
      return (
        <UserList
          currentUsername={this.props.session.username}
          users={this.props.users}
          onUpdateUser={this.props.onUpdateUser}
          onCreateUser={this.props.onCreateUser}
          usersUpdated={this.props.usersUpdated}
        />
      )
    }

    else {
      return null
    }
  }
}

Users.propTypes = {
  session: PropTypes.object.isRequired,
  users: PropTypes.arrayOf(PropTypes.object),
  onUpdateUser: PropTypes.func.isRequired,
  onCreateUser: PropTypes.func.isRequired,
  usersUpdated: PropTypes.bool
}

const mapStateToProps = (state) => {
  return {
    session: state.session,
    users: state.users,
    usersUpdated: state.usersUpdated
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: () => dispatch(usersFetchData()),
    onUpdateUser: (user) => dispatch(userUpdateActive(user)),
    onCreateUser: (user) => dispatch(userCreate(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
