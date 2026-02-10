import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import ChangePasswordForm from '../components/ChangePasswordForm'
import { changePasswordSubmit } from '../actions/session'

function ChangePassword(props) {
  return (
    <ChangePasswordForm session={props.session} onSubmit={props.onSubmit} />
  )
}

ChangePassword.propTypes = {
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
    onSubmit: (username, currentPassword, newPassword) => dispatch(
      changePasswordSubmit(username, currentPassword, newPassword)
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword)
