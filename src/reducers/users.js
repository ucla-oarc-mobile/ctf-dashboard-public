export function users(state = [], action) {
  switch (action.type) {
    case 'USERS_SET_DATA':
      return action.users

    case 'USER_SET_ATTRIBUTE':
      return state.map((user) => {
        let userCopy = user

        if (user.username === action.username) {
          userCopy = Object.assign({}, user)
          userCopy.attributes[action.attribute] = action.value
        }

        return userCopy
      })

    default:
      return state
  }
}

export function usersUpdated(state = false, action) {
  switch (action.type) {
    case 'USERS_UPDATED':
      return action.updated

    default:
      return state
  }
}
