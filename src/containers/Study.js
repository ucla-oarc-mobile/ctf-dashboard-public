import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import UserHistory from '../components/UserHistory'
import { studyFetchData } from '../actions/study'
import { openDialog } from '../actions/dialog'
import { leaderboardFetchData } from '../actions/leaderboard'

class Study extends React.Component {
  componentDidMount() {
    this.studyId = this.props.match.params.studyId
    this.props.fetchData(this.studyId)
  }

  // RENDER METHODS //

  render() {
    if (!this.props.session.isLoggedIn()) {
      return (
        <Redirect to="/login" />
      )
    }

    // Only render if the fetched data is from the same study ID
    else if (this.props.study && (this.props.study.id === this.studyId)) {
      return (
        <UserHistory
          currentUserRole={this.props.session.attributes.role}
          studyId={this.studyId}
          openDialog={this.props.openDialog}
          leaderboard={this.props.leaderboard}
          fetchLeaderboard={this.props.fetchLeaderboard}
          {...this.props.study}
        />
      )
    }

    else {
      return null
    }
  }
}

Study.propTypes = {
  session: PropTypes.object.isRequired,
  study: PropTypes.object,
  fetchData: PropTypes.func.isRequired,
  fetchLeaderboard: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    session: state.session,
    study: state.study,
    leaderboard: state.leaderboard
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: (studyId) => dispatch(studyFetchData(studyId)),
    openDialog: (content, onClose) => dispatch(openDialog(content, onClose)),
    fetchLeaderboard: () => dispatch(leaderboardFetchData())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Study)
