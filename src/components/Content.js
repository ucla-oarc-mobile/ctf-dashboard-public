import React from 'react'
import { Switch, Route } from 'react-router-dom'

import Dashboard from '../containers/Dashboard'
import About from '../components/About'
import Privacy from '../components/Privacy'
import Login from '../containers/Login'
import Logout from '../containers/Logout'
import ForgotPassword from '../containers/ForgotPassword'
import ChangePassword from '../containers/ChangePassword'
import Study from '../containers/Study'
import Messages from '../containers/Messages'
import TakeSurvey from '../containers/TakeSurvey'
import ReviewSurvey from '../containers/ReviewSurvey'
import EditSurvey from '../containers/EditSurvey'
import Users from '../containers/Users'
import Coaches from '../containers/Coaches'

import '../styles/Content.css'

function Content(props) {
  return (
    <main
      id="main"
      className={props.session.showHeader() ? 'logged-in' : null}
    >
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/about" component={About} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/login" component={Login} />
        <Route path="/logout" component={Logout} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/change-password" component={ChangePassword} />
        <Route exact path="/studies/:studyId" component={Study} />
        <Route path="/studies/:studyId/messages" component={Messages} />
        <Route path="/studies/:studyId/survey" component={TakeSurvey} />
        <Route path="/studies/:studyId/review/:timestamp" component={ReviewSurvey} />
        <Route path="/studies/:studyId/edit/:surveyResponseId" component={EditSurvey} />
        <Route path="/users" component={Users} />
        <Route path="/coaches" component={Coaches} />
      </Switch>
    </main>
  )
}

export default Content
