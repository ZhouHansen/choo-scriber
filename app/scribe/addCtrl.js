const { ctrlRemovable } = require('./decorate.js')

function moveCtrl (square, line, x, y, uid, isMirror, ctrlx, ctrly, state) {
  requestAnimationFrame(()=>{
    if (square.isMirror&& isMirror){
      square.x = 2 * x - ctrlx
      square.y = 2 * y - ctrly
    } else {
      square.x = ctrlx
      square.y = ctrly
    }

    if (state.currentId === uid) {
      line.graphics.clear()
      drawSquare(square)
      drawLine(line, x, y, square.x, square.y)
    }

    line.from = {x, y}
    line.to = {x: square.x , y: square.y}

    stage.update()
  })
}

function createCtrl ({uid, x, y, isMirror}, state, emitter, pointx, pointy){
  var square = new createjs.Shape()
  var line = new createjs.Shape()

  if (state.fetch){
    moveCtrl(square, line, pointx, pointy, uid, isMirror, x, y, state)
  } else {
    drawSquare(square)
    square.x = x
    square.y = y
  }

  square.uid = uid
  square.isMirror = isMirror
  line.uid = uid
  line.isMirror = isMirror

  ctrlRemovable(square, state, emitter)

  container.addChild(square)
  container.addChildAt(line, 0)

  return {square, line}
}

function drawSquare(square){
  square.graphics
        .setStrokeStyle(1)
        .beginStroke('#f46c51')
        .beginFill('#f46c51')
        .drawRect(-2, -2, 4, 4)
}

function drawLine(line, x, y, x2, y2){
  line.graphics
      .setStrokeStyle(1)
      .beginStroke("#f46c51")
      .moveTo(x, y)
      .lineTo(x2, y2)
}

module.exports = ({uid, x, y, isMirror}, state, emitter, pointx, pointy)=>{
  const {square, line} = createCtrl({uid, x, y, isMirror:false}, state, emitter, pointx, pointy)
  var square2, line2

  if (isMirror){
    var o = createCtrl({uid, x, y, isMirror:true}, state, emitter, pointx, pointy)
    square2 = o.square
    line2 = o.line
  }

  emitter.on('moveCtrl', ctrl=>{
    if (ctrl.uid !== uid) return

    moveCtrl(square, line, pointx, pointy, uid, false, ctrl.x, ctrl.y, state)

    if (isMirror&&ctrl.isMirror){
      if (square2 === void 0){
        var o = createCtrl({uid, x, y, isMirror:true}, state, emitter, pointx, pointy)
        square2 = o.square
        line2 = o.line
      }
      moveCtrl(square2, line2, pointx, pointy, uid, true, ctrl.x, ctrl.y, state)
    }
  })

  emitter.on('changeCurrent', ()=>{
    const {currentId, preId} = state

    if (![currentId, preId].includes(uid)|| currentId === preId) return

    if (currentId !== uid) {
      square.graphics.clear()
      line.graphics.clear()

      if (isMirror){
        square2.graphics.clear()
        line2.graphics.clear()
      }
    } else {
      drawSquare(square)
      drawLine(line, line.from.x, line.from.y, line.to.x, line.to.y)

      if (isMirror){
        drawSquare(square2)
        drawLine(line2, line2.from.x, line2.from.y, line2.to.x, line2.to.y)
      }
    }

    stage.update()
  })

  emitter.on('removeOnlyCtrl', ruid=>{
    if (ruid === uid){
      container.removeChild(square, line)

      if (isMirror){
        container.removeChild(square2, line2)
      }
      stage.update()
    }
  })

  emitter.on('removeMirrorCtrl', ruid=>{
    if (ruid === uid){
      isMirror = false
      square2.graphics.clear()
      line2.graphics.clear()
      stage.update()
    }
  })

  emitter.on('removeUnMirrorCtrl', ruid=>{
    if (ruid === uid){
      isMirror = true
    }
  })
}
