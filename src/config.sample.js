const config = {
  api: {
    baseUrl: 'http://localhost:3030',
    client: 'ctf-dashboard'
  },
  campaigns: {
    setup: {
      campaignUrn: 'urn:va:coachtofit:surveys:setUp',
      surveyId: 'setUp'
    },
    weight: {
      campaignUrn: 'urn:va:coachtofit:surveys:weight',
      surveyId: 'weight'
    },
    steps: {
      campaignUrn: 'urn:va:coachtofit:surveys:steps',
      surveyId: 'steps'
    },
    goals: {
      campaignUrn: 'urn:va:coachtofit:surveys:trackGoals',
      surveyId: 'trackGoalsSurvey'
    },
    chapterSubmit: {
      campaignUrn: 'urn:va:coachtofit:surveys:trackChapterSubmit',
      surveyId: 'trackChapterSubmit'
    },
    chapterRelease: {
      campaignUrn: 'urn:va:coachtofit:surveys:trackChaptersRelease',
      surveyId: 'trackChaptersRelease'
    },
    coach: {
      campaignUrn: 'urn:va:coachtofit:surveys:coachSurvey3',
      initialSurveyId: 'initial',
      hubSurveyId: 'topicSelection',
      nextCallSurveyId: 'nextCall',
      topicSurveyIds: [
        'maintenance',
        'motivation',
        'physical',
        'nutrition',
        'nextCall'
      ]
    }
  },
  organization: 'Coach to Fit',
  emailDomain: 'va.gov',
  studyIdPrefix: 'GLAHSU'
}

module.exports = config
