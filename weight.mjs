import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import moment from 'moment'

const infile = fs.readFileSync('Weight Sync.csv')
const rows = parse(infile, { columns: true })

let userWeights = {}
let header = [ 'User' ]
let output = []
let maxDays = 1

rows.forEach((row, i) => {
  const user = row['user:id']
  const parsed = JSON.parse(row['weightValue'])

  if (!userWeights[user]) {
    userWeights[user] = {}
  }

  parsed.daily.forEach((entry) => {
    userWeights[user][entry.startDate] = entry.value
  })
})

Object.keys(userWeights).forEach((user) => {
  let dates = Object.keys(userWeights[user]).sort()
  let outputRow = [ user ]

  dates.forEach((date) => {
    const dateMoment = moment(date)
    outputRow.push(dateMoment.format('MM/DD/YYYY'))
    outputRow.push(Math.round(userWeights[user][date] * 2.20462))
  })

  output.push(outputRow)
  maxDays = Math.max(maxDays, outputRow.length - 1)
})

for (let i = 1; i <= maxDays; ++i) {
  header.push('Date', 'Weight')
}

output.unshift(header)
const data = stringify(output)

process.stderr.write(JSON.stringify(userWeights))
process.stdout.write(data)
