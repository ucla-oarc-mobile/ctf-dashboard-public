import React from 'react'
import PropTypes from 'prop-types'
import { Link, Redirect } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Button } from '@blueprintjs/core'
import dateFormat from 'dateformat'

import WeightStatus from './WeightStatus'
import WeightChart from './WeightChart'
import StepStatus from './StepStatus'
import StepChart from './StepChart'
import ModuleProgress from './ModuleProgress'
import { ONE_DAY } from '../helpers/types'

import '../styles/UserHistory.css'
import calendarIcon from '../images/calendar.svg'

class UserHistory extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedSurvey: null,
      doRedirect: false
    }
  }

  // RENDER METHODS //

  render() {
    // Send the user to a past survey if they clicked the button
    if (this.state.doRedirect) {
      const urlBase = '/studies/' + this.props.studyId + '/review/'

      return (
        <Redirect to={urlBase + this.state.selectedSurvey} />
      )
    }

    else {
      return (
        <Grid fluid className="UserHistory">
          <Row>
            <Col xs={4}>
              <Link
                to="/"
                role="button"
                className="pt-button button-inverse"
              >
                <span className="button-icon-back" />
                Back to panel management
              </Link>
            </Col>

            <Col xs={4} className="text-center">
              <h1>
                User History
              </h1>
            </Col>
          </Row>

          <Row className="box-upper">
            <Col xs={6} className="box-left">
              {this.renderStats()}
            </Col>
            <Col xs={6} className="box-right">
              {this.renderControls()}
            </Col>
          </Row>

          <Row className="box-lower">
            <Col xs={6} className="box-left">
              {this.renderWeightCharts()}
            </Col>
            <Col xs={6}>
              {this.renderStepCharts()}
            </Col>
          </Row>

          <Row>
            <Col xs={12} className="text-center">
              <h2>
                Module Progress
              </h2>
            </Col>
          </Row>

          {this.renderModuleProgress()}
        </Grid>
      )
    }
  }

  renderStats() {
    let activated = ''
    let enrolled = ''
    let lastActivity = ''

    if (this.props.appActivation) {
      const enrolledMs = new Date() - this.props.appActivation
      const enrolledWeeks = Math.floor(enrolledMs / (7 * ONE_DAY))
      activated = dateFormat(this.props.appActivation, 'mm/dd/yy')

      if (enrolledWeeks < 1) {
        enrolled = 'less than a week'
      }
      else {
        enrolled = enrolledWeeks + ' weeks'
      }
    }

    if (this.props.lastActivity) {
      lastActivity = dateFormat(this.props.lastActivity, 'mm/dd/yy')
    }

    // Let researchers/admins see who the user's coach is
    let coachInfo
    if (['researcher', 'admin'].includes(this.props.currentUserRole)) {
      coachInfo = (
        <span>
          Assigned Coach: {this.props.coachName}<br />
        </span>
      )
    }

    return (
      <div className="stats">
        <strong>Study ID {this.props.studyId}</strong><br />
        Age {this.props.age}<br />
        {coachInfo}
        App Activated {activated}<br />
        Enrolled for {enrolled}<br />
        Last Activity Date: {lastActivity}
      </div>
    )
  }

  renderControls() {
    let nextCall = ''

    if (this.props.nextCall) {
      nextCall = dateFormat(this.props.nextCall, 'dddd mm/dd/yy h:MM tt')
    }

    return (
      <div>
        <Row>
          <Col xs={6}>
            <p className="icon-text">
              <img src={calendarIcon} alt="" />
              <small>Next Call Appointment</small><br />
              {nextCall}
            </p>
          </Col>

          <Col xs={6}>
            <Button
              className="button-primary"
              onClick={this.alertCheckSteps}
            >
              <span className="button-icon-survey" />
              Start Call Survey
            </Button>
          </Col>
        </Row>

        <Row>
          <Col xs={6}>
            {this.renderSurveyDropdown()}
          </Col>

          <Col xs={6}>
            <Button
              className="pt-button button-primary button-short"
              onClick={this.reviewSurvey}
            >
              Review
            </Button>
          </Col>
        </Row>
      </div>
    )
  }

  renderWeightCharts() {
    return (
      <div>
        <WeightStatus
          history={this.props.weightHistory}
          initial={this.props.initialWeight}
          target={this.props.targetWeight}
        />
        <WeightChart
          width={400}
          height={300}
          history={this.props.weightHistory}
          target={this.props.targetWeight}
        />
      </div>
    )
  }

  renderStepCharts() {
    return (
      <div>
        <StepStatus
          weeklySum={this.props.stepsWeeklySum}
          dailyGoal={this.props.stepsDailyGoal}
          serviceBranch={this.props.serviceBranch}
          leaderboard={this.props.leaderboard}
          fetchLeaderboard={this.props.fetchLeaderboard}
        />
        <StepChart
          width={400}
          height={300}
          history={this.props.stepsHistory}
          dailyGoal={this.props.stepsDailyGoal}
        />
      </div>
    )
  }

  renderSurveyDropdown() {
    const options = this.props.callHistory.map(timestamp => (
      <option key={timestamp} value={timestamp}>
        Review Call Survey from {dateFormat(timestamp, 'mm/dd/yy')}
      </option>
    ))

    return (
      <div className="styled-select">
        <select onChange={this.onChangeSurvey} aria-label="Review Call Survey">
          <option key="" value=""></option>
          {options}
        </select>
      </div>
    )
  }

  renderModuleProgress() {
    let chapters = {
      nutrition: [],
      physical: []
    }
    let chapterNumbers = []
    let lastSubmittedChapter = 0

    // Calculate the last chapter submitted by the participant
    for (let i = 1; i < this.props.progress.length; ++i) {
      if (!this.props.progress[i]) {
        continue
      }
      if (this.props.progress[i].submitDate && i > lastSubmittedChapter) {
        lastSubmittedChapter = i
      }
    }

    for (let i = this.props.progress.length - 1; i > 0; --i) {
      const chapter = this.props.progress[i]
      if (!chapter) {
        continue
      }

      chapters[chapter.type].push(
        <ModuleProgress
          key={i}
          type={chapter.type}
          chapterNumber={i}
          lastSubmittedChapter={lastSubmittedChapter}
          chapterName={chapter.name}
          releaseDate={chapter.releaseDate}
          submitDate={chapter.submitDate}
          goalDescription={chapter.goalDescription}
          goalCount={chapter.goalCount}
        />
      )

      chapterNumbers.push(i)
    }

    const chapterListItems = chapterNumbers.join(':-:').split(':').map((char, i) => {
      if (char === '-') {
        return (
          <div className="module-progress-line" key={i} />
        )
      }
      else {
        return (
          <div className="module-progress-number" key={i}>
            {char}
          </div>
        )
      }
    })

    return (
      <Row>
        <Col xs={5} className="extra-wide module-progress-left">
          {chapters.nutrition}
        </Col>

        <Col xs={2} className="extra-narrow">
          <div className="module-progress-list text-center">
            {chapterListItems}
          </div>
        </Col>

        <Col xs={5} className="extra-wide">
          {chapters.physical}
        </Col>
      </Row>
    )
  }

  renderAlertContent() {
    return (
      <div>
        Coach Read:<br /><br />
        Open your CoachToFit app on your phone and check your steps now.
        Let me know once you have done this.
        Doing this allows me to see your most recent accomplishments.
      </div>
    )
  }

  // EVENT HANDLERS //

  onChangeSurvey = (event) => {
    this.setState({
      selectedSurvey: event.currentTarget.value
    })
  }

  reviewSurvey = () => {
    if (this.state.selectedSurvey) {
      this.setState({
        doRedirect: true
      })
    }
  }

  alertCheckSteps = () => {
    this.props.openDialog(
      this.renderAlertContent(),
      () => window.location = '/studies/' + this.props.studyId + '/survey'
    )
  }
}

UserHistory.propTypes = {
  currentUserRole: PropTypes.string.isRequired,
  studyId: PropTypes.string.isRequired,
  openDialog: PropTypes.func.isRequired,
  serviceBranch: PropTypes.string,
  coachName: PropTypes.string,
  age: PropTypes.number,
  appActivation: PropTypes.object,
  initialWeight: PropTypes.number,
  targetWeight: PropTypes.number,
  lastActivity: PropTypes.object,
  nextCall: PropTypes.object,
  progress: PropTypes.arrayOf(PropTypes.object).isRequired,
  weightHistory: PropTypes.arrayOf(PropTypes.object).isRequired,
  stepsHistory: PropTypes.arrayOf(PropTypes.object).isRequired,
  callHistory: PropTypes.arrayOf(PropTypes.number).isRequired,
  leaderboard: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchLeaderboard: PropTypes.func.isRequired
}

export default UserHistory
