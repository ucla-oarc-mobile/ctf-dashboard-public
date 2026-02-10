import React from 'react'
import PropTypes from 'prop-types'

class Text extends React.Component {
  // RENDER METHODS //

  render() {
    return (
      <textarea
        className="pt-input"
        maxLength={this.props.max}
        onBlur={this.onChange}
        placeholder={this.props.placeholder}
        defaultValue={this.props.defaultValue}
      />
    )
  }

  // EVENT HANDLERS //

  onChange = (event) => {
    this.props.onChange(event.currentTarget.value)
  }
}

Text.propTypes = {
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string
}

export default Text
