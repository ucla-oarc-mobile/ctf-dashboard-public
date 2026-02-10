import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import ResponseList from '../components/ResponseList'
import { responsesFetchData } from '../actions/responses'

class ReviewSurvey extends React.Component {
  constructor(props) {
    super(props)

    this.studyId = this.props.match.params.studyId
    this.timestamp = parseInt(this.props.match.params.timestamp, 10)
  }

  componentDidMount() {
    this.props.fetchData(this.timestamp)
  }

  render() {
    if (!this.props.session.isLoggedIn()) {
      return (
        <Redirect to="/login" />
      )
    }

    else if (
      this.props.responses.length > 0 &&
      Array.isArray(this.props.responses[0].responses)
     ) {
      return (
        <ResponseList
          responses={this.props.responses}
          timestamp={this.timestamp}
          studyId={this.studyId}
          surveyResponseId={null}
        />
      )
    }

    else {
      return null
    }
  }
}

ReviewSurvey.propTypes = {
  session: PropTypes.object.isRequired,
  responses: PropTypes.arrayOf(PropTypes.object)
}

const mapStateToProps = (state) => {
  return {
    session: state.session,
    responses: state.responses
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: timestamp => dispatch(responsesFetchData(timestamp))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewSurvey)
