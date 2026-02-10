// Guarantees the object is an array
// If it isn't, turn it into one with the object as a single element
export function ensureArray(object) {
  return Array.isArray(object) ? object : [object]
}

export function displayName(user) {
  return user.first_name + ' ' + user.last_name
}

// One day in ms
export const ONE_DAY = 24 * 60 * 60 * 1000

// Return number of days in the past a date was, rounded down
export function daysAgo(date) {
  const timeDiff = new Date() - date
  return Math.floor(timeDiff / ONE_DAY)
}

// Determine a participant's learning status
export function learningStatus(lastRelease, lastSubmit) {
  // More than 4 chapters (2 sets) have been released
  if (lastRelease - lastSubmit > 4) {
    return 'stalled'
  }

  // More than 2 chapters (1 sets) have been released
  else if (lastRelease - lastSubmit > 2) {
    return 'behind'
  }

  else if (lastRelease && lastSubmit) {
    return 'on-track'
  }

  else {
    return null
  }
}
