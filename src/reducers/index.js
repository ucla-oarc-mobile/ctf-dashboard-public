import { combineReducers } from 'redux'

import { authToken, session, keepalive, timeouts } from './session'
import { study } from './study'
import { users, usersUpdated } from './users'
import { participants } from './participants'
import { responses } from './responses'
import { campaign } from './campaign'
import { dashboard } from './dashboard'
import { dialog } from './dialog'
import { leaderboard } from './leaderboard'
import { messages } from './messages'

export default combineReducers({
  authToken,
  session,
  keepalive,
  timeouts,
  study,
  users,
  usersUpdated,
  participants,
  responses,
  campaign,
  dashboard,
  dialog,
  leaderboard,
  messages
})
