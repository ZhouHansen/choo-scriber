var addPoint = require('./scribe/addPoint.js')
var addLine = require('./scribe/addLine.js')
var moveContainer = require('./scribe/moveContainer.js')

module.exports = function (state, emitter) {
  const INIT_DATA = {
    drawType: 'line',
    points: [],
    ctrls: [],
    currentId: '',
    preId: '',
    countId: 0,
    container: {
      x: 0,
      y: 0
    },
    isPreventEvent: false,
    isPreventDrag: false,
    isMouseDown: false,
    fetch: false,
    save: false
  }

  Object.assign(state, INIT_DATA)

  emitter.on('changeDraw', drawType => {
    state.drawType = drawType
  })

  emitter.on('addPoint', nOne => {
    if (!state.fetch) {
      state.preId = state.currentId
      state.currentId = nOne.uid
      emitter.emit('changeCurrent')
      state.points.push(nOne)
    }
    var ni = state.points.indexOf(nOne)

    var oOne = state.points[ni - 1]
    addPoint(nOne, state, emitter)

    if (ni !== 0) {
      addLine(oOne, nOne, state, emitter)
    }
  })

  emitter.on('removePoint', uid => {
    var one = state.points.find(p => p.uid === uid)
    var i = state.points.indexOf(one)
    var oOne = state.points[i - 1]
    var nOne = state.points[i + 1]

    addLine(oOne, nOne, state, emitter)

    state.points = state.points.filter(p => {
      return p.uid !== uid
    })

    state.ctrls = state.ctrls.filter(ctrl => {
      return ctrl.uid !== uid
    })

    emitter.emit('remove', uid)
    emitter.emit('removeOnlyCtrl', uid)

    if (state.points.length > 0) {
      var currentId = state.points[state.points.length - 1].uid
      state.preId = state.currentId
      state.currentId = currentId
      emitter.emit('changeCurrent')
    }
  })

  emitter.on('moveContainer', o => {
    state.container = o
    moveContainer(o)
  })

  emitter.on('preventEvent', bool => {
    state.isPreventEvent = bool
  })

  emitter.on('preventDrag', bool => {
    state.isPreventDrag = bool
  })

  emitter.on('mouseDown', bool => {
    state.isMouseDown = bool
  })

  emitter.on('changeCurrentId', uid => {
    state.preId = state.currentId
    state.currentId = uid
    emitter.emit('changeCurrent', uid)
  })

  emitter.on('operateCtrl', ({uid, x, y, isMirror}) => {
    var ctrl = state.ctrls.find(ctrl => ctrl.uid === uid)
    var isNew = false

    if (ctrl === void 0) {
      isNew = true
      ctrl = {uid, x, y, isMirror}
      state.ctrls.push(ctrl)
    } else {
      var arr = state.ctrls.slice(0)
      var i = state.ctrls.indexOf(ctrl)
      if (ctrl.isMirror !== isMirror) {
        if (isMirror === false) {
          emitter.emit('removeMirrorCtrl', uid)
        } else if (isMirror === true) {
          emitter.emit('removeUnMirrorCtrl', uid)
        }
      }
      ctrl = {uid, x, y, isMirror}
      arr[i] = ctrl
      state.ctrls = arr
    }

    if (isNew) {
      emitter.emit('createCtrl', ctrl)
    } else {
      emitter.emit('moveCtrl', ctrl)
    }
  })

  emitter.on('removeCtrl', uid => {
    state.ctrls = state.ctrls.filter(ctrl => {
      return ctrl.uid !== uid
    })
    emitter.emit('removeOnlyCtrl', uid)
  })

  emitter.on('increaseCountId', () => {
    state.countId++
  })

  emitter.on('pulling', () => {
    state.fetch = true
    emitter.emit('render')
  })

  emitter.on('pushing', () => {
    state.save = true
    emitter.emit('render')
  })

  emitter.on('pulled', () => {
    container.removeAllChildren()

    stage.update()

    var scribeEvents = [
      'removeOnlyCtrl',
      'moveCtrl',
      'createCtrl',
      'removeMirrorCtrl',
      'removeUnMirrorCtrl',
      'changeCurrent',
      'remove'
    ]
    scribeEvents.forEach(eventName => {
      emitter.removeAllListeners(eventName)
    })

    Object.assign(state, JSON.parse(localStorage.getItem('chooData')))

    state.fetch = true

    moveContainer(state.container)

    state.points.forEach((p, i) => {
      emitter.emit('addPoint', p)

      var ctrl = state.ctrls.find(ctrl => ctrl.uid === p.uid)

      if (ctrl) {
        emitter.emit('createCtrl', ctrl)
      }
    })

    $('#' + state.drawType).focus()
    state.fetch = false
    emitter.emit('render')
  })

  emitter.on('pushed', () => {
    state.save = false
    emitter.emit('render')
  })
}
