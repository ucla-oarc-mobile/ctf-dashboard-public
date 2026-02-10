import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import WebFont from 'webfontloader'

import App from './App'
import rootReducer from './reducers'
import { unregister } from './registerServiceWorker'

import './polyfills'
import './index.css'

// Support Redux Dev Tools if present
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// Load auth token from persistent storage
const initialState = {
  authToken: sessionStorage.getItem('authToken'),
}

const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(applyMiddleware(thunk))
)

// Save auth token updates into storage
let currentToken
store.subscribe(() => {
  let previousToken = currentToken
  currentToken = store.getState().authToken

  // Only record actual changes, for performance
  if (previousToken !== currentToken) {
    if (currentToken) {
      sessionStorage.setItem('authToken', currentToken)
    }
    else {
      sessionStorage.removeItem('authToken')
    }
  }
})

WebFont.load({
  google: {
    families: ['Roboto:300,400,500,700', 'sans-serif']
  }
})

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

unregister()
