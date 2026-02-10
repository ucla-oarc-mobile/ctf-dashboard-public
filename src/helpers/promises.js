// Insert a delay into a chain of promises
// Usage:
//   doStuff()
//     .then(doMoreStuff())
//     .then(delayPromise(1000))
//     .then(doEvenMoreStuff())

export function delayPromise(duration) {
  return function(...args) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve(...args)
      }, duration)
    })
  }
}
