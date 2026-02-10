import React from 'react'
import PropTypes from 'prop-types'
import { Button, Dialog } from '@blueprintjs/core'
import CircularProgressbar from 'react-circular-progressbar'

import IconHeading from './IconHeading'

import '../styles/StepStatus.css'
import stepIcon from '../images/steps.svg'
import leaderboardIcon from '../images/leaderboard.svg'
import membersIcon from '../images/members.svg'

class StepStatus extends React.Component {
  constructor() {
    super()

    this.state = {
      isDialogOpen: false,
      tab: 'stepsThisWeek'
    }
  }

  render() {
    const weeklyGoal = this.props.dailyGoal * 7
    const percentage = this.props.weeklySum * 100 / weeklyGoal

    return (
      <div className="StepStatus">
        {this.renderLeaderboard()}

        <IconHeading icon={stepIcon} text="Step Count Total This Past 7 Days" />
        <Button
          className="button-primary"
          onClick={this.openLeaderboard}
        >
          <span className="button-icon-leaderboard" />
          View Leaderboard
        </Button>

        <div className="progress-container">
          <CircularProgressbar percentage={percentage} />

          <div className="step-text">
            {this.props.weeklySum.toLocaleString()}<br />
            steps
          </div>
        </div>
      </div>
    )
  }

  renderLeaderboard() {
    const branchData = this.props.leaderboard.slice().sort((a, b) => {
      if (a[this.state.tab] > b[this.state.tab]) {
        return -1
      }
      else {
        return 1
      }
    })

    let maxSteps = 1
    if (branchData.length > 0) {
      maxSteps = Math.max(branchData[0][this.state.tab], 1)
    }

    const branches = branchData.map((branch, i) => {
      const width = (branch[this.state.tab] / maxSteps) * 85
      let iconBase64 = branch.iconInverse
      let barClass = 'branch-bar'

      if (branch[this.state.tab] / maxSteps < 0.2) {
        iconBase64 = branch.icon
        barClass += ' icon-outside'
      }

      if (branch.id === this.props.serviceBranch) {
        iconBase64 = branch.icon
        barClass += ' user-branch'
      }

      return (
        <div className="branch" key={i}>
          <div className="branch-name">
            {branch.name}
            <img src={membersIcon} alt="members" />
            <span>{branch.members}</span>
          </div>

          <div>
            <div className={barClass} style={{ width: width + '%' }}>
              <img
                src={'data:image/png;base64,' + iconBase64}
                alt={branch.name}
              />
            </div>
            <div className="branch-steps">
              #{i + 1}<br />
              {branch[this.state.tab].toLocaleString()}
            </div>
          </div>
        </div>
      )
    })

    return (
      <Dialog
        isOpen={this.state.isDialogOpen}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        onClose={this.closeDialog}
        className="leaderboard"
      >
        <div className="pt-dialog-body">
          <button className="dialog-close" onClick={this.closeDialog} />

          <div className="leaderboard-title">
            <img src={leaderboardIcon} alt="" />
            Leaderboard
          </div>

          <div className="leaderboard-tabs">
            <button
              className={this.state.tab === 'stepsLastWeek' ? 'active' : null}
              onClick={() => this.changeTab('stepsLastWeek')}
            >
              LAST WEEK
            </button>
            <button
              className={this.state.tab === 'stepsThisWeek' ? 'active' : null}
              onClick={() => this.changeTab('stepsThisWeek')}
            >
              THIS WEEK
            </button>
          </div>

          <div className="leaderboard-body">
            <p>
              Service Branch Average Steps
            </p>
            {branches}
          </div>
        </div>
      </Dialog>
    )
  }

  openLeaderboard = () => {
    this.props.fetchLeaderboard()
    this.setState({ isDialogOpen: true })
  }

  changeTab(tab) {
    this.setState({ tab })
  }

  closeDialog = () => {
    this.setState({ isDialogOpen: false })
  }
}

StepStatus.propTypes = {
  weeklySum: PropTypes.number.isRequired,
  dailyGoal: PropTypes.number.isRequired,
  serviceBranch: PropTypes.string,
  leaderboard: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchLeaderboard: PropTypes.func.isRequired
}

export default StepStatus
