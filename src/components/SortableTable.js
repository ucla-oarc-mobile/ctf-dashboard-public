import React from 'react'
import PropTypes from 'prop-types'
import { Icon } from '@blueprintjs/core'

import '../styles/SortableTable.css'

class SortableTable extends React.Component {
  constructor(props) {
    super(props)

    const initialSort = props.initialSort || {}

    this.state = {
      sortColumn: initialSort.sortColumn || props.header[0].id,
      sortDescending: initialSort.sortDescending || false
    }
  }

  // RENDER METHODS //

  render() {
    const header = this.props.header.map((column) => {
      let className = null
      let iconName = 'chevron-up'
      let ariaSort = null

      if (this.state.sortColumn === column.id) {
        className = 'active'
        ariaSort = 'ascending'

        if (this.state.sortDescending) {
          iconName = 'chevron-down'
          ariaSort = 'descending'
        }
      }

      if (column.nonSortable) {
        return (
          <th key={column.id} className="non-sortable">
            {column.label}
          </th>
        )
      }

      return (
        <th
          key={column.id}
          className={className}
          onClick={(event) => this.sortBy(column.id, event)}
          onKeyUp={(event) => this.sortBy(column.id, event)}
          tabIndex={0}
          aria-sort={ariaSort}
        >
          {column.label}
          <Icon iconName={iconName} />
        </th>
      )
    })

    this.props.body.sort((a, b) => {
      let sortA = a[this.state.sortColumn]
      let sortB = b[this.state.sortColumn]

      // Allow cells which are React components to provide a sort value
      if (sortA && sortA.props && typeof sortA.props['data-sort-value'] !== 'undefined') {
        sortA = sortA.props['data-sort-value']
      }
      if (sortB && sortB.props && typeof sortB.props['data-sort-value'] !== 'undefined') {
        sortB = sortB.props['data-sort-value']
      }

      // If the column provided a sort function, call that
      const sortColumn = this.props.header.find(a => a.id === this.state.sortColumn)
      if (typeof sortColumn.sort === 'function') {
        const sortValue = sortColumn.sort(sortA, sortB)

        return this.state.sortDescending ? -sortValue : sortValue
      }

      // Otherwise, do a normal sort
      else if (sortA > sortB) {
        return this.state.sortDescending ? -1 : 1
      }
      else if (sortA < sortB) {
        return this.state.sortDescending ? 1 : -1
      }
      else {
        return 0
      }
    })

    let paginated = this.props.body
    if (this.props.pageSize && this.props.page !== undefined) {
      const start = this.props.page * this.props.pageSize
      paginated = this.props.body.slice(start, start + this.props.pageSize)
    }

    const body = paginated.map((row, i) => {
      const tr = this.props.header.map((column) => {
        // Allow cell element to pass in a class for the containing cell
        const cellData = row[column.id]
        const cellClass = (cellData && cellData.props) ? cellData.props['data-cell-class'] : null

        return (
          <td key={column.id} className={cellClass}>
            {cellData}
          </td>
        )
      })

      return (
        <tr key={i} className={row.className}>
          {tr}
        </tr>
      )
    })

    return (
      <table className="pt-table pt-bordered">
        <thead>
          <tr>
            {header}
          </tr>
        </thead>
        <tbody>
          {body}
        </tbody>
      </table>
    )
  }

  // HELPER METHODS //

  sortBy(column, event) {
    // If handling a keyboard event, only activate on space/enter
    if (event.type === 'keyup') {
      if (event.key !== ' ' && event.key !== 'Enter') {
        return
      }
    }

    // If the clicked column is already being sorted on, reverse the order
    if (this.state.sortColumn === column) {
      this.setState(prevState => ({
        sortDescending: !prevState.sortDescending
      }), this.onChangeSort)
    }

    // Otherwise, make the new column the sorted one (ascending)
    else {
      this.setState({
        sortColumn: column,
        sortDescending: false
      }, this.onChangeSort)
    }
  }

  onChangeSort() {
    // Propagate sorting changes up so they can be saved in Redux
    if (this.props.onChangeSort) {
      this.props.onChangeSort(this.state)
    }
  }
}

SortableTable.propTypes = {
  header: PropTypes.array.isRequired,
  body: PropTypes.array.isRequired,
  initialSort: PropTypes.object,
  onChangeSort: PropTypes.func,
  pageSize: PropTypes.number,
  page: PropTypes.number
}

export default SortableTable
