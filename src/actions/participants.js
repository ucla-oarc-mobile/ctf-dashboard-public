import { request } from '../helpers/request'
import config from '../config'

// ACTION CREATORS //

function participantsSetData(participants) {
  return {
    type: 'PARTICIPANTS_SET_DATA',
    participants
  }
}

// API METHODS //

export function participantsFetchData() {
  let dispatch
  let getState

  let participantNames = []
  let coaches = {}
  let genders = {}
  let lastChapters = {}
  let lastActivities = {}
  let lastReleases = {}
  let coachSurveys = {}

  function fetchSetup(json) {
    json.filter(user => user.attributes.role === 'participant').forEach((user) => {
      participantNames.push(user.username)
      coaches[user.username] = user.attributes.coach
    })

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.setup.campaignUrn,
      survey_id_list: config.campaigns.setup.surveyId,
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows',
      sort_order: 'user,timestamp,survey',
      user_list: 'urn:ohmage:special:all'
    }

    request(url, 'POST', params, dispatch, getState, fetchChapterRelease)
  }

  function fetchChapterRelease(json) {
    json.data.forEach((result) => {
      const glossary = result.responses.gender.prompt_choice_glossary
      const choice = result.responses.gender.prompt_response

      genders[result.user] = glossary[choice].label
    })

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.chapterRelease.campaignUrn,
      survey_id_list: config.campaigns.chapterRelease.surveyId,
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows',
      sort_order: 'user,timestamp,survey',
      user_list: 'urn:ohmage:special:all'
    }

    request(url, 'POST', params, dispatch, getState, fetchChapterSubmit)
  }

  function fetchChapterSubmit(json) {
    // Record the highest released chapter (always a physical activity one)
    json.data.forEach((result) => {
      const parsed = JSON.parse(result.responses.metadata.prompt_response)
      const chapterNumber = parseInt(parsed.physical.chapterNumber, 10)

      if (chapterNumber > (lastReleases[result.user] || 0)) {
        lastReleases[result.user] = chapterNumber
      }
    })

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.chapterSubmit.campaignUrn,
      survey_id_list: config.campaigns.chapterSubmit.surveyId,
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows',
      sort_order: 'user,timestamp,survey',
      user_list: 'urn:ohmage:special:all'
    }

    request(url, 'POST', params, dispatch, getState, fetchCoachSurvey)
  }

  function fetchCoachSurvey(json) {
    // Record the highest completed chapter and when they did it
    json.data.forEach((result) => {
      const chapterNumber = result.responses.chapterNumber.prompt_response

      if (chapterNumber > (lastChapters[result.user] || 0)) {
        lastChapters[result.user] = chapterNumber
        lastActivities[result.user] = new Date(result.time)
      }
    })

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.coach.campaignUrn,
      survey_id_list: 'urn:ohmage:special:all',
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows',
      sort_order: 'timestamp,user,survey',
      user_list: 'urn:ohmage:special:all'
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }

  function onSuccess(json) {
    json.data.forEach((result) => {
      // The primary key is survey submit times, use those to uniquely ID coach surveys
      if (!coachSurveys[result.time]) {
        coachSurveys[result.time] = {}
      }
      const entry = coachSurveys[result.time]

      // For initial surveys, record the participant username and "what happened"
      if (result.survey_id === 'initial') {
        entry.participant = result.responses.participantUsername.prompt_response

        // Use "what happened" as a lookup into the actual responses
        const whatHappened = result.responses.whatHappenedWhenYouCalledParticipant
        entry.coachingStatus = whatHappened.prompt_choice_glossary[whatHappened.prompt_response].label
      }

      else if (result.survey_id === 'nextCall') {
        const nextCall = result.responses.nextCallSchedule

        // Set next call if it's valid
        if (
          nextCall &&
          nextCall.prompt_response !== 'SKIPPED' &&
          nextCall.prompt_response !== 'NOT_DISPLAYED'
        ) {
          entry.nextCall = new Date(nextCall.prompt_response)
        }
        else {
          entry.nextCall = null
        }

        // Check for coach notes in 2 different responses
        let coachNotes = ['coachNotesWithNextCallSchedule', 'coachNotesWithoutNextCallSchedule'].map(id => (
          result.responses[id].prompt_response
        ))

        // Filter out blank responses
        coachNotes = coachNotes.filter(response => (
          response !== 'SKIPPED' && response !== 'NOT_DISPLAYED'
        ))

        if (coachNotes.length > 0) {
          entry.coachNotes = coachNotes[0]
        }
      }
    })

    const surveyTimes = Object.keys(coachSurveys).sort().reverse()

    const participants = participantNames.map((username) => {
      // Only the most recent survey for this participant counts
      const mostRecent = surveyTimes.find(time => (
        coachSurveys[time].participant === username
      ))
      const coachSurvey = coachSurveys[mostRecent] || {}

      return {
        username: username,
        lastChapter: lastChapters[username] || 0,
        lastRelease: lastReleases[username] || 0,
        lastActivity: lastActivities[username],
        nextCall: coachSurvey.nextCall,
        gender: genders[username] || '',
        coach: coaches[username] || 'Unassigned',
        coachingStatus: coachSurvey.coachingStatus || '',
        coachNotes: coachSurvey.coachNotes || ''
      }
    })

    dispatch(participantsSetData(participants))
  }

  const url = '/users'

  return (newDispatch, newGetState) => {
    dispatch = newDispatch
    getState = newGetState
    request(url, 'GET', {}, dispatch, getState, fetchSetup)
  }
}
