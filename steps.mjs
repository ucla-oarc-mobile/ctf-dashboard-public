import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import moment from 'moment'

// Load the baseline dates lookup table
const startDatesFile = fs.readFileSync('startdates.csv')
const startDatesRows = parse(startDatesFile, { columns: true })

// Create a lookup map for baseline dates
const userBaselines = {}
startDatesRows.forEach(row => {
  const userId = row['subject_id'].toString() // Convert to string to match user ID format
  const baselineDate = row['Baseline_date']
  // Parse the date - assuming format MM/DD/YYYY based on common formats
  // Adjust this if your date format is different
  userBaselines[userId] = moment(baselineDate, 'MM/DD/YYYY')
})

const infile = fs.readFileSync('Steps.csv')
const rows = parse(infile, { columns: true })

let userSteps = {}
let header = [ 'User', 'Start date' ]
let output = []
let maxDays = 1

rows.forEach((row, i) => {
  const user = row['user:id']
  const parsed = JSON.parse(row['stepsValue'])

  if (!userSteps[user]) {
    userSteps[user] = {}
  }

  // Get the baseline date for this user
  const userBaseline = userBaselines[user]

  parsed.daily.forEach((dateRow) => {
    const steps = dateRow.count
    const month = dateRow.date_formatted.substr(0, 2)
    const day = dateRow.date_formatted.substr(3, 2)
    const year = dateRow.date_formatted.substr(6, 4)
    const isoDate = year + '-' + month + '-' + day

    // Check if this date is on or after the user's baseline date
    const currentDate = moment(isoDate, 'YYYY-MM-DD')

    // Only include data points on or after the baseline date
    if (userBaseline && currentDate.isBefore(userBaseline)) {
      // Skip this data point as it's before the baseline date
      return
    }

    if (!userSteps[user][isoDate]) {
      userSteps[user][isoDate] = 0
    }

    if (steps > userSteps[user][isoDate]) {
      userSteps[user][isoDate] = steps
    }
  })
})

Object.keys(userSteps).forEach((user) => {
  let dates = Object.keys(userSteps[user]).sort()

  // Skip users with no valid data after filtering
  if (dates.length === 0) {
    console.error(`Warning: User ${user} has no data on or after their baseline date`)
    return
  }

  // Use the baseline date as the start date if available, otherwise use first data date
  const baselineDate = userBaselines[user]
  const firstDataDate = moment(dates[0])
  const startDate = baselineDate && baselineDate.isValid() ? baselineDate : firstDataDate

  const lastMoment = moment(dates[dates.length - 1])
  let outputRow = [ user, startDate.format('MM/DD/YYYY') ]

  // Generate the output row starting from the baseline/start date
  for (let d = moment(startDate); d <= lastMoment; d.add(1, 'days')) {
    const dateKey = d.format('YYYY-MM-DD')
    // Use the step count if it exists, otherwise use 0 (or undefined if you prefer)
    outputRow.push(userSteps[user][dateKey] || 0)
  }

  output.push(outputRow)
  maxDays = Math.max(maxDays, outputRow.length - 2)
})

for (let i = 1; i <= maxDays; ++i) {
  header.push(i)
}

output.unshift(header)
const data = stringify(output)

process.stderr.write(JSON.stringify(userSteps))
process.stdout.write(data)
