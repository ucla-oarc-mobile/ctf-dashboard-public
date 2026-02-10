import { Parser } from 'xml2js'
import { v4 } from 'uuid'
import jstz from 'jstz'

import { openDialog } from './dialog'
import { request } from '../helpers/request'
import { ensureArray } from '../helpers/types'
import config from '../config'

// ACTION CREATORS //

function campaignSetDefinition(surveys, creationTimestamp) {
  return {
    type: 'CAMPAIGN_SET_DEFINITION',
    surveys,
    creationTimestamp
  }
}

function campaignSubmitSuccess() {
  return {
    type: 'CAMPAIGN_SUBMIT_SUCCESS'
  }
}

// API METHODS //

export function campaignFetchDefinition() {
  const url = '/ohmage/campaign/read'
  const params = {
    campaign_urn_list: config.campaigns.coach.campaignUrn,
    output_format: 'long'
  }

  return (dispatch, getState) => {
    function onSuccess(json) {
      const campaignUrn = json.metadata.items[0]
      const campaignData = json.data[campaignUrn]
      const creationTimestamp = campaignData.creation_timestamp

      parser.parseString(campaignData.xml, (err, res) => {
        if (err) {
          dispatch(openDialog(err.message))
        }

        else {
          const surveyArray = ensureArray(res.campaign.surveys.survey)
          let surveys = {}

          surveyArray.forEach((survey) => {
            surveys[survey.id] = ensureArray(survey.contentList.prompt)
          })

          dispatch(campaignSetDefinition(surveys, creationTimestamp))
        }
      })
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }
}

export function campaignSubmitResponses(responses, surveyResponseId, timestamp) {
  const url = '/ohmage/survey/upload'
  const timezone = jstz.determine().name()

  let surveys = []
  let params = {
    campaign_urn: config.campaigns.coach.campaignUrn,
  }

  // If a survey response ID was passed, it's an update
  if (surveyResponseId) {
    params.update = true
  }

  // Otherwise, submit using the current time
  else {
    timestamp = Date.now()
  }

  return (dispatch, getState) => {
    const campaign = getState().campaign

    Object.keys(responses).forEach((surveyId) => {
      // Get only prompts with a type (this will exclude messages)
      const prompts = campaign.surveys[surveyId].filter(prompt => prompt.promptType)

      // Re-organize the key/value pairs into what Ohmage wants
      // (assume the prompt wasn't displayed if there's no data for it)
      const responsesParsed = prompts.map((prompt) => {
        const id = prompt.id
        let value = responses[surveyId][prompt.id]

        // Assume the prompt wasn't displayed if its value is blank
        // (be careful NOT to interpret 0 as a blank value!)
        if (typeof value !== 'number' && !value) {
          value = 'NOT_DISPLAYED'
        }

        return {
          prompt_id: id,
          value: value
        }
      })

      // Use the survey response ID as a UUID if updating, generate a new one otherwise
      const uuid = surveyResponseId || v4()

      surveys.push({
        survey_key: uuid,
        time: timestamp,
        timezone: timezone,
        location_status: 'unavailable',
        survey_id: surveyId,
        survey_launch_context: {
          launch_time: timestamp,
          launch_timezone: timezone,
          active_triggers: []
        },
        responses: responsesParsed
      })
    })

    params.campaign_creation_timestamp = campaign.creationTimestamp
    params.surveys = JSON.stringify(surveys)

    function onSuccess(json) {
      dispatch(campaignSubmitSuccess())
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }
}

// HELPER OBJECTS //

const parser = new Parser({
  // Don't shove elements into arrays unless there is more than one
  explicitArray: false,
  tagNameProcessors: [
    // Transform <message> into <prompt>, otherwise the order is lost
    tagName => tagName === 'message' ? 'prompt' : tagName
  ]
})
