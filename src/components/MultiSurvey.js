import React from 'react'
import PropTypes from 'prop-types'
import { Prompt, Link } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Button } from '@blueprintjs/core'

import WeightStatus from './WeightStatus'
import WeightChart from './WeightChart'
import StepChart from './StepChart'
import ModuleProgress from './ModuleProgress'
import Survey from './Survey'
import config from '../config'

import '../styles/Survey.css'
import completeIcon from '../images/complete.svg'
import cancelIcon from '../images/cancel.svg'
import calendarIcon from '../images/calendar.svg'

class MultiSurvey extends React.Component {
  constructor(props) {
    super(props)

    this.quitMessage = 'Responses to the Call Survey are not submitted yet, data will be lost. Do you want to continue?'
    this.surveyIds = config.campaigns.coach

    this.state = {
      currentSurveyId: this.surveyIds.initialSurveyId,
      responses: {},
      readyResponses: null
    }
  }

  // RENDER METHODS //

  render() {
    return (
      <Grid fluid className="Survey">
        <Row>
          <Col xs={6} xsOffset={6}>
            <h1 className="text-center">
              Call Survey
            </h1>
          </Col>
        </Row>

        <Row>
          <Col xs={6}>
            <div className="panel">
              <h2 className="panel-heading">
                User History
              </h2>
              {this.renderUserHistory()}
            </div>
          </Col>

          <Col xs={6}>
            {this.renderCurrentSurvey()}
            {this.renderExitConfirmation()}
          </Col>
        </Row>
      </Grid>
    )
  }

  renderUserHistory() {
    const study = this.props.study

    if (study) {
      let progress = []
      let lastSubmittedChapter = 0

      // Calculate the last chapter submitted by the participant
      for (let i = 1; i < study.progress.length; ++i) {
        if (!study.progress[i]) {
          continue
        }

        if (study.progress[i].submitDate && i > lastSubmittedChapter) {
          lastSubmittedChapter = i
        }
      }

      for (let i = study.progress.length - 1; i > 0; --i) {
        const chapter = study.progress[i]
        if (!chapter) {
          continue
        }

        progress.push(
          <div className="panel-section" key={i}>
            <ModuleProgress
              type={chapter.type}
              chapterNumber={i}
              lastSubmittedChapter={lastSubmittedChapter}
              chapterName={chapter.name}
              releaseDate={chapter.releaseDate}
              submitDate={chapter.submitDate}
              goalDescription={chapter.goalDescription}
              goalCount={chapter.goalCount}
            />
          </div>
        )
      }

      return (
        <div className="scrollable">
          <div className="panel-section" key="weight-status">
            <WeightStatus
              history={study.weightHistory}
              initial={study.initialWeight}
              target={study.targetWeight}
            />
          </div>
          <div className="panel-section" key="weight-chart">
            <WeightChart
              width={400}
              height={200}
              history={study.weightHistory}
              target={study.targetWeight}
            />
          </div>
          <div className="panel-section" key="step-chart">
            <StepChart
              width={400}
              height={200}
              history={study.stepsHistory}
              dailyGoal={study.stepsDailyGoal}
            />
          </div>
          {progress}
        </div>
      )
    }

    else {
      return null
    }
  }

  renderCurrentSurvey() {
    if (this.props.submitted) {
      return (
        <div style={{ textAlign: 'center' }}>
          <p className="complete">
            Your responses were successfully recorded.
          </p>

          <Link
            to={'/studies/' + this.props.study.id}
            role="button"
            className="pt-button button-primary"
            tabIndex="0"
          >
            Done
          </Link>
        </div>
      )
    }

    else if (this.state.readyResponses) {
      return (
        <div style={{ textAlign: 'center' }}>
          <p>
            Your responses are ready to submit.
          </p>

          <Button
            className="button-primary"
            onClick={this.submit}
          >
            Submit
            <span className="button-icon-right" />
          </Button>
        </div>
      )
    }

    else if (this.state.currentSurveyId === this.surveyIds.hubSurveyId) {
      return this.renderTopicSelection()
    }

    else {
      return (
        <Survey
          key={this.state.currentSurveyId}
          surveyId={this.state.currentSurveyId}
          study={this.props.study}
          prompts={this.props.surveys[this.state.currentSurveyId]}
          responses={this.state.responses[this.state.currentSurveyId]}
          onCancel={this.onSurveyCancel}
          onFinish={this.onSurveyFinish}
        />
      )
    }
  }

  renderTopicSelection() {
    const topics = [{
      text: 'Maintenance',
      survey: 'maintenance',
    }, {
      text: 'Motivation',
      survey: 'motivation'
    }, {
      text: 'Physical Activity',
      survey: 'physical'
    }, {
      text: 'Nutrition',
      survey: 'nutrition'
    }]

    const buttons = topics.map((topic, i) => {
      let classes = 'pt-fill topic topic-' + topic.survey
      let selectSurvey = () => this.selectSurvey(i)
      let disabled = false
      let ariaLabel = null
      let completeBadge

      // If the survey is complete, visually mark it as such
      if (this.state.responses[topic.survey]) {
        classes += ' complete'
        selectSurvey = null
        disabled = true
        ariaLabel = topic.text + ' complete'

        completeBadge = (
          <img
            className="badge"
            src={completeIcon}
            alt="complete"
            aria-hidden="true"
          />
        )
      }

      return (
        <Col xs={3} key={i}>
          <Button
            className={classes}
            onClick={selectSurvey}
            disabled={disabled}
            aria-label={ariaLabel}
          >
            {completeBadge}
            {topic.text}
          </Button>
        </Col>
      )
    })

    return (
      <div className="topic-selection">
        <Row>
          <Col xs={12}>
            <h2 className="text-center">
              Topic Selection
            </h2>
          </Col>
        </Row>

        <Row>
          {buttons}
        </Row>

        <Row>
          <Col xs={6}>
            <Button
              className="pt-fill button-inverse"
              onClick={this.onSurveyCancel}
            >
              <img src={cancelIcon} alt="" />
              Cancel Call Survey
            </Button>
          </Col>
          <Col xs={6}>
            <Button
              className="pt-fill button-primary"
              onClick={() => this.selectSurvey(4)}
            >
              <img src={calendarIcon} alt="" />
              Complete Call Survey and Schedule Next Appointment
              <span className="button-icon-forward" />
            </Button>
          </Col>
        </Row>
      </div>
    )
  }

  renderExitConfirmation() {
    // If the survey was submitted, allow the user to leave at will
    if (this.props.submitted) {
      return null
    }

    // Otherwise, bug them before leaving
    else {
      return (
        <Prompt message={this.quitMessage} />
      )
    }
  }

  // EVENT HANDLERS //

  onSurveyCancel = () => {
    // Canceling at any point will result in some data loss, so confirm first
    this.props.openDialog(this.quitMessage, null, () => {
      const initialResponses = this.state.responses[this.surveyIds.initialSurveyId]

      // Quitting initial or hub survey returns the coach to User History
      if (
        this.state.currentSurveyId === this.surveyIds.initialSurveyId ||
        this.state.currentSurveyId === this.surveyIds.hubSurveyId
      ) {
        window.location = '/studies/' + this.props.study.id
      }

      // If no coaching happened, quitting next call returns the coach to the initial survey
      else if (initialResponses && initialResponses.whatHappenedWhenYouCalledParticipant !== '3') {
        this.setState({
          currentSurveyId: this.surveyIds.initialSurveyId
        })
      }

      // Otherwise, take them back to the hub
      else {
        this.setState({
          currentSurveyId: this.surveyIds.hubSurveyId
        })
      }
    }, 'No, Continue Survey', 'Yes, Start Survey Again')
  }

  onSurveyFinish = (responses) => {
    // The user just finished the initial survey
    if (this.state.currentSurveyId === this.surveyIds.initialSurveyId) {
      let newState = {
        responses: {}
      }

      // If they are doing coaching, take them to the hub
      if (responses.whatHappenedWhenYouCalledParticipant === '3') {
        newState.currentSurveyId = this.surveyIds.hubSurveyId
      }

      // Otherwise, take them to call scheduling
      else {
        newState.currentSurveyId = this.surveyIds.nextCallSurveyId
      }

      // Record responses and go to next survey
      newState.responses[this.surveyIds.initialSurveyId] = responses
      this.setState(newState)
    }

    // The user selected a module from the hub, so honor their selection
    else if (this.state.currentSurveyId === this.surveyIds.hubSurveyId) {
      this.setState({
        currentSurveyId: this.surveyIds.topicSurveyIds[responses.topic]
      })
    }

    // The user finished the final survey, so show them the submit screen
    else if (this.state.currentSurveyId === this.surveyIds.nextCallSurveyId) {
      this.setState({
        readyResponses: responses
      })
    }

    // Otherwise, back to the hub!
    else {
      // Merge finished survey's responses into state
      this.setState((prevState) => {
        prevState.responses[prevState.currentSurveyId] = responses
        prevState.currentSurveyId = this.surveyIds.hubSurveyId

        return prevState
      })
    }
  }

  submit = () => {
    let submitData = this.state.responses

    // Merge in the final survey data into the existing responses
    submitData[this.surveyIds.nextCallSurveyId] = this.state.readyResponses

    // Shove in the participant username
    submitData[this.surveyIds.initialSurveyId].participantUsername = this.props.study.username

    this.props.onSubmit(submitData)
  }

  // HELPER METHODS //

  selectSurvey(index) {
    // Simulate finishing the hub suvey
    this.onSurveyFinish({ topic: index })
  }
}

MultiSurvey.propTypes = {
  study: PropTypes.object,
  surveys: PropTypes.object.isRequired,
  creationTimestamp: PropTypes.string.isRequired,
  submitted: PropTypes.bool,
  previousResponses: PropTypes.arrayOf(PropTypes.object),
  onSubmit: PropTypes.func.isRequired,
  openDialog: PropTypes.func.isRequired
}

export default MultiSurvey
