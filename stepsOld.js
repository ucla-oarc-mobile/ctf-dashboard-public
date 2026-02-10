const fs = require('fs')
const csv = require('csv')

const infile = fs.readFileSync('StepsOhmage.csv')

csv.parse(infile, (err, rows) => {
  if (err) {
    console.log('parse error', err)
  }

  else {
    let userSteps = {}
    let output = [rows[0]]

    rows.forEach((row, i) => {
      if (i === 0) {
        return
      }

      const user = row[0]
      if (!userSteps[user]) {
        userSteps[user] = {}
      }

      const parsed = JSON.parse(row[2])
      parsed.daily.forEach((dateRow) => {
        const date = dateRow.date_formatted
        if (!userSteps[user][date]) {
          userSteps[user][date] = 0
        }

        const steps = dateRow.count
        if (steps > userSteps[user][date]) {
          userSteps[user][date] = steps
        }
      })
    })

    Object.keys(userSteps).forEach((user) => {
      Object.keys(userSteps[user]).forEach((date) => {
        const month = date.substr(0, 2)
        const day = date.substr(3, 2)
        const year = date.substr(6, 4)

        output.push([
          user,
          year + '-' + month + '-' + day,
          userSteps[user][date],
          null,
          null
        ])
      })
    })

    csv.stringify(output, (err, data) => {
      if (err) {
        console.log('stringify error', err)
      }
      else {
        process.stdout.write(data)
      }
    })
  }
})
