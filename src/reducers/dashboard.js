export function dashboard(state = {}, action) {
  switch (action.type) {
    case 'DASHBOARD_SET_SORT':
      return action.sort

    default:
      return state
  }
}
