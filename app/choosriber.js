var leveljs = require('level-js')

var chooscriber = leveljs('chooscriber')

chooscriber.open(() => {})

exports.put = (data, cb) => {
  chooscriber.put('data', JSON.stringify(data), err => {})
}

exports.get = (cb) => {
  var stream = chooscriber.get('data', (err, choodata) => {
    cb(JSON.parse(choodata))
  })
}
