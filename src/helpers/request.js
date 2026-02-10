import { Intent } from '@blueprintjs/core'

import config from '../config'
import toaster from '../toaster'
import { setAuthToken, sessionCreate, stopKeepalive, timeoutsIncrement } from '../actions/session'
import { openDialog } from '../actions/dialog'

export function request(url, method, params, dispatch, getState, onSuccess) {
  const origUrl = url
  const state = getState()
  let fetchParams = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // Add base URL if it's not already an absolute URL
  if (!url.startsWith('https://')) {
    url = config.api.baseUrl + url
  }

  // Add Authorization header from params if needed
  if (params.Authorization) {
    fetchParams.headers.Authorization = params.Authorization
    delete params.Authorization
  }

  params.client = config.api.client

  // Add auth token from state if there is one
  const token = state.authToken
  if (token) {
    params.auth_token = token
  }

  // Append params to query string if it's a GET request
  if (method.toUpperCase() === 'GET') {
    let query = new URLSearchParams(params)
    url += '?' + query.toString()
  }

  // Send params in body if it's anything but GET
  else {
    fetchParams.body = JSON.stringify(params)
  }

  function handleResponse(response) {
    if (response.ok) {
      return response.json()
    }

    else {
      return response.text().then((errorMessage) => {
        // Throw an error object, passing along the HTTP status code
        let err = new Error(errorMessage)
        err.status = response.status
        throw err
      })
    }
  }

  function handleError(err) {
    // If the token is bad, clear it and create a blank session
    if (err.status === 401 && err.message === 'The token is unknown.') {
      dispatch(openDialog('You have been logged out due to inactivity.'))
      dispatch(setAuthToken(null))
      dispatch(sessionCreate({}))
      dispatch(stopKeepalive())
    }

    // If the user just reset their password, make them change it
    else if (
      err.status === 400 &&
      err.message === "New accounts aren't allowed to use this service."
    ) {
      dispatch(openDialog(
        'You must change your password before you can log in.',
        () => window.location = '/change-password'
      ))
    }

    // Silently increment the timeout count if this was a ping
    else if (origUrl === '/authenticate?ping=1') {
      const timeouts = state.timeouts + 1

      if (timeouts >= 10) {
        toaster.show({
          message: 'You have been offline for ' + timeouts + ' minutes! You will be logged out soon.',
          intent: Intent.DANGER,
          iconName: 'warning-sign'
        })
      }

      else if (timeouts >= 5) {
        toaster.show({
          message: 'Your network connection appears to be offline.',
          intent: Intent.WARNING
        })
      }

      dispatch(timeoutsIncrement())
    }

    // Otherwise, it was some other kind of error, so report it
    else {
      dispatch(openDialog(err.message))
    }
  }

  // Lead our request to the Promise-d land
  fetch(url, fetchParams).then(handleResponse).then(onSuccess).catch(handleError)
}
