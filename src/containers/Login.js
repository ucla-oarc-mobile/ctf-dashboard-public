import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import LoginForm from '../components/LoginForm'
import { loginSubmit } from '../actions/session'

function Login(props) {
  // If the user is already logged in (or just logged in), take them to the dashboard
  if (props.session.isLoggedIn()) {
    return (
      <Redirect to="/" />
    )
  }

  // Otherwise, show the login form
  else {
    return (
      <LoginForm session={props.session} onSubmit={props.onSubmit} />
    )
  }
}

Login.propTypes = {
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
    onSubmit: (username, password) => dispatch(loginSubmit(username, password))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
