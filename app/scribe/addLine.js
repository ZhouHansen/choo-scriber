function drawCurve(g, ctrls, oOne, nOne){
  var oCtrl = ctrls.find(ctrl => ctrl.uid === oOne.uid)
    , nCtrl = ctrls.find(ctrl => ctrl.uid === nOne.uid)
    , {x, y} = oOne

  g.setStrokeStyle(1)
   .beginStroke("#000")
   .moveTo(nOne.x, nOne.y)

   if (oCtrl !== void 0 && nCtrl === void 0){
     g.quadraticCurveTo(oCtrl.x, oCtrl.y, x, y)
   } else if (oCtrl === void 0 && nCtrl !== void 0){
     if (nCtrl.isMirror){
       g.quadraticCurveTo(nCtrl.x, nCtrl.y, x, y)
     } else {
       g.lineTo(x, y)
     }
   } else if (oCtrl !== void 0 && nCtrl !== void 0){
     if (nCtrl.isMirror){
       g.bezierCurveTo(nCtrl.x, nCtrl.y, oCtrl.x, oCtrl.y, x, y)
     } else {
       g.quadraticCurveTo(oCtrl.x, oCtrl.y, x, y)
     }
   } else {
     g.lineTo(x, y)
   }
}

module.exports = (oOne, nOne, state, emitter)=>{
  if (oOne === void 0||nOne === void 0) return

  const {ctrls} = state
  var line = new createjs.Shape()
  line.uids = [oOne.uid, nOne.uid]

  drawCurve(line.graphics, ctrls, oOne, nOne)

  emitter.on('remove', uid=>{
    if (!line.uids.includes(uid)) return

    container.removeChild(line)

    stage.update()
  })

  emitter.on('moveCtrl', ctrl=>{
    if (!line.uids.includes(ctrl.uid)) return

    requestAnimationFrame(()=>{
      const {ctrls} = state
      line.graphics.clear()
      drawCurve(line.graphics, ctrls, oOne, nOne)
      stage.update()
    })
  })

  emitter.on('removeOnlyCtrl', ruid=>{
    if (!line.uids.includes(ruid)) return

    const {ctrls} = state

    line.graphics.clear()

    drawCurve(line.graphics, ctrls, oOne, nOne)

    stage.update()
  })

  container.addChildAt(line, 0)
  stage.update()
}
