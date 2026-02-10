import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@blueprintjs/core'
import { Group } from '@vx/group'
import { Bar } from '@vx/shape'
import { scaleBand, scaleLinear } from '@vx/scale'
import { AxisBottom } from '@vx/axis'
import { extent } from 'd3-array'
import dateFormat from 'dateformat'

import IconHeading from './IconHeading'

import '../styles/StepChart.css'
import stepIcon from '../images/steps.svg'

class StepChart extends React.Component {
  constructor(props) {
    super(props)

    // By default show the last 7 days (or if less than 7, all days)
    this.state = {
      startDay: Math.max(this.props.history.length - 7, 0)
    }

    this.xMax = this.props.width
    this.yMax = this.props.height - 110
    this.minBarHeight = 80
  }

  // RENDER METHODS //

  render() {
    const ariaLabel = this.getVisibleHistory().map(item => (
      item.value + ' steps on ' + dateFormat(item.date, 'mmmm d')
    )).join('. ')

    return (
      <div className="StepChart">
        <IconHeading icon={stepIcon} text="Step Count" />
        {this.renderLeftButton()}
        {this.renderRightButton()}

        <svg
          width={this.props.width}
          height={this.props.height}
          className="overflow"
          aria-label={ariaLabel}
        >
          {this.renderBars()}
          <AxisBottom
            scale={this.xScale()}
            top={this.yMax + this.minBarHeight}
            hideTicks
          />
          {this.renderGoal()}
        </svg>
      </div>
    )
  }

  renderLeftButton() {
    // Only display button if there is more data to the left
    if (this.state.startDay > 0) {
      return (
        <Button
          className="pt-button button-primary button-left"
          onClick={this.goLeft}
          aria-label="Previous week's steps"
        >
          <span className="button-icon-left" />
        </Button>
      )
    }
    else {
      return null
    }
  }

  renderRightButton() {
    // Only display button if there is more data to the right
    if (this.state.startDay < this.props.history.length - 7) {
      return (
        <Button
          className="pt-button button-primary button-right"
          onClick={this.goRight}
          aria-label="Next week's steps"
        >
          <span className="button-icon-right" />
        </Button>
      )
    }
    else {
      return null
    }
  }

  renderBars() {
    const xScale = this.xScale()
    const yScale = this.yScale()

    return this.getVisibleHistory().map((a, i) => {
      const barWidth = xScale.bandwidth()
      const barHeight = yScale(a.value) + this.minBarHeight
      const barX = xScale(this.dateLabel(a))
      const barY = this.yMax - barHeight + this.minBarHeight
      const lastDay = this.state.startDay + i === this.props.history.length - 1

      const textX = barX + (barWidth / 2)
      const textY = barY

      // Rectangular highlight for the last day's data
      let rect = null
      if (lastDay) {
        rect = (
          <rect
            className="last-day"
            x={barX + (barWidth - 50) / 2}
            y={this.props.height - 30}
            width={50}
            height={30}
          />
        )
      }

      return (
        <Group key={i} className="steps-bar">
          <Bar x={barX} y={barY} width={barWidth} height={barHeight} />
          <text x={textX} y={textY} dy={25} aria-hidden="true">
            {a.value.toLocaleString()}
          </text>
          {rect}
        </Group>
      )
    })
  }

  renderGoal() {
    const yScale = this.yScale()
    const goalY = this.yMax - yScale(this.props.dailyGoal)

    const points = [
      [  -5, goalY     ],
      [ -10, goalY -  5],
      [ -10, goalY - 25],
      [-120, goalY - 25],
      [-120, goalY + 25],
      [ -10, goalY + 25],
      [ -10, goalY +  5]
    ]
    const polygonPoints = points.map(point => point.join(' ')).join(', ')

    return (
      <Group
        className="target-line"
      >
        <line x1={-1} y1={goalY} x2={this.props.width} y2={goalY} stroke="white" strokeWidth="4px" strokeDasharray="12 8" />
        <line x1={0} y1={goalY} x2={this.props.width} y2={goalY} className="red" />

        <Group className="steps-goal-box" tabIndex={0}>
          <polygon points={polygonPoints} />
          <text dx={-110} dy={goalY - 5} className="white">
            daily goal =
          </text>
          <text dx={-110} dy={goalY + 15} className="white">
           {this.props.dailyGoal.toLocaleString()} steps &#9432;
          </text>
        </Group>

        <Group className="steps-goal-explanation">
          <rect
            className="last-day"
            x={-150}
            y={goalY + 30}
            width={150}
            height={70}
          />
          <text dx={-145} dy={goalY + 45}>
            Average steps for the past
          </text>
          <text dx={-145} dy={goalY + 60}>
            7 days, with 20% increase,
          </text>
          <text dx={-145} dy={goalY + 75}>
            if less than 1000 then
          </text>
          <text dx={-145} dy={goalY + 90}>
            default to 1000.
          </text>
        </Group>
      </Group>
    )
  }

  // EVENT HANDLERS //

  goLeft = () => {
    // Start day can never be less than 0
    this.setState((prevState) => {
      const newStart = this.state.startDay - 1
      return {
        startDay: Math.max(newStart, 0)
      }
    })
  }

  goRight = () => {
    // Start day can never be more than 7 days ago
    this.setState((prevState) => {
      const newStart = this.state.startDay + 1
      return {
        startDay: Math.min(newStart, this.props.history.length - 7)
      }
    })
  }

  // HELPER METHODS //

  xScale() {
    // Map dates to bands
    return scaleBand({
      domain: this.getVisibleHistory().map(this.dateLabel),
      rangeRound: [0, this.xMax],
      padding: 0.1
    })
  }

  yScale() {
    // Add the daily goal to the domain so it's always visible
    let domain = this.getVisibleHistory()
    domain.push({
      value: this.props.dailyGoal
    })

    // Map steps to Y axis (bar heights)
    return scaleLinear({
      domain: extent(domain, a => a.value),
      rangeRound: [0, this.yMax]
    })
  }

  getVisibleHistory() {
    return this.props.history.slice(this.state.startDay, this.state.startDay + 7)
  }

  dateLabel(item) {
    return dateFormat(item.date, 'm/d')
  }
}

StepChart.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  history: PropTypes.arrayOf(PropTypes.object).isRequired,
  dailyGoal: PropTypes.number.isRequired
}

export default StepChart
