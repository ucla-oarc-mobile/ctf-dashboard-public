import React from 'react'
import PropTypes from 'prop-types'
import { RadioGroup, Radio } from '@blueprintjs/core'

class SingleChoice extends React.Component {
  constructor(props) {
    super(props)

    const selectedValue = this.getCheckedRadio(this.props.defaultValue)

    this.state = {
      selectedValue: selectedValue,
      customValue: selectedValue === 'custom' ? this.props.defaultValue : ''
    }
  }

  // RENDER METHODS //

  render() {
    let choices = this.props.choices.map((choice) => {
      return this.renderChoice(choice)
    })

    if (this.props.allowCustom) {
      choices.push(this.renderCustom())
    }

    return (
      <RadioGroup
        selectedValue={this.getCheckedRadio(this.state.selectedValue)}
        onChange={this.onRadioChange}
      >
        {choices}
      </RadioGroup>
    )
  }

  renderChoice(choice) {
    const value = this.props.allowCustom ? choice.label : choice.value

    return (
      <Radio key={value} value={value} label={choice.label} />
    )
  }

  renderCustom() {
    return (
      [
        <Radio key="custom" value="custom" label="Other" className="custom-radio" />,
        <input type="text" className="pt-input custom-text" onChange={this.onTextChange} />
      ]
    )
  }

  // EVENT HANDLERS //

  onRadioChange = (event) => {
    const value = event.currentTarget.value

    // If the 'custom' button is checked, use the current value of the text input
    // (then propagate the change once the state has updated)
    if (value === 'custom') {
      this.setState({
        selectedValue: this.state.customValue
      }, this.propagateChange)
    }

    // Otherwise, use the value of the checked radio button
    // (then propagate the change once the state has updated)
    else {
      this.setState({
        selectedValue: value
      }, this.propagateChange)
    }
  }

  onTextChange = (event) => {
    const value = event.currentTarget.value

    // Update the text input value and auto-check the 'custom' radio button
    // (then propagate the change once the state has updated)
    this.setState({
      selectedValue: value,
      customValue: value
    }, this.propagateChange)
  }

  // HELPERS //

  // Returns the value of the radio button that should be checked
  // (will be one of the choice values, or 'custom')
  getCheckedRadio(value) {
    const predefinedChoices = this.props.choices.map((choice) => {
      return this.props.allowCustom ? choice.label : choice.value
    })

    // If the current value is one of the pre-defined choices, use that value
    if (predefinedChoices.includes(value)) {
      return value
    }

    // If the value was never set (like on initial render), don't check anything
    else if (value === null) {
      return null
    }

    // Otherwise, check the 'custom' button
    else {
      return 'custom'
    }
  }

  // Keep the parent component up-to-date with the values in state
  propagateChange() {
    this.props.onChange(this.state.selectedValue)
  }
}

SingleChoice.propTypes = {
  onChange: PropTypes.func.isRequired,
  choices: PropTypes.arrayOf(PropTypes.object).isRequired,
  allowCustom: PropTypes.bool,
  defaultValue: PropTypes.string
}

export default SingleChoice
