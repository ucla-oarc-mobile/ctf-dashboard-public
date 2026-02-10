import React from 'react'
import PropTypes from 'prop-types'
import { NumericInput } from '@blueprintjs/core'

function Number(props) {
  const stepSize = props.wholeNumber ? 1 : undefined

  return (
    <NumericInput
      min={props.min}
      max={props.max}
      stepSize={stepSize}
      onValueChange={props.onChange}
      value={props.min}
    />
  )
}

Number.propTypes = {
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  wholeNumber: PropTypes.bool
}

export default Number
