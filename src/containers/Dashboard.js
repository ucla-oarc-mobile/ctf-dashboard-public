import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import ParticipantList from '../components/ParticipantList'
import { participantsFetchData } from '../actions/participants'
import { dashboardSetSort } from '../actions/dashboard'

class Dashboard extends React.Component {
  componentDidMount() {
    // Only attempt to fetch data if the user is logged in
    if (this.props.session.isLoggedIn()) {
      this.props.fetchData()
    }
  }

  render() {
    if (!this.props.session.isLoggedIn()) {
      return (
        <Redirect to="/about" />
      )
    }

    else if (this.props.participants) {
      let participants = this.props.participants

      // If the current user is a coach, only show their participants
      if (this.props.session.attributes.role === 'coach') {
        participants = participants.filter(participant => (
          participant.coach === this.props.session.username
        ))
      }

      return (
        <ParticipantList
          participants={participants}
          role={this.props.session.attributes.role}
          initialSort={this.props.dashboard}
          onChangeSort={this.props.onChangeSort}
        />
      )
    }

    else {
      return null
    }
  }
}

Dashboard.propTypes = {
  session: PropTypes.object.isRequired,
  participants: PropTypes.arrayOf(PropTypes.object)
}

const mapStateToProps = (state) => {
  return {
    session: state.session,
    participants: state.participants,
    dashboard: state.dashboard
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: () => dispatch(participantsFetchData()),
    onChangeSort: sort => dispatch(dashboardSetSort(sort))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
