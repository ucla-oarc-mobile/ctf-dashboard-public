import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import MultiSurvey from '../components/MultiSurvey'
import { studyFetchData } from '../actions/study'
import { campaignFetchDefinition, campaignSubmitResponses } from '../actions/campaign'
import { openDialog } from '../actions/dialog'

class TakeSurvey extends React.Component {
  componentDidMount() {
    const studyId = this.props.match.params.studyId

    this.props.fetchStudyData(studyId)
    this.props.fetchCampaignData()
  }

  // RENDER METHODS //

  render() {
    if (!this.props.session.isLoggedIn()) {
      return (
        <Redirect to="/login" />
      )
    }

    else if (this.props.study && this.props.campaign) {
      return (
        <MultiSurvey
          study={this.props.study}
          surveys={this.props.campaign.surveys}
          creationTimestamp={this.props.campaign.creationTimestamp}
          submitted={this.props.campaign.submitted}
          onSubmit={this.props.submitResponses}
          openDialog={this.props.openDialog}
        />
      )
    }

    else {
      return null
    }
  }
}

TakeSurvey.propTypes = {
  session: PropTypes.object.isRequired,
  fetchStudyData: PropTypes.func.isRequired,
  fetchCampaignData: PropTypes.func.isRequired,
  submitResponses: PropTypes.func.isRequired,
  study: PropTypes.object,
  campaign: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    session: state.session,
    study: state.study,
    campaign: state.campaign
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchStudyData: (studyId) => dispatch(studyFetchData(studyId)),
    fetchCampaignData: () => dispatch(campaignFetchDefinition()),
    submitResponses: (responses) => dispatch(campaignSubmitResponses(responses)),
    openDialog: (content, onClose, onConfirm, closeText, confirmText) => dispatch(openDialog(content, onClose, onConfirm, closeText, confirmText))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TakeSurvey)
