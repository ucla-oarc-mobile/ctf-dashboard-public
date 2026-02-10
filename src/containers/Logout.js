import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import { sessionCreate, setAuthToken, stopKeepalive } from '../actions/session'

class Logout extends React.Component {
  componentDidMount() {
    this.props.clearToken()
    this.props.clearSession()
    this.props.stopKeepalive()
  }

  render() {
    return (
      <Redirect to="/login" />
    )
  }
}

Logout.propTypes = {
  clearSession: PropTypes.func.isRequired,
  clearToken: PropTypes.func.isRequired,
  stopKeepalive: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearSession: () => dispatch(sessionCreate({})),
    clearToken: () => dispatch(setAuthToken(null)),
    stopKeepalive: () => dispatch(stopKeepalive())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Logout)
