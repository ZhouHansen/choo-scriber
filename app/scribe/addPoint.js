const { cursurable, movable, removable, ctrlable, preventable, draggable } = require('./decorate.js')
var addCtrl = require('./addCtrl.js')

module.exports = ({x, y, uid}, state, emitter) => {
  var point = new createjs.Shape()
  var color = uid === state.currentId ? '#000' : '#fff'
  point.graphics
       .setStrokeStyle(1)
       .beginStroke('#000')
       .beginFill(color)
       .drawCircle(0, 0, 3)

  point.x = x
  point.y = y
  point.uid = uid
  
  cursurable(point, state)
  movable(point, state, emitter)
  removable(point, state, emitter)
  ctrlable(point, state, emitter)
  preventable(point, state, emitter)
  draggable(point, state, emitter)

  container.addChild(point)
  stage.update()

  emitter.on('changeCurrent', () => {
    if (![state.preId, state.currentId].includes(uid) || state.preId === state.currentId) return

    var color = point.uid === state.currentId ? '#000' : '#fff'

    point.graphics
         .beginFill(color)
         .drawCircle(0, 0, 3)

    stage.update()
  })

  emitter.on('remove', uid => {
    if (point.uid !== uid) return

    container.removeChild(point)

    stage.update()
  })

  emitter.on('createCtrl', ({uid, x, y, isMirror}) => {
    if (point.uid !== uid) return

    addCtrl({uid, x, y, isMirror: isMirror}, state, emitter, point.x, point.y)
  })
}
