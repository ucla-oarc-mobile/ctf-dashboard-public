import React from 'react'
import PropTypes from 'prop-types'
import { Grid, Row, Col } from 'react-flexbox-grid'

import IconHeading from './IconHeading'

import '../styles/WeightStatus.css'
import scaleIcon from '../images/scale.svg'

function WeightStatus(props) {
  const changeTarget = props.initial - props.target
  let loss = null
  let gain = null

  if (props.history.length > 0) {
    const current = props.history[props.history.length - 1].value
    const change = Math.abs(current - props.initial)
    const barStyle = {
      width: (change * 100 / changeTarget) + '%',
      minWidth: '1.5rem',
      maxWidth: '100%'
    }

    if (current < props.initial) {
      loss = (
        <div className="loss" style={barStyle}>
          -{change}
        </div>
      )
    }

    else if (current > props.initial) {
      gain = (
        <div className="gain" style={barStyle}>
          {change}
        </div>
      )
    }
  }

  return (
    <div className="WeightStatus">
      <IconHeading icon={scaleIcon} text="Overall Change in Weight" />

      <p className="note">
        Weight loss target = {changeTarget} lbs
      </p>

      <Grid fluid>
        <Row>
          <Col xs={6} className="text-left">
            Loss
          </Col>
          <Col xs={6} className="text-right">
            Gain
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            {loss}
          </Col>
          <Col xs={6}>
            {gain}
          </Col>
        </Row>
      </Grid>
    </div>
  )
}

WeightStatus.propTypes = {
  history: PropTypes.arrayOf(PropTypes.object).isRequired,
  initial: PropTypes.number,
  target: PropTypes.number
}

export default WeightStatus
