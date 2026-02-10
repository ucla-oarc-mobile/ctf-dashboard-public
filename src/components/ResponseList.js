import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid'
import dateFormat from 'dateformat'

import '../styles/ResponseList.css'

function ResponseList(props) {
  const formattedDate = dateFormat(props.timestamp, 'mm/dd/yy')
  const studyUrl = '/studies/' + props.studyId

  const surveys = props.responses.map((survey) => {
    const editSurveyUrl = studyUrl + '/edit/' + survey.surveyResponseId

    // Turn response objects into a single array of interleaved questions and answers
    const responses = survey.responses.map((response) => {
      if (['SKIPPED', 'NOT_DISPLAYED'].includes(response.prompt_response)) {
        return null
      }

      // Ignore formatting
      const promptText = response.prompt_text.replace('`', '')

      const question = (
        <dt key={response.id + '_question'}>
          {promptText}
        </dt>
      )

      // Convert data types for timestamp/choice prompts
      let promptResponse = response.prompt_response
      if (response.prompt_choice_glossary) {
        promptResponse = response.prompt_choice_glossary[promptResponse].label
      }
      else if (response.prompt_type === 'timestamp') {
        promptResponse = dateFormat(promptResponse, 'dddd mm/dd/yy h:MM tt')
      }

      const answer = (
        <dd key={response.id + '_answer'}>
          {promptResponse}
        </dd>
      )

      return [question, answer]
    })

    return (
      <div className="box" key={survey.surveyId}>
        <dl>
          {responses}
        </dl>

        <a
          href={editSurveyUrl}
          role="button"
          className="pt-button button-inverse"
          aria-label={'Edit ' + survey.surveyTitle + ' Survey Responses'}
        >
          <span className="button-icon-edit" />
          Edit
        </a>
      </div>
    )
  })

  return (
    <Grid fluid>
      <Row>
        <Col xs={3}>
          <Link
            to={studyUrl}
            role="button"
            className="pt-button button-inverse"
          >
            <span className="button-icon-back" />
            Back to User History
          </Link>
        </Col>

        <Col xs={6} className="text-center">
          <h1>
            Review Call Survey from {formattedDate}
          </h1>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          {surveys}
        </Col>
      </Row>
    </Grid>
  )
}

ResponseList.propTypes = {
  responses: PropTypes.arrayOf(PropTypes.object).isRequired,
  timestamp: PropTypes.number.isRequired,
  studyId: PropTypes.string.isRequired,
  surveyResponseId: PropTypes.string
}

export default ResponseList
