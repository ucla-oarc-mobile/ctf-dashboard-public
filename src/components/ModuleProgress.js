import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-flexbox-grid'
import dateFormat from 'dateformat'

import IconHeading from './IconHeading'
import { learningStatus } from '../helpers/types'

import '../styles/ModuleProgress.css'
import nutritionIcon from '../images/nutrition.svg'
import physicalIcon from '../images/physical.svg'
import goalsIcon from '../images/goals.svg'
import meterStalled from '../images/meterStalled.svg'
import meterBehind from '../images/meterBehind.svg'
import meterOnTrack from '../images/meterOnTrack.svg'

function ModuleProgress(props) {
  const meterImages = {
    'stalled': meterStalled,
    'behind': meterBehind,
    'on-track': meterOnTrack
  }

  const icon = props.type === 'nutrition' ? nutritionIcon : physicalIcon
  let statusClass = ''
  let status = ''
  let statusBar = ' '
  let submitInfo = ''
  let goalDescription = 'No goal selected.'
  let goalTracker = null

  // If the chapter was submitted, show when that happened
  if (props.submitDate) {
    submitInfo = 'Completed on ' + dateFormat(props.submitDate, 'mm/dd/yy')
  }

  // Otherwise, show how far behind the participant is
  else {
    statusClass = learningStatus(props.chapterNumber, props.lastSubmittedChapter)
    status = (statusClass || '').replace(/-/, ' ').toUpperCase()
    statusBar = 'Learning Status: ' + status

  }

  let goalCount = props.goalCount || 0
  if (goalCount === 1) {
    goalCount += ' time'
  }
  else if (goalCount > 1) {
    goalCount += ' times'
  }

  if (props.goalDescription) {
    goalDescription = props.type[0].toUpperCase() + props.type.substr(1) +
      ' Goal: ' + props.goalDescription

    goalTracker = (
      <Col xs={3}>
        <div className="goal-tracker text-center">
          <div className="goal-tracker-heading">
            Goal Tracker
          </div>
          <div className="goal-tracker-body">
            {goalCount}
          </div>
        </div>
      </Col>
    )
  }

  return (
    <div className="ModuleProgress panel">
      <div className="panel-heading">
        <IconHeading icon={icon} text={props.chapterName} />
      </div>

      <div className="panel-section">
        <div className={statusClass + ' status-bar text-center'}>
          {statusBar}
        </div>

        <Row>
          <Col xsOffset={2} xs={5}>
            <div className="status-description">
              Released on {dateFormat(props.releaseDate, 'mm/dd/yy')}
              <br />
              {submitInfo}
            </div>
          </Col>

          <Col xs={5}>
            <img
              src={meterImages[statusClass]}
              alt={status}
              className="meter"
            />
          </Col>
        </Row>
      </div>

      <div className="panel-section">
        <div className="text-center">
          <IconHeading icon={goalsIcon} text="Goals" />
        </div>

        <Row>
          <Col xsOffset={1} xs={7}>
            <div className="goal-description">
              {goalDescription}
            </div>
          </Col>

          {goalTracker}
        </Row>
      </div>
    </div>
  )
}

ModuleProgress.propTypes = {
  type: PropTypes.oneOf(['nutrition', 'physical']).isRequired,
  chapterNumber: PropTypes.number.isRequired,
  lastSubmittedChapter: PropTypes.number.isRequired,
  chapterName: PropTypes.string.isRequired,
  releaseDate: PropTypes.object.isRequired,
  submitDate: PropTypes.object,
  goalDescription: PropTypes.string,
  goalCount: PropTypes.number
}

export default ModuleProgress
