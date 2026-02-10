import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect, Link } from 'react-router-dom'
import { TextArea, Button } from '@blueprintjs/core'
import CsvDownloader from 'react-csv-downloader'
import ReactPaginate from 'react-paginate'
import dateFormat from 'dateformat'

import { messagesFetchData, messagesSend } from '../actions/messages'
import SortableTable from '../components/SortableTable'

import '../styles/Messages.css'

class Messages extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      studyId: props.match.params.studyId,
      page: 0,
      selectMessage: '',
      customMessage: ''
    }
  }

  componentDidMount() {
    this.props.fetchMessages(this.state.studyId)
  }

  render() {
    if (!this.props.session.isLoggedIn()) {
      return (
        <Redirect to="/login" />
      )
    }

    const columns = [
      { id: 'date',    displayName: 'Date'    },
      { id: 'message', displayName: 'Message' },
      { id: 'viewed',  displayName: 'Viewed'  }
    ]

    const messages = this.props.messages.map(message => ({
      date: this.exportSent(message.sent),
      message: message.body,
      viewed: message.viewed ? 'Yes' : 'No'
    }))

    const header = columns.map(column => ({
      ...column,
      label: column.displayName
    }))

    const pageSize = 10
    const pageCount = Math.ceil(this.props.messages.length / pageSize)

    const tableMessages = this.props.messages.map(message => ({
      date: this.renderSent(message.sent),
      message: message.body,
      viewed: message.viewed ? 'Yes' : 'No'
    }))

    const messageOptions = [
      '',
      'Time to call your coach.',
      'WOW Great job! Keep it up.',
      'Your Service team is doing great!',
      'Remember to charge your device.',
      'Remember to check your weight.',
      'Remember to sync your steps.',
      'I noticed some chapters are pending. How can I help?',
      'Hey there! Get some steps today.',
      'Other'
    ]

    const options = messageOptions.map(option => (
      <option key={option} value={option}>
        {option}
      </option>
    ))

    return (
      <div className="Messages">
        <h1>
          Send Message to {this.state.studyId}
        </h1>

        <CsvDownloader
          filename={'Messages Sent to ' + this.state.studyId}
          extension=".csv"
          columns={columns}
          datas={messages}
          text="Export"
          className="pt-button button-primary export"
        />

        <div className="message-list">
          <h2>
            Messages Sent
          </h2>

          <SortableTable
            header={header}
            body={tableMessages}
            initialSort={{ sortColumn: 'date', sortDescending: true }}
            pageSize={pageSize}
            page={this.state.page}
          />

          <ReactPaginate
            pageCount={pageCount}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            previousLabel={null}
            nextLabel={null}
            containerClassName="pagination"
            onPageChange={this.changePage}
          />
        </div>

        <div className="message-form">
          <div className="pt-form-group">
            <label className="pt-label" htmlFor="selectMessage">
              Select Message
            </label>
            <div className="styled-select">
              <select
                id="selectMessage"
                value={this.state.selectMessage}
                onChange={this.changeSelectMessage}
              >
                {options}
              </select>
            </div>
          </div>

          {this.renderCustomMessage()}

          <div className="message-buttons">
            <Link
              role="button"
              className="pt-button button-gray"
              to="/"
            >
              Cancel
            </Link>

            <Button
              className="button-primary"
              type="submit"
              disabled={!this.isFormValid()}
              onClick={this.sendMessage}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    )
  }

  renderSent(sent) {
    let formattedDate = ''
    let formattedTime = ''
    let sortableTime = ''

    if (sent) {
      formattedDate = dateFormat(sent, 'ddd, mm/dd/yy')
      formattedTime = dateFormat(sent, 'h:MM tt')
      sortableTime = dateFormat(sent, 'isoDateTime')
    }

    return (
      <div data-sort-value={sortableTime}>
        {formattedDate}<br />
        {formattedTime}
      </div>
    )
  }

  exportSent(sent) {
    return dateFormat(sent, 'yyyy-mm-dd HH:MM:ss')
  }

  renderCustomMessage() {
    if (this.state.selectMessage !== 'Other') {
      return null
    }

    return (
      <div className="pt-form-group">
        <label className="pt-label" htmlFor="customMessage">
          Enter Other Message
        </label>
        <div className="pt-form-content">
          <TextArea
            id="customMessage"
            className="pt-fill"
            maxLength={200}
            value={this.state.customMessage}
            onChange={this.changeCustomMessage}
          />
        </div>
      </div>
    )
  }

  changePage = (data) => {
    this.setState({
      page: data.selected
    })
  }

  changeSelectMessage = (event) => {
    this.setState({
      selectMessage: event.currentTarget.value
    })
  }

  changeCustomMessage = (event) => {
    this.setState({
      customMessage: event.currentTarget.value
    })
  }

  sendMessage = () => {
    let message = this.state.selectMessage
    if (message === 'Other') {
      message = this.state.customMessage
    }

    this.props.sendMessage(this.state.studyId, message)

    this.setState({
      selectMessage: '',
      customMessage: ''
    })
  }

  isFormValid() {
    if (!this.state.selectMessage) {
      return false
    }
    else if (this.state.selectMessage === 'Other') {
      return this.state.customMessage.length > 0
    }
    else {
      return true
    }
  }
}

Messages.propTypes = {
  session: PropTypes.object.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchMessages: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    session: state.session,
    messages: state.messages
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchMessages: (studyId) => dispatch(messagesFetchData(studyId)),
    sendMessage: (studyId, body) => dispatch(messagesSend(studyId, body))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Messages)
