import { openDialog } from './dialog'
import { request } from '../helpers/request'
import config from '../config'

// ACTION CREATORS //

export function setAuthToken(authToken) {
  return {
    type: 'AUTH_TOKEN_SET',
    authToken
  }
}

export function sessionCreate(session) {
  return {
    type: 'SESSION_CREATE',
    session
  }
}

export function setKeepalive(interval) {
  return {
    type: 'KEEPALIVE_SET',
    interval
  }
}

export function timeoutsReset() {
  return {
    type: 'TIMEOUTS_RESET'
  }
}

export function timeoutsIncrement() {
  return {
    type: 'TIMEOUTS_INCREMENT'
  }
}

// API METHODS //

export function refreshSession() {
  const url = '/authenticate'

  return (dispatch, getState) => {
    const token = getState().authToken

    // If there is no stored token, just return a blank session
    if (!token) {
      dispatch(sessionCreate({}))
    }

    // Otherwise, check token authenticity
    else {
      // Set up session if the token checks out
      function onSuccess(json) {
        dispatch(setAuthToken(json.authToken))
        dispatch(sessionCreate(json))
        dispatch(startKeepalive())
      }

      request(url, 'POST', {}, dispatch, getState, onSuccess)
    }
  }
}

export function loginSubmit(username, password) {
  const url = '/authenticate'
  const params = {
    user: username,
    password: password
  }

  return (dispatch, getState) => {
    function onSuccess(json) {
      // Only let coaches/researchers/admins in
      const validRoles = ['coach', 'researcher', 'admin']
      if (!(validRoles.includes(json.attributes.role))) {
        dispatch(openDialog('You do not have permission to use this website.'))
      }

      else {
        // Set token and session, redirect to dashboard
        dispatch(setAuthToken(json.authToken))
        dispatch(sessionCreate(json))
        dispatch(startKeepalive())
      }
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }
}

export function forgotPasswordSubmit(username) {
  const url = '/ohmage/user/reset_password'
  let params = {}

  // Hack to allow password resets from different emails
  // Enter 'username;email@example.com' to override the automatic email
  const split = username.split(';')
  if (split.length > 1) {
    params = {
      username: split[0],
      email_address: split[1]
    }
  }

  // If the hack isn't used, derive the email from the username
  else {
    params = {
      username: username,
      email_address: username + '@' + config.emailDomain
    }
  }

  return (dispatch, getState) => {
    function onSuccess(json) {
      dispatch(openDialog(
        'Please check your email for your temporary new password.',
        () => window.location = '/login'
      ))
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }
}

export function changePasswordSubmit(username, currentPassword, newPassword) {
  const url = '/ohmage/user/change_password'
  const params = {
    user: username,
    password: currentPassword,
    new_password: newPassword
  }

  return (dispatch, getState) => {
    function onSuccess(json) {
      dispatch(openDialog('Your password was changed successfully.'))
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }
}

export function startKeepalive() {
  const url = '/authenticate?ping=1'

  return (dispatch, getState) => {
    // Only start the keepalive if there isn't one running already
    if (typeof getState().keepalive !== 'number') {
      const interval = window.setInterval(() => {
        // Ping the server, track timeouts
        request(url, 'POST', {}, dispatch, getState, () => dispatch(timeoutsReset()))
      }, 60 * 1000)

      dispatch(setKeepalive(interval))
    }
  }
}

export function stopKeepalive() {
  return (dispatch, getState) => {
    const interval = getState().keepalive

    if (typeof interval === 'number') {
      window.clearInterval(interval)
      dispatch(setKeepalive(null))
    }
  }
}
