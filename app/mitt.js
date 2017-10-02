var mitt = require("mitt")

var all = {}
var events = mitt(all)

events.reset = () => {
  for (let i in all) delete all[i]
}

let off = events.off

events.off = (type, handler) =>{
  if (!handler) delete all[type]
  else return off(type, handler)
}

module.exports = events
