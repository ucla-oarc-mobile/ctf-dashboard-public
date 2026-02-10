export function responses(state = [], action) {
  switch (action.type) {
    case 'RESPONSES_SET_DATA':
      return action.responses

    default:
      return state
  }
}
