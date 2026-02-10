export function messages(state = [], action) {
  switch (action.type) {
    case 'MESSAGES_SET_DATA':
      return action.messages

    case 'MESSAGES_ADD':
      return state.concat(action.message)

    default:
      return state
  }
}
