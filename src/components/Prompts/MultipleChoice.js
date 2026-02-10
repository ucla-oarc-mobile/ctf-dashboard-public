import React from 'react'
import PropTypes from 'prop-types'
import { Checkbox } from '@blueprintjs/core'

class MultipleChoice extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      values: []
    }
  }

  // RENDER METHODS //

  render() {
    const choices = this.props.choices.map((choice) => {
      return this.renderChoice(choice.label, choice.value)
    })

    return (
      <div>
        {choices}
      </div>
    )
  }

  renderChoice(label, value) {
    return (
      <Checkbox
        key={value}
        label={label}
        value={value}
        checked={this.isChoiceChecked(value)}
        onChange={this.onChange}
      />
    )
  }

  // EVENT HANDLERS //

  onChange = (event) => {
    const value = event.currentTarget.value

    // If the checkbox's value was already in the list of values, remove it
    // (then propagate the change once the state has updated)
    if (this.isChoiceChecked(value)) {
      this.setState((prevState) => ({
        values: prevState.values.filter(a => a !== value)
      }), this.propagateChange)
    }

    // Otherwise, add it (and propagate the change)
    else {
      this.setState((prevState) => ({
        values: prevState.values.concat(value)
      }), this.propagateChange)
    }
  }

  // HELPERS //

  isChoiceChecked(value) {
    return this.state.values.includes(value)
  }

  // Keep the parent component up-to-date with the values in state
  propagateChange() {
    this.props.onChange(this.state.values)
  }
}

MultipleChoice.propTypes = {
  onChange: PropTypes.func.isRequired,
  choices: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default MultipleChoice
