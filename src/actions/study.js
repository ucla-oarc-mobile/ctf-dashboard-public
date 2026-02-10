import dateFormat from 'dateformat'

import { openDialog } from './dialog'
import { request } from '../helpers/request'
import { displayName, ONE_DAY } from '../helpers/types'
import config from '../config'

// ACTION CREATORS //

function studySetData(study) {
  return {
    type: 'STUDY_SET_DATA',
    study
  }
}

// API METHODS //

export function studyFetchData(studyId) {
  let dispatch
  let getState

  let studyData = {
    id: studyId,
    username: config.studyIdPrefix + studyId,
    serviceBranch: null,
    coachName: null,
    age: null,
    appActivation: null,
    initialWeight: null,
    targetWeight: null,
    stepsWeeklySum: null,
    stepsDailyGoal: null,
    lastActivity: null,
    nextCall: null,
    progress: [],
    weightHistory: [],
    stepsHistory: [],
    callHistory: []
  }

  function fetchSetup(json) {
    const participant = json.find(user => user.username === studyData.username)
    if (!participant) {
      dispatch(openDialog('Participant not found.'))
      return
    }

    if (participant.attributes.serviceBranch) {
      studyData.serviceBranch = participant.attributes.serviceBranch
    }

    const coachUsername = participant.attributes.coach
    if (coachUsername) {
      const coach = json.find(user => user.username === coachUsername)
      studyData.coachName = displayName(coach)
    }

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.setup.campaignUrn,
      survey_id_list: config.campaigns.setup.surveyId,
      user_list: studyData.username,
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows'
    }

    request(url, 'POST', params, dispatch, getState, fetchChapterRelease)
  }

  function fetchChapterRelease(json) {
    if (json.data.length > 0) {
      studyData.age = json.data[0].responses.age.prompt_response
      studyData.appActivation = new Date(json.data[0].time)
      studyData.initialWeight = json.data[0].responses.beginningWeight.prompt_response
      studyData.targetWeight = json.data[0].responses.targetWeightPounds.prompt_response
    }

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.chapterRelease.campaignUrn,
      survey_id_list: config.campaigns.chapterRelease.surveyId,
      user_list: studyData.username,
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows'
    }

    request(url, 'POST', params, dispatch, getState, fetchChapterSubmit)
  }

  function fetchChapterSubmit(json) {
    // Add the chapter progress, newest data first
    json.data.forEach((result) => {
      const parsed = JSON.parse(result.responses.metadata.prompt_response)

      Object.keys(parsed).forEach((type) => {
        const chapterNumber = parseInt(parsed[type].chapterNumber, 10)
        let releaseDate = null

        if (parsed[type].time_formatted) {
          releaseDate = new Date(parsed[type].time_formatted)
        }

        // Because newest data comes first, don't overwrite with older chapter info
        if (studyData.progress[chapterNumber]) {
          return
        }

        studyData.progress[chapterNumber] = {
          type,
          releaseDate,
          name: parsed[type].name
        }
      })
    })

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.chapterSubmit.campaignUrn,
      survey_id_list: config.campaigns.chapterSubmit.surveyId,
      user_list: studyData.username,
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows',
      sort_order: 'timestamp,user,survey'
    }

    request(url, 'POST', params, dispatch, getState, fetchGoals)
  }

  function fetchGoals(json) {
    let lastChapter = 0

    json.data.forEach((result) => {
      const chapterNumber = result.responses.chapterNumber.prompt_response
      const chapter = studyData.progress[chapterNumber]

      // Because oldest data comes first, don't overwrite with repeat submissions
      // Also ignore this submission if somehow the chapter was never released
      if (!chapter || chapter.submitDate) {
        return
      }

      chapter.submitDate = new Date(result.time)

      // Update the last chapter number if needed
      if (chapterNumber > lastChapter) {
        lastChapter = chapterNumber
        studyData.lastActivity = chapter.submitDate
      }
    })

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.goals.campaignUrn,
      survey_id_list: config.campaigns.goals.surveyId,
      user_list: studyData.username,
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows'
    }

    request(url, 'POST', params, dispatch, getState, fetchWeightHistory)
  }

  function fetchWeightHistory(json) {
    // Add the goals for each chapter, newest data first
    json.data.forEach((result) => {
      const matchingChapter = studyData.progress.find(chapter => (
        chapter &&
        chapter.type === result.responses.goalType.prompt_response &&
        chapter.name === result.responses.module.prompt_response
      ))

      // Because newest data comes first, don't overwrite with older goal info
      if (matchingChapter && !matchingChapter.goalDescription) {
        matchingChapter.goalDescription = result.responses.goalTitle.prompt_response
        matchingChapter.goalCount = parseInt(result.responses.goalCount.prompt_response, 10)
        matchingChapter.goalFinish = parseInt(result.responses.goalFinish.prompt_response, 10)
      }
    })

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.weight.campaignUrn,
      survey_id_list: config.campaigns.weight.surveyId,
      user_list: studyData.username,
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows'
    }

    request(url, 'POST', params, dispatch, getState, fetchStepsHistory)
  }

  function fetchStepsHistory(json) {
    let weight = {}

    json.data.forEach((result) => {
      const decoded = JSON.parse(result.responses.weightValue.prompt_response)

      decoded.daily.forEach((entry) => {
        if (!weight[entry.startDate]) {
          let value = entry.value

          // Convert kg, assume lbs otherwise
          if (entry.unit === 'kg') {
            value = value * 2.20462
          }

          weight[entry.startDate] = parseFloat(value.toFixed(1))
        }
      })
    })

    // Turn the date/weight pairs into an array
    Object.keys(weight).forEach((key) => {
      studyData.weightHistory.push({
        date: new Date(key),
        value: weight[key]
      })
    })

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.steps.campaignUrn,
      survey_id_list: config.campaigns.steps.surveyId,
      user_list: studyData.username,
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows'
    }

    request(url, 'POST', params, dispatch, getState, fetchCoachSurvey)
  }

  function fetchCoachSurvey(json) {
    let steps = {}

    json.data.forEach((result) => {
      const decoded = JSON.parse(result.responses.stepsValue.prompt_response)

      decoded.daily.forEach((entry) => {
        const ymd = entry.date_formatted.split('/')
        const isoDate = ymd[2] + '-' + ymd[0] + '-' + ymd[1]

        if (!steps[isoDate]) {
          steps[isoDate] = entry.count
        }
      })
    })

    // Set bounds for steps data
    // Earliest date is the first date we have data for
    // Latest date is today
    if (Object.keys(steps).length > 0) {
      const today = Date.now()
      let d = new Date(Object.keys(steps).sort()[0])

      while (d.getTime() < today) {
        const dateFormatted = dateFormat(d, 'yyyy-mm-dd')

        studyData.stepsHistory.push({
          date: new Date(d),
          value: steps[dateFormatted] || 0
        })

        let day = d.getDate()
        ++day
        d.setDate(day)
      }
    }

    // Calculate step total for last full 7 days BEFORE today
    const now = new Date()
    const thisWeekHistory = studyData.stepsHistory.filter(entry => (
      now - entry.date < 8 * ONE_DAY &&
      now - entry.date > ONE_DAY
    ))
    studyData.stepsWeeklySum = thisWeekHistory.reduce((sum, currentValue) => (
      sum + currentValue.value
    ), 0)

    // Calculate daily goal (daily average for the past week + 20%)
    const dailyAverage = studyData.stepsWeeklySum / 7
    studyData.stepsDailyGoal = Math.max(Math.floor(dailyAverage * 1.2), 1000)

    // Sort weight history chronologically
    studyData.weightHistory.sort((a, b) => {
      if (a.date < b.date) {
        return -1
      }
      else if (a.date > b.date) {
        return 1
      }
      else {
        return 0
      }
    })

    const url = '/ohmage/survey_response/read'

    const params = {
      campaign_urn: config.campaigns.coach.campaignUrn,
      survey_id_list: 'urn:ohmage:special:all',
      user_list: 'urn:ohmage:special:all',
      column_list: 'urn:ohmage:special:all',
      output_format: 'json-rows'
    }

    request(url, 'POST', params, dispatch, getState, onSuccess)
  }

  function onSuccess(json) {
    const initialSurveys = json.data.filter(result => (
      result.survey_id === 'initial' &&
      result.responses.participantUsername.prompt_response === studyData.username
    ))

    studyData.callHistory = initialSurveys.map(result => result.time)

    // The next call is in the most recent coach survey
    if (studyData.callHistory.length > 0) {
      const latestSurvey = json.data.find(result => (
        result.survey_id === 'nextCall' &&
        result.time === studyData.callHistory[0]
      ))
      const nextCall = latestSurvey.responses.nextCallSchedule

      // Set next call if it's valid
      if (
        nextCall &&
        nextCall.prompt_response !== 'SKIPPED' &&
        nextCall.prompt_response !== 'NOT_DISPLAYED'
      ) {
        studyData.nextCall = new Date(nextCall.prompt_response)
      }
    }

    dispatch(studySetData(studyData))
  }

  const url = '/users'

  return (newDispatch, newGetState) => {
    dispatch = newDispatch
    getState = newGetState
    request(url, 'GET', {}, dispatch, getState, fetchSetup)
  }
}
