import React from 'react'
import { Link } from 'react-router-dom'

import '../styles/Footer.css'

function Footer(props) {
  return (
    <footer className={props.session.showHeader() ? 'logged-in' : null}>
      <small>
        &copy; 2021 U.S. Department of Veterans Affairs. All Rights Reserved.
        | <Link to="/privacy">
          Privacy Policy
        </Link>
      </small>
    </footer>
  )
}

export default Footer
