import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Dialog, Button } from '@blueprintjs/core'

import Header from './components/Header'
import Content from './components/Content'
import Footer from './components/Footer'
import {
  refreshSession,
  sessionCreate,
  setAuthToken,
  stopKeepalive
} from './actions/session'
import { closeDialog } from './actions/dialog'

import './App.css'

class App extends React.Component {
  componentDidMount() {
    this.props.refreshSession()
  }

  render() {
    let cancelButton
    let onClickOk = this.props.dialog.onClose || this.props.closeDialog

    // Wait for session object to be created first
    if (!this.props.session) {
      return null
    }

    if (this.props.dialog.onConfirm) {
      // If a confirmation function exists, allow cancelling
      cancelButton = (
        <Button
          text={this.props.dialog.closeText || 'Cancel'}
          className="button-inverse"
          onClick={this.props.closeDialog}
        />
      )

      // Also make OK button run the confirmation function then close this
      onClickOk = () => {
        this.props.dialog.onConfirm()
        this.props.closeDialog()
      }
    }

    return (
      <BrowserRouter>
        <div className="App">
          <Header session={this.props.session} />
          <Content session={this.props.session} />
          <Footer session={this.props.session} />

          <Dialog
            isOpen={this.props.dialog.isOpen}
            onClose={this.props.dialog.onClose || this.props.closeDialog}
            canEscapeKeyClose={!!this.props.dialog.onConfirm}
            canOutsideClickClose={!!this.props.dialog.onConfirm}
          >
            <div className="pt-dialog-body">
              {this.props.dialog.content}
            </div>

            <div className="pt-dialog-footer">
              <div className="pt-dialog-footer-actions">
                {cancelButton}
                <Button
                  text={this.props.dialog.confirmText || 'OK'}
                  className="button-primary"
                  onClick={onClickOk}
                />
              </div>
            </div>
          </Dialog>
        </div>
      </BrowserRouter>
    )
  }
}

App.propTypes = {
  authToken: PropTypes.string,
  dialog: PropTypes.object,
  session: PropTypes.object,
  refreshSession: PropTypes.func.isRequired,
  clearSession: PropTypes.func.isRequired,
  clearToken: PropTypes.func.isRequired,
  stopKeepalive: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    authToken: state.authToken,
    dialog: state.dialog,
    session: state.session
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    refreshSession: () => dispatch(refreshSession()),
    clearSession: () => dispatch(sessionCreate({})),
    clearToken: () => dispatch(setAuthToken(null)),
    stopKeepalive: () => dispatch(stopKeepalive()),
    closeDialog: () => dispatch(closeDialog())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
