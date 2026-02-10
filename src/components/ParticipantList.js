import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid'
import dateFormat from 'dateformat'

import SortableTable from './SortableTable'
import config from '../config'
import { learningStatus } from '../helpers/types'

import '../styles/ParticipantList.css'

class ParticipantList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      search: ''
    }
  }

  // RENDER METHODS //

  render() {
    // Add components for each styled field
    const participants = this.applySearch(
      this.props.participants.map((participant) => {
        return Object.assign(participant, {
          nextCallDisplay: this.renderNextCall(participant.nextCall),
          studyId: this.renderStudyId(participant.username),
          moduleDisplay: this.renderModule(participant.lastChapter),
          statusDisplay: this.renderStatus(participant.lastRelease, participant.lastChapter),
          lastActivityDisplay: this.renderLastActivity(participant.lastActivity),
          messages: this.renderMessagingButton(participant.username),
        })
      })
    )

    return (
      <Grid fluid>
        <Row>
          <Col xsOffset={4} xs={4} className="text-center">
            <h1>
              Panel Management
            </h1>
          </Col>

          <Col xs={4}>
            {this.renderSearchBar()}
          </Col>
        </Row>

        {this.renderLegend()}

        <Row>
          <Col xs={12}>
            <SortableTable
              header={this.getHeader()}
              body={participants}
              initialSort={this.props.initialSort}
              onChangeSort={this.props.onChangeSort}
            />
          </Col>
        </Row>
      </Grid>
    )
  }

  renderNextCall(nextCall) {
    let formattedDate = ''
    let formattedTime = ''
    let sortableTime = ''

    if (nextCall) {
      formattedDate = dateFormat(nextCall, 'ddd, mm/dd/yy')
      formattedTime = dateFormat(nextCall, 'h:MM tt')
      sortableTime = dateFormat(nextCall, 'isoDateTime')
    }

    return (
      <div
        data-sort-value={sortableTime}
        data-search-value={formattedDate + ' ' + formattedTime}
      >
        {formattedDate}<br />
        {formattedTime}
      </div>
    )
  }

  renderStudyId(username) {
    const participantRE = new RegExp('^' + config.studyIdPrefix)
    const studyId = username.replace(participantRE, '')
    const studyUrl = '/studies/' + studyId

    return (
      <Link
        to={studyUrl}
        data-sort-value={parseInt(studyId, 10)}
        data-search-value={studyId}
      >
        {studyId}
      </Link>
    )
  }

  renderModule(lastChapter) {
    const module = Math.min(lastChapter + 1, 30)

    return (
      <span
        data-sort-value={module}
        data-search-value={module.toString()}
      >
        {module}
      </span>
    )
  }

  renderStatus(lastRelease, lastSubmit) {
    const statusClass = learningStatus(lastRelease, lastSubmit)
    const status = statusClass ? statusClass.replace(/-/, ' ') : null
    const newModules = lastRelease - lastSubmit

    return (
      <span
        data-cell-class={statusClass}
        data-sort-value={newModules}
        data-search-value={status}
      >
        {status}
      </span>
    )
  }

  renderLastActivity(lastActivity) {
    let formattedDate = ''
    let sortableTime = ''

    if (lastActivity) {
      formattedDate = dateFormat(lastActivity, 'mm/dd/yy')
      sortableTime = dateFormat(lastActivity, 'isoDateTime')
    }

    return (
      <div data-sort-value={sortableTime} data-search-value={formattedDate}>
        {formattedDate}
      </div>
    )
  }

  renderMessagingButton(username) {
    const participantRE = new RegExp('^' + config.studyIdPrefix)
    const studyId = username.replace(participantRE, '')
    const messagingUrl = '/studies/' + studyId + '/messages'

    return (
      <Link
        to={messagingUrl}
        data-sort-value={parseInt(studyId, 10)}
        data-search-value={studyId}
        role="button"
        className="pt-button button-primary"
      >
        Messaging
      </Link>
    )
  }

  renderSearchBar() {
    // Coaches can only search by study ID, researchers/admins can search more
    let searchMessage = 'Search for study ID'
    if (['researcher', 'admin'].includes(this.props.role)) {
      searchMessage = 'Search'
    }

    return (
      <div className="pt-input-group">
        <input
          className="pt-input"
          type="search"
          placeholder={searchMessage}
          onChange={this.search}
        />
        <span className="pt-icon pt-icon-search"></span>
      </div>
    )
  }

  renderLegend() {
    return (
      <Row>
        <Col xs={8} xsOffset={4}>
          <div className="legend">
            <h3>
              Legend
            </h3>

            <div className="key on-track" />
            <div>
              <strong>On Track</strong>
              <br />
              No pending chapters
            </div>

            <div className="key behind" />
            <div>
              <strong>Behind</strong>
              <br />
              Have one set of pending chapters
            </div>

            <div className="key stalled" />
            <div>
              <strong>Stalled</strong>
              <br />
              Have two or more sets of pending chapters
            </div>
          </div>
        </Col>
      </Row>
    )
  }

  // EVENT HANDLERS //

  search = (event) => {
    this.setState({
      search: event.currentTarget.value
    })
  }

  // HELPER METHODS //

  getHeader() {
    if (this.props.role === 'admin') {
      return [
        { id: 'coach',               label: 'Coach Name'            },
        { id: 'nextCallDisplay',     label: 'Next Call'             },
        { id: 'studyId',             label: 'Study ID'              },
        { id: 'coachingStatus',      label: 'Coaching Status'       },
        { id: 'coachNotes',          label: 'Coach\'s Notes'        },
        { id: 'gender',              label: 'Gender'                },
        { id: 'moduleDisplay',       label: 'Current Module\u00a0#' },
        { id: 'statusDisplay',       label: 'Learning Status'       },
        { id: 'lastActivityDisplay', label: 'Last Activity'         },
        { id: 'messages',            label: 'Messages', nonSortable: true }
      ]
    }

    else if (this.props.role === 'researcher') {
      return [
        { id: 'coach',               label: 'Coach Name'            },
        { id: 'nextCallDisplay',     label: 'Next Call'             },
        { id: 'studyId',             label: 'Study ID'              },
        { id: 'gender',              label: 'Gender'                },
        { id: 'moduleDisplay',       label: 'Current Module\u00a0#' },
        { id: 'statusDisplay',       label: 'Learning Status'       },
        { id: 'lastActivityDisplay', label: 'Last Activity'         },
        { id: 'messages',            label: 'Messages', nonSortable: true }
      ]
    }

    else {
      return [
        { id: 'nextCallDisplay',     label: 'Next Call'             },
        { id: 'studyId',             label: 'Study ID'              },
        { id: 'coachingStatus',      label: 'Coaching Status'       },
        { id: 'coachNotes',          label: 'Coach\'s Notes'        },
        { id: 'moduleDisplay',       label: 'Current Module\u00a0#' },
        { id: 'statusDisplay',       label: 'Learning Status'       },
        { id: 'lastActivityDisplay', label: 'Last Activity'         },
        { id: 'messages',            label: 'Messages', nonSortable: true }
      ]
    }
  }

  applySearch(participants) {
    if (this.state.search) {
      return participants.filter(participant => {
        // Researchers and admins can search by any of these fields
        if (['researcher', 'admin'].includes(this.props.role)) {
          const ciSearch = new RegExp(this.state.search, 'i')

          let fields = [
            participant.coach,
            participant.nextCallDisplay.props['data-search-value'],
            participant.username,
            participant.gender,
            participant.moduleDisplay.props['data-search-value'],
            participant.statusDisplay.props['data-search-value'],
            participant.lastActivityDisplay.props['data-search-value']
          ]

          if (this.props.role === 'admin') {
            fields.push(participant.coachingStatus, participant.coachNotes)
          }

          return fields.some(field => (field || '').match(ciSearch))
        }

        // Coaches can only search by study ID
        else {
          return participant.username.match(this.state.search)
        }
      })
    }

    else {
      return participants
    }
  }
}

ParticipantList.propTypes = {
  participants: PropTypes.arrayOf(PropTypes.object).isRequired,
  role: PropTypes.string.isRequired,
  initialSort: PropTypes.object.isRequired,
  onChangeSort: PropTypes.func.isRequired
}

export default ParticipantList
