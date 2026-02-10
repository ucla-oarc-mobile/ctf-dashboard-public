import config from '../config'
import { request } from '../helpers/request'

// ACTION CREATORS //

function messagesSetData(messages) {
  return {
    type: 'MESSAGES_SET_DATA',
    messages
  }
}

function messagesAdd(message) {
  return {
    type: 'MESSAGES_ADD',
    message
  }
}

// API METHODS //

export function messagesFetchData(studyId) {
  // TODO: add your own messaging server URL/params to fetch messages
  const url = ''
  const params = {}

  return (dispatch, getState) => {
    function onSuccess(json) {
      dispatch(messagesSetData(json))
    }

    request(url, 'GET', params, dispatch, getState, onSuccess)
  }
}

export function messagesSend(studyId, body) {
  // TODO: add your own messaging server URL/params to send a message
  const url = ''
  const params = {}

  return (dispatch, getState) => {
    function onSuccess(json) {
      dispatch(messagesAdd({
        body,
        sent: Date.now()
      }))
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }
}
