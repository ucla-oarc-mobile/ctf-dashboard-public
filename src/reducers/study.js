export function study(state = null, action) {
  switch (action.type) {
    case 'STUDY_SET_DATA':
      return action.study

    default:
      return state
  }
}
