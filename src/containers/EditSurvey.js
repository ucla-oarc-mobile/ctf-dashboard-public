import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Prompt, Redirect, Link } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Button } from '@blueprintjs/core'

import WeightStatus from '../components/WeightStatus'
import WeightChart from '../components/WeightChart'
import StepChart from '../components/StepChart'
import ModuleProgress from '../components/ModuleProgress'
import Survey from '../components/Survey'
import { studyFetchData } from '../actions/study'
import { campaignFetchDefinition, campaignSubmitResponses } from '../actions/campaign'
import { responsesFetchSurvey } from '../actions/responses'
import { openDialog } from '../actions/dialog'

class EditSurvey extends React.Component {
  constructor() {
    super()

    this.state = {
      readyResponses: null
    }
  }

  componentDidMount() {
    const studyId = this.props.match.params.studyId
    this.surveyResponseId = this.props.match.params.surveyResponseId

    this.quitMessage = 'Responses to the Call Survey are not submitted yet, data will be lost. Do you want to continue?'

    this.props.fetchStudyData(studyId)
    this.props.fetchCampaignData()
    this.props.fetchResponseData(this.surveyResponseId)
  }

  // RENDER METHODS //

  render() {
    if (!this.props.session.isLoggedIn()) {
      return (
        <Redirect to="/login" />
      )
    }

    else if (this.props.study && this.props.campaign && this.props.responses.length > 0) {
      return (
        <Grid fluid className="Survey">
          <Row>
            <Col xs={6} xsOffset={6}>
              <h1 className="text-center">
                Edit Call Survey
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
              {this.renderSurvey()}
              {this.renderExitConfirmation()}
            </Col>
          </Row>
        </Grid>
      )
    }

    else {
      return null
    }
  }

  renderUserHistory() {
    const study = this.props.study

    if (study) {
      let progress = []
      let lastSubmittedChapter = 0

      // Calculate the last chapter submitted by the participant
      for (let i = 1; i < study.progress.length; ++i) {
        if (study.progress[i].submitDate && i > lastSubmittedChapter) {
          lastSubmittedChapter = i
        }
      }

      for (let i = study.progress.length - 1; i > 0; --i) {
        const chapter = study.progress[i]

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

  renderSurvey() {
    if (this.props.campaign.submitted) {
      const urlBase = '/studies/' + this.props.study.id + '/review/'

      return (
        <div style={{ textAlign: 'center' }}>
          <p className="complete">
            Your responses were successfully updated.
          </p>

          <Link
            to={urlBase + this.props.responses[0].timestamp}
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

    else {
      // When editing, only one survey's responses are pulled in
      const survey = this.props.responses[0]

      return (
        <Survey
          study={this.props.study}
          surveyId={survey.surveyId}
          prompts={this.props.campaign.surveys[survey.surveyId]}
          responses={survey.responses}
          onCancel={this.onCancel}
          onFinish={this.onFinish}
        />
      )
    }
  }

  renderExitConfirmation() {
    // If the survey was submitted, allow the user to leave at will
    if (this.props.campaign.submitted) {
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

  onCancel = () => {
    // Canceling in the middle will result in some data loss, so confirm first
    this.props.openDialog(this.quitMessage, null, () => {
      const urlBase = '/studies/' + this.props.study.id + '/review/'
      window.location = urlBase + this.props.responses[0].timestamp
    }, 'No, Continue Survey', 'Yes, Start Survey Again')
  }

  onFinish = (responses) => {
    this.setState({
      readyResponses: responses
    })
  }

  submit = () => {
    const surveyId = this.props.responses[0].surveyId
    const timestamp = this.props.responses[0].timestamp

    let responseObject = {}
    responseObject[surveyId] = this.state.readyResponses

    this.props.submitResponses(responseObject, this.surveyResponseId, timestamp)
  }
}

EditSurvey.propTypes = {
  session: PropTypes.object.isRequired,
  fetchStudyData: PropTypes.func.isRequired,
  fetchCampaignData: PropTypes.func.isRequired,
  submitResponses: PropTypes.func.isRequired,
  study: PropTypes.object,
  campaign: PropTypes.object,
  responses: PropTypes.arrayOf(PropTypes.object)
}

const mapStateToProps = (state) => {
  return {
    session: state.session,
    study: state.study,
    campaign: state.campaign,
    responses: state.responses
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchStudyData: (studyId) => dispatch(studyFetchData(studyId)),
    fetchCampaignData: () => dispatch(campaignFetchDefinition()),
    fetchResponseData: (surveyResponseId) => dispatch(responsesFetchSurvey(surveyResponseId)),
    submitResponses: (responses, surveyResponseId, timestamp) => (
      dispatch(campaignSubmitResponses(responses, surveyResponseId, timestamp))
    ),
    openDialog: (content, onClose, onConfirm, closeText, confirmText) => dispatch(openDialog(content, onClose, onConfirm, closeText, confirmText))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditSurvey)
