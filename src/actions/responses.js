import moment from 'moment-timezone'

import { request } from '../helpers/request'
import config from '../config'

// ACTION CREATORS //

function responsesSetData(responses) {
  return {
    type: 'RESPONSES_SET_DATA',
    responses
  }
}

// API METHODS //

export function responsesFetchData(timestamp) {
  const url = '/ohmage/survey_response/read'

  // Search within a 1-second window
  const startMoment = moment(timestamp)
  const endMoment = moment(timestamp + 1000)

  // This is critical: Ohmage stupidly expects start and end date search
  // params to be local to the server's time zone!
  const serverStartMoment = startMoment.tz('America/Los_Angeles')
  const serverEndMoment = endMoment.tz('America/Los_Angeles')

  const params = {
    campaign_urn: config.campaigns.coach.campaignUrn,
    survey_id_list: 'urn:ohmage:special:all',
    column_list: 'urn:ohmage:special:all',
    user_list: 'urn:ohmage:special:all',
    start_date: serverStartMoment.format('YYYY-MM-DD HH:mm:ss'),
    end_date: serverEndMoment.format('YYYY-MM-DD HH:mm:ss'),
    output_format: 'json-rows'
  }

  return (dispatch, getState) => {
    function onSuccess(json) {
      let responses = []

      // Surveys ordered according to config
      let surveys = [config.campaigns.coach.initialSurveyId, ...config.campaigns.coach.topicSurveyIds]

      surveys.forEach((surveyId) => {
        let newResponses = []

        const survey = json.data.find(surveyResponse => surveyResponse.survey_id === surveyId)
        if (!survey) {
          return
        }

        // Massage responses object into array of objects, including ID
        newResponses = Object.keys(survey.responses).map(id => {
          return Object.assign(survey.responses[id], { id: id })
        })

        // Sort responses by index
        newResponses.sort((a, b) => {
          return a.prompt_index > b.prompt_index ? 1 : -1
        })

        responses.push({
          surveyId,
          surveyTitle: survey.survey_title,
          timestamp,
          surveyResponseId: survey.survey_key,
          responses: newResponses
        })
      })

      dispatch(responsesSetData(responses))
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }
}

// Fetch just one survey's responses, by survey response ID
export function responsesFetchSurvey(surveyResponseId) {
  const url = '/ohmage/survey_response/read'

  const params = {
    campaign_urn: config.campaigns.coach.campaignUrn,
    survey_id_list: 'urn:ohmage:special:all',
    survey_response_id_list: surveyResponseId,
    column_list: 'urn:ohmage:special:all',
    user_list: 'urn:ohmage:special:all',
    output_format: 'json-rows'
  }

  return (dispatch, getState) => {
    function onSuccess(json) {
      if (json.data.length > 0) {
        let responses = {}

        // Response order doesn't matter, only the values
        Object.keys(json.data[0].responses).forEach((id) => {
          let response = json.data[0].responses[id].prompt_response

          if (response !== 'SKIPPED' && response !== 'NOT_DISPLAYED') {
            responses[id] = response.toString()
          }
        })

        dispatch(responsesSetData([{
          surveyId: json.data[0].survey_id,
          timestamp: json.data[0].time,
          surveyResponseId,
          responses
        }]))
      }

      else {
        dispatch(responsesSetData([]))
      }
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }
}
