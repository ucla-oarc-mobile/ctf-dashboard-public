export function participants(state = [], action) {
  switch (action.type) {
    case 'PARTICIPANTS_SET_DATA':
      return action.participants

    default:
      return state
  }
}
