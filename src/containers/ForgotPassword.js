import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import ForgotPasswordForm from '../components/ForgotPasswordForm'
import { forgotPasswordSubmit } from '../actions/session'

function ForgotPassword(props) {
  // If the user is already logged in, take them to the dashboard
  if (props.session.isLoggedIn()) {
    return (
      <Redirect to="/" />
    )
  }

  // Otherwise, show the form
  else {
    return (
      <ForgotPasswordForm session={props.session} onSubmit={props.onSubmit} />
    )
  }
}

ForgotPassword.propTypes = {
  session: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    session: state.session
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSubmit: (username) => dispatch(forgotPasswordSubmit(username))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword)
