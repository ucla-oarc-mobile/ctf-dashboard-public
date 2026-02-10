import { request } from '../helpers/request'
import config from '../config'

// ACTION CREATORS //

function usersSetData(users) {
  return {
    type: 'USERS_SET_DATA',
    users
  }
}

export function userSetAttribute(username, attribute, value) {
  return {
    type: 'USER_SET_ATTRIBUTE',
    username,
    attribute,
    value
  }
}

function usersUpdated(updated) {
  return {
    type: 'USERS_UPDATED',
    updated
  }
}

// API METHODS //

export function usersFetchData() {
  const url = '/users'

  return (dispatch, getState) => {
    function onSuccess(json) {
      dispatch(usersSetData(json))
    }

    request(url, 'GET', {}, dispatch, getState, onSuccess)
  }
}

export function userUpdateActive(user) {
  const url = '/users/' + user.username

  const params = {
    attributes: user.attributes
  }

  return (dispatch, getState) => {
    function onSuccess(json) {
      // Show 'updated' message for only 5 seconds
      dispatch(usersUpdated(true))
      window.setTimeout(() => {
        dispatch(usersUpdated(false))
      }, 5000)

      // Update active flag and also rev, so future updates work too
      dispatch(userSetAttribute(user.username, 'active', user.attributes.active))
      dispatch(userSetAttribute(user.username, '_rev', json.rev))
    }

    request(url, 'PUT', params, dispatch, getState, onSuccess)
  }
}

export function userUpdateCoach(user) {
  const url = '/users/' + user.username

  const params = {
    attributes: user.attributes
  }

  return (dispatch, getState) => {
    function onSuccess(json) {
      // Update coach and also rev, so future updates work too
      dispatch(userSetAttribute(user.username, 'coach', user.attributes.coach))
      dispatch(userSetAttribute(user.username, '_rev', json.rev))
    }

    request(url, 'PUT', params, dispatch, getState, onSuccess)
  }
}

export function userCreate(user) {
  const url = '/users'

  let params = {
    username: user.username,
    password: user.password,
    privileged: user.role !== 'participant',
    attributes: {
      role: user.role,
      active: true,
      coach: user.role === 'participant' ? user.coach : null
    }
  }

  // Extra data for users other than participants
  if (user.role !== 'participant') {
    params.personal_id = user.username
    params.first_name = user.firstName
    params.last_name = user.lastName
    params.organization = config.organization
    params.email_address = user.username + '@' + config.emailDomain
  }

  return (dispatch, getState) => {
    function onSuccess(json) {
      // TODO: nicer Redux-friendly update of users list
      window.location.reload()
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }
}
