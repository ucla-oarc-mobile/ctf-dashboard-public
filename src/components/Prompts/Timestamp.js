import React from 'react'
import PropTypes from 'prop-types'
import { DatePicker } from "@blueprintjs/datetime"
import dateFormat from 'dateformat'

class Timestamp extends React.Component {
  constructor(props) {
    super(props)

    // Default to no date selected, earliest time
    let dateOnly = null
    let timeOnly = this.getAvailableTimes()[0]

    if (this.props.defaultValue) {
      const dateTime = new Date(this.props.defaultValue)
      dateOnly = new Date(this.props.defaultValue)
      dateOnly.setHours(0, 0, 0, 0)
      timeOnly = dateTime - dateOnly
    }

    this.state = {
      dateOnly: dateOnly,
      timeOnly: timeOnly
    }
  }

  // RENDER METHODS //

  render() {
    // Can schedule ahead up to 1 year from today
    const now = new Date()
    let maxDate = new Date(now)
    maxDate.setFullYear(now.getFullYear() + 1)

    return (
      <div className="text-center">
        <DatePicker
          value={this.state.dateOnly}
          canClearSelection={false}
          minDate={now}
          maxDate={maxDate}
          onChange={this.onDateChange}
        />
        {this.renderTimePicker()}
        {this.renderSelection()}
      </div>
    )
  }

  renderTimePicker() {
    const timeOptions = this.getAvailableTimes().map((ms) => {
      // ms is time only (on 1970-01-01), so pretend it's UTC for display
      const formatted = dateFormat(ms, 'UTC:h:MM tt')

      return (
        <option key={ms} value={ms}>
          {formatted}
        </option>
      )
    })

    return (
      <p>
        <select
          className="time-picker"
          value={this.state.timeOnly}
          onChange={this.onTimeChange}
        >
          {timeOptions}
        </select>
      </p>
    )
  }

  renderSelection() {
    const formatted = dateFormat(this.getDateTime(), 'dddd, mmmm dS, h:MM TT')

    return (
      <em>
        {formatted}
      </em>
    )
  }

  // EVENT HANDLERS //

  onDateChange = (selectedDate, isUserChange) => {
    // Clear time from selected date to get date only
    selectedDate.setHours(0, 0, 0, 0)

    this.setState({
      dateOnly: selectedDate
    }, this.propagateChange)
  }

  onTimeChange = (event) => {
    this.setState({
      timeOnly: event.currentTarget.value
    }, this.propagateChange)
  }

  // HELPER METHODS //

  // Returns an array of possible time values, in ms since midnight
  getAvailableTimes() {
    let times = []

    for (let ms = this.props.minTime; ms <= this.props.maxTime; ms += this.props.timeIncrement) {
      times.push(ms)
    }

    return times
  }

  getDateTime() {
    if (this.state.dateOnly && this.state.timeOnly) {
      // setMilliseconds can add any amount, even hours worth
      const dateCopy = new Date(this.state.dateOnly)
      dateCopy.setMilliseconds(this.state.timeOnly)

      return dateCopy
    }

    else {
      return null
    }
  }

  propagateChange() {
    const dateTime = this.getDateTime()

    // Tell parent component the actual changed value
    // For Ohmage reasons, this is the time in ISO-8601 format
    this.props.onChange(dateTime ? dateTime.toISOString() : null)
  }
}

Timestamp.propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string,
  minTime: PropTypes.number,
  maxTime: PropTypes.number,
  timeIncrement: PropTypes.number
}

// Defaults: 9am to 5pm, in 30 min increments
Timestamp.defaultProps = {
  minTime: 6 * 60 * 60 * 1000,
  maxTime: 20 * 60 * 60 * 1000,
  timeIncrement: 30 * 60 * 1000
}

export default Timestamp
