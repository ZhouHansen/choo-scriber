exports.cursurable = (target, state)=>{
  target.on('mouseover', ()=>{
    var currentId = state.currentId
    var drawType = state.drawType

    if (drawType === 'move'){
      $('#canvas').addClass('move')
    }
    else if (drawType === 'remove'){
      $('#canvas').addClass('remove')
    }
    else if (drawType === 'line' && currentId !== target.uid) {
      $('#canvas').addClass('unable')
    }

    if (drawType === 'ctrlline' && currentId !== target.uid) {
      $('#canvas').addClass('ctrlline')
    }
  })

  target.on('mouseout', ()=>{
    $('#canvas').removeClass('remove unable ctrlline move')
  })
}

exports.movable = (target, state, emitter)=>{
  target.on('pressmove', e=>{
    var drawType = state.drawType

    if (drawType !== 'move') return

    var x = e.stageX - target.x
      , y = e.stageY - target.y

    emitter.emit('moveContainer', {x, y})
  })
}

exports.removable = (target, state, emitter)=>{
  target.on('mousedown', ()=>{
    var drawType = state.drawType

    if (drawType === 'remove'){
      setTimeout(()=>{
        emitter.emit('preventEvent', false)
        emitter.emit('removePoint', target.uid)
      })
    }
  })
}

exports.ctrlable = (target, state, emitter)=>{
  target.on('click', ()=>{
    var drawType = state.drawType

    if (drawType === 'ctrlline'){
      setTimeout(()=>{
        emitter.emit('preventEvent', false)
        emitter.emit('changeCurrentId', target.uid)
      })
    }
  })

  target.on('pressmove', e=>{
    var drawType = state.drawType
    var currentId = state.currentId

    if (target.uid === currentId && drawType === 'ctrlline') {
      var x = e.stageX - state.container.x
        , y = e.stageY - state.container.y
        , isMirror = true

      emitter.emit('operateCtrl', {uid: currentId, x, y, isMirror})
    }
  })

  target.on("pressup", ()=>{
    emitter.emit('preventDrag', true)
  })
}

exports.ctrlRemovable = (target, state, emitter)=>{
  target.on("mousedown", ()=>{
    var drawType = state.drawType

    if (drawType === 'remove'){
      emitter.emit('removeCtrl', target.uid)
    }
  })

  target.on("mouseover", ()=>{
    var drawType = state.drawType
    if (drawType === 'remove'){
      $("#canvas").addClass("remove")
    }
  })

  target.on("mouseout", ()=>{
    $("#canvas").removeClass("remove")
  })
}

exports.preventable = (target, state, emitter)=>{
  target.on('mousedown', ()=>{
    emitter.emit('preventEvent', true)
  })
}

exports.draggable = (()=>{
  var innerFunc = (e, target, state, emitter)=>{
    const {currentId, drawType} = state

    emitter.emit('preventEvent', true)

    if (target.uid === currentId && drawType === 'line'){
      var x = e.stageX - container.x
        , y = e.stageY - container.y
        , isMirror = false

      emitter.emit('operateCtrl', {uid: currentId, x, y, isMirror})
    }
  }

  return (target, state, emitter)=>{
    target.on('mousedown', e=>{
      innerFunc(e, target, state, emitter)
    })

    target.on("pressmove", e=>{
      innerFunc(e, target, state, emitter)
    })

    target.on("pressup", ()=>{
      emitter.emit('preventEvent', false)
      emitter.emit('preventDrag', true)
    })
  }
})()
