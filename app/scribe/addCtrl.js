const { ctrlRemovable } = require('./decorate.js')

function moveCtrl (square, line, x, y, uid, isMirror, ctrlx, ctrly) {
  requestAnimationFrame(()=>{
    drawSquare(square)

    if (square.isMirror&& isMirror){
      square.x = 2 * x - ctrlx
      square.y = 2 * y - ctrly
    } else {
      square.x = ctrlx
      square.y = ctrly
    }

    line.graphics.clear()
    drawLine(line, x, y, square.x, square.y)
    line.from = {x, y}
    line.to = {x: square.x , y: square.y}

    stage.update()
  })
}

function createCtrl ({uid, x, y, isMirror}, state, emitter){
  var square = new createjs.Shape()
  var line = new createjs.Shape()

  drawSquare(square)

  square.x = x
  square.y = y
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

module.exports = ({uid, x, y, isMirror}, state, emitter)=>{
  const {square, line} = createCtrl({uid, x, y, isMirror:false}, state, emitter)

  if (isMirror){
    var o = createCtrl({uid, x, y, isMirror:true}, state, emitter)
    var square2 = o.square
    var line2 = o.line
  }

  emitter.on('moveCtrl', ctrl=>{
    if (ctrl.uid !== uid) return

    moveCtrl(square, line, x, y, uid, false, ctrl.x, ctrl.y)

    if (isMirror&&ctrl.isMirror){
      moveCtrl(square2, line2, x, y, uid, true, ctrl.x, ctrl.y)
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
      square2.graphics.clear()
      line2.graphics.clear()
      stage.update()
    }
  })
}
