import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import CoachList from '../components/CoachList'
import { usersFetchData, userUpdateCoach } from '../actions/users'

class Coaches extends React.Component {
  componentDidMount() {
    this.props.fetchData()
  }

  render() {
    if (!this.props.session.isLoggedIn()) {
      return (
        <Redirect to="/login" />
      )
    }
    else if (!(['researcher', 'admin'].includes(this.props.session.attributes.role))) {
      return (
        <Redirect to="/" />
      )
    }

    if (this.props.users) {
      return (
        <CoachList
          users={this.props.users}
          onUpdateUser={this.props.onUpdateUser}
        />
      )
    }

    else {
      return null
    }
  }
}

Coaches.propTypes = {
  session: PropTypes.object.isRequired,
  users: PropTypes.arrayOf(PropTypes.object),
  onUpdateUser: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    session: state.session,
    users: state.users
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: () => dispatch(usersFetchData()),
    onUpdateUser: (user) => dispatch(userUpdateCoach(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Coaches)
