import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Button, Popover, Position, Menu } from '@blueprintjs/core'

import '../styles/Header.css'
import logo from '../images/logoWhite.svg'
import downArrow from '../images/downArrowWhite.svg'

class Header extends React.Component {
  constructor() {
    super()

    this.state = {
      isMenuOpen: false
    }
  }

  // RENDER METHODS //

  render() {
    if (!this.props.session.showHeader()) {
      return null
    }

    return (
      <header>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>

        <nav className="pt-navbar">
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading">
              <Link to="/">
                <img src={logo} alt="Coach to Fit" className="logo" />
              </Link>
            </div>
          </div>

          <div className="pt-navbar-group pt-align-right">
            {this.renderMenu()}
          </div>
        </nav>
      </header>
    )
  }

  renderMenu() {
    if (!this.props.session.isLoggedIn()) {
      return (
        <Link to="/login" role="button" className="pt-button button-inverse">
          Login
        </Link>
      )
    }

    // Use li elements with manual classes,
    // since Blueprint doesn't play well with react-router yet :(
    const userMenu = this.userMenuItems().map((item) => {
      return (
        <li key={item.href}>
          <Link
            to={item.href}
            className="pt-menu-item pt-popover-dismiss"
            onBlur={this.blurMenuItem}
          >
            {item.text}
          </Link>
        </li>
      )
    })

    return (
      <Popover
        position={Position.BOTTOM_RIGHT}
        enforceFocus={false}
        inline
        isOpen={this.state.isMenuOpen}
        onClose={this.closeMenu}
      >
        <Button
          className="pt-minimal"
          text={this.props.session.displayName()}
          onClick={this.openMenu}
        >
          <img src={downArrow} alt="" className="downArrow" />
        </Button>
        <Menu>
          {userMenu}
        </Menu>
      </Popover>
    )
  }

  // EVENT HANDLERS //

  openMenu = () => {
    this.setState({
      isMenuOpen: true
    })
  }

  closeMenu = () => {
    this.setState({
      isMenuOpen: false
    })
  }

  blurMenuItem = (event) => {
    const newFocus = event.relatedTarget

    // Don't mess with focus if the next target is another menu item
    if (newFocus && newFocus.className === 'pt-menu-item pt-popover-dismiss') {
      return
    }

    // The next target is outside the menu, so close it
    this.closeMenu()
  }

  // HELPERS //

  userMenuItems() {
    let items = []

    // Only admins can manage users
    if (this.props.session.attributes.role === 'admin') {
      items.push({ href: '/users', text: 'Manage Users' })
    }

    // Both researchers and admins can assign coaches
    if (['researcher', 'admin'].includes(this.props.session.attributes.role)) {
      items.push({ href: '/coaches', text: 'Assign Coaches' })
    }

    // All logged-in users can do these actions
    items.push({ href: '/change-password', text: 'Change Password' })
    items.push({ href: '/logout', text: 'Log Out' })

    return items
  }
}

Header.propTypes = {
  session: PropTypes.object.isRequired
}

export default Header
