import { request } from '../helpers/request'

// ACTION CREATORS //

function leaderboardSetData(leaderboard) {
  return {
    type: 'LEADERBOARD_SET_DATA',
    leaderboard
  }
}

// API METHODS //

export function leaderboardFetchData() {
  const url = '/leaderboard/steps'

  return (dispatch, getState) => {
    function onSuccess(json) {
      dispatch(leaderboardSetData(json))
    }

    request(url, 'GET', {}, dispatch, getState, onSuccess)
  }
}
