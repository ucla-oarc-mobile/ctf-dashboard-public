export function authToken(state = null, action) {
  switch (action.type) {
    case 'AUTH_TOKEN_SET':
      return action.authToken

    default:
      return state
  }
}

export function session(state = null, action) {
  const emptySession = {
    isLoggedIn() {
      return this.authToken ? true : false
    },
    displayName() {
      return this.first_name + ' ' + this.last_name
    },
    showHeader() {
      // Logged-in pages always have a header
      if (this.isLoggedIn()) {
        return true
      }

      // Show a header to anonymous users only on static pages
      const path = window.location.pathname
      return (path === '/about' || path === '/privacy')
    }
  }

  switch (action.type) {
    case 'SESSION_CREATE':
      return Object.assign(emptySession, action.session)

    default:
      return state
  }
}

export function keepalive(state = null, action) {
  switch (action.type) {
    case 'KEEPALIVE_SET':
      return action.interval

    default:
      return state
  }
}

export function timeouts(state = 0, action) {
  switch (action.type) {
    case 'TIMEOUTS_RESET':
      return 0

    case 'TIMEOUTS_INCREMENT':
      return state + 1

    default:
      return state
  }
}
