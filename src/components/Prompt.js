import React from 'react'
import PropTypes from 'prop-types'

import SingleChoice from './Prompts/SingleChoice'
import MultipleChoice from './Prompts/MultipleChoice'
import Number from './Prompts/Number'
import Text from './Prompts/Text'
import Timestamp from './Prompts/Timestamp'

import '../styles/Prompt.css'

class Prompt extends React.Component {
  // RENDER METHODS //

  render() {
    const className = this.props.hidden ? 'Prompt hidden' : 'Prompt'

    return (
      <li className={className}>
        {this.renderPromptText()}
        {this.renderInput()}
      </li>
    )
  }

  renderInput() {
    let properties

    switch(this.props.promptType) {
      case 'single_choice':
        return (
          <SingleChoice
            choices={this.getPropertiesAsChoices()}
            defaultValue={this.props.defaultValue}
            onChange={this.onChange}
          />
        )

      case 'single_choice_custom':
        return (
          <SingleChoice
            choices={this.getPropertiesAsChoices()}
            defaultValue={this.props.defaultValue}
            onChange={this.onChange}
            allowCustom
          />
        )

      case 'multi_choice':
        return (
          <MultipleChoice
            choices={this.getPropertiesAsChoices()}
            defaultValue={this.props.defaultValue}
            onChange={this.onChange}
          />
        )

      case 'number':
        properties = this.getPropertiesAsObject()
        return (
          <Number
            min={parseInt(properties.min, 10)}
            max={parseInt(properties.max, 10)}
            wholeNumber={properties.wholeNumber === 'true'}
            defaultValue={this.props.defaultValue}
            onChange={this.onChange}
          />
        )

      case 'text':
        properties = this.getPropertiesAsObject()
        return (
          <Text
            max={parseInt(properties.max, 10)}
            placeholder={this.props.placeholder.trim()}
            defaultValue={this.props.defaultValue}
            onChange={this.onChange}
          />
        )

      case 'timestamp':
        return (
          <Timestamp
            defaultValue={this.props.defaultValue}
            onChange={this.onChange}
          />
        )

      // Undefined prompt types as well as messages
      default:
        return null
    }
  }

  renderPromptText() {
    const noteRE = /^\s*`/
    const text = this.props.promptText || this.props.messageText
    const lines = text.split('\n')

    let children = []
    lines.forEach((line, i) => {
      // Allow {{variableName}} style interpolation
      line = line.replace(/{{([^}]+)}}/g, (match, varName) => {
        return this.props.variables[varName]
      })

      // Show backticked lines as coach notes
      if (noteRE.test(line)) {
        children.push(
          <span key={'line-' + i} className="note">
            {line.replace(noteRE, '')}
          </span>
        )
      }

      else {
        children.push(
          <span key={'line-' + i}>
            {line}
          </span>
        )
      }

      children.push(
        <br key={'br-' + i} />
      )
    })

    return (
      <p className="prompt-text">
        {children}
      </p>
    )
  }

  // EVENT HANDLERS //

  onChange = (value) => {
    // Pass the ID and new value up to the parent component
    this.props.onChange(this.props.id, value)
  }

  // HELPERS //

  // Parses complex Ohmage properties as an array of choices
  getPropertiesAsChoices() {
    return this.props.properties.property.map((property) => {
      return {
        label: property.label.toString(),
        value: property.key.toString()
      }
    })
  }

  // Parses complex Ohmage properties as an object with key/value pairs
  getPropertiesAsObject() {
    let object = {}

    this.props.properties.property.forEach((property) => {
      object[property.key] = property.label
    })

    return object
  }
}

Prompt.propTypes = {
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  promptType: PropTypes.oneOf([
    'single_choice',
    'single_choice_custom',
    'multi_choice',
    'number',
    'text',
    'timestamp'
  ]),
  promptText: PropTypes.string,
  messageText: PropTypes.string,
  condition: PropTypes.string,
  skippable: PropTypes.bool,
  properties: PropTypes.object,
  hidden: PropTypes.bool,
  defaultValue: PropTypes.string,
  variables: PropTypes.object
}

export default Prompt
