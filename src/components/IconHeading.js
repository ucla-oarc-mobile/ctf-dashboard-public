import React from 'react'
import PropTypes from 'prop-types'

import '../styles/IconHeading.css'

function IconHeading(props) {
  return (
    <h3 className="IconHeading">
      <img src={props.icon} alt="" />
      {props.text}
    </h3>
  )
}

IconHeading.propTypes = {
  icon: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
}

export default IconHeading
