import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@blueprintjs/core'
import { Group } from '@vx/group'
import { LinePath } from '@vx/shape'
import { GlyphDot } from '@vx/glyph'
import { scaleLinear } from '@vx/scale'
import { AxisBottom } from '@vx/axis'
import { extent } from 'd3-array'
import dateFormat from 'dateformat'

import IconHeading from './IconHeading'

import '../styles/WeightChart.css'
import scaleIcon from '../images/scale.svg'

class WeightChart extends React.Component {
  constructor(props) {
    super(props)

    // By default show the last 7 entries (or if less than 7, all entries)
    this.state = {
      startIndex: Math.max(this.props.history.length - 7, 0)
    }

    this.yMax = this.props.height - 70
    this.minHeight = 40
  }

  // RENDER METHODS //

  render() {
    const xScale = this.xScale()
    const yScale = this.yScale()

    const visibleHistory = this.getVisibleHistory()
    const visibleDates = visibleHistory.map(item => item.date)
    const dateLabel = (i) => dateFormat(visibleDates[i], 'm/d')
    const ariaLabel = visibleHistory.map(item => (
      item.value + ' pounds on ' + dateFormat(item.date, 'mmmm d')
    )).join('. ')

    const dots = (a, i) => {
      const lastDay = this.state.startIndex + i === this.props.history.length - 1
      const dotX = xScale(a.index)
      const dotY = yScale(a.value)

      let arrow = null
      let rect = null

      // Arrow and rectangular highlight for the last day's data
      if (lastDay) {
        arrow = (
          <Group
            className="current-weight"
            transform={'translate(' + dotX + ', ' + (dotY - 20) + ')'}
          >
            <line x1={0} y1={-10} x2={0} y2={-50} />
            <path
              d="
                M 0 0
                C -2.88 -7.65, -7.74 -17.19, -12.87 -23.04
                L 0 -18.45
                L 12.87 -23.04
                C 7.65 -17.19, 2.79 -7.65, 0 0
                Z"
            />
            <text dy={-85}>current</text>
            <text dy={-65}>weight</text>
          </Group>
        )

        rect = (
          <rect
            className="last-day"
            x={dotX - 25}
            y={this.props.height - 30}
            width={50}
            height={30}
          />
        )
      }

      return (
        <Group key={i} className={lastDay ? 'last-day' : null}>
          <GlyphDot cx={dotX} cy={dotY} r={4} strokeWidth={2} />
          <text x={dotX} y={dotY} dy={20} aria-hidden="true">
            {a.value}
          </text>
          {arrow}
          {rect}
        </Group>
      )
    }

    return (
      <div className="WeightChart">
        <IconHeading icon={scaleIcon} text="Weight" />
        {this.renderLeftButton()}
        {this.renderRightButton()}

        <svg
          width={this.props.width}
          height={this.props.height}
          className="overflow"
          aria-label={ariaLabel}
        >
          <LinePath
            data={visibleHistory}
            xScale={this.xScale()}
            yScale={this.yScale()}
            x={this.getX}
            y={this.getY}
            strokeWidth={2}
            glyph={dots}
          />
          <AxisBottom
            scale={this.xScale()}
            top={this.yMax + this.minHeight}
            rangePadding={this.bandWidth() / 2}
            tickFormat={dateLabel}
            tickValues={visibleHistory.map(this.getX)}
            hideTicks
          />
          {this.renderTarget()}
        </svg>
      </div>
    )
  }

  renderLeftButton() {
    // Only display button if there is more data to the left
    if (this.state.startIndex > 0) {
      return (
        <Button
          className="pt-button button-primary button-left"
          onClick={this.goLeft}
          aria-label="Previous week's weight"
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
    if (this.state.startIndex < this.props.history.length - 7) {
      return (
        <Button
          className="pt-button button-primary button-right"
          onClick={this.goRight}
          aria-label="Next week's weight"
        >
          <span className="button-icon-right" />
        </Button>
      )
    }
    else {
      return null
    }
  }

  renderTarget() {
    const yScale = this.yScale()
    const targetY = yScale(this.props.target)

    return (
      <Group
        className="target-line"
      >
        <line x1={0} y1={targetY} x2={this.props.width} y2={targetY} className="red" />
        <text dy={targetY + 15} className="red">
          target weight = {this.props.target} lbs
        </text>
      </Group>
    )
  }

  // EVENT HANDLERS //

  goLeft = () => {
    // Start index can never be less than 0
    this.setState((prevState) => {
      const newStart = this.state.startIndex - 1
      return {
        startIndex: Math.max(newStart, 0)
      }
    })
  }

  goRight = () => {
    // Start index can never be more than 7 entries ago
    this.setState((prevState) => {
      const newStart = this.state.startIndex + 1
      return {
        startIndex: Math.min(newStart, this.props.history.length - 7)
      }
    })
  }

  // HELPER FUNCTIONS

  getX(item) {
    return item.index
  }

  getY(item) {
    return item.value
  }

  xScale() {
    // Map dates to X axis (line graphs require this as continuous data)
    return scaleLinear({
      domain: extent(this.getVisibleHistory(), this.getX),
      rangeRound: [this.xMin(), this.xMax()]
    })
  }

  yScale() {
    // Add the target to the domain so it's always visible
    let domain = this.getVisibleHistory()
    domain.push({
      value: this.props.target
    })

    // Map weight to Y axis
    return scaleLinear({
      domain: extent(domain, this.getY),
      rangeRound: [this.yMax, 10]
    })
  }

  getVisibleHistory() {
    return this.props.history.slice(
      this.state.startIndex,
      this.state.startIndex + 7
    ).map((item, i) => Object.assign(item, { index: i }))
  }

  bandWidth() {
    // Calculate width of each date "band"
    // (it's continuous data but we want the axis to behave like a bar graph)
    return this.props.width / (this.getVisibleHistory().length || 1)
  }

  xMin() {
    return this.bandWidth() / 2
  }

  xMax() {
    return this.props.width - (this.bandWidth() / 2)
  }
}

WeightChart.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  history: PropTypes.arrayOf(PropTypes.object).isRequired,
  target: PropTypes.number.isRequired
}

export default WeightChart
