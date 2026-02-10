export function campaign(state = null, action) {
  switch (action.type) {
    case 'CAMPAIGN_SET_DEFINITION':
      return {
        surveys: action.surveys,
        creationTimestamp: action.creationTimestamp
      }

    case 'CAMPAIGN_SUBMIT_SUCCESS':
      return {
        ...state,
        submitted: true
      }

    default:
      return state
  }
}
