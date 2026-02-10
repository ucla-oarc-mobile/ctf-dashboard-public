export function leaderboard(state = [], action) {
  switch (action.type) {
    case 'LEADERBOARD_SET_DATA':
      return action.leaderboard

    default:
      return state
  }
}
