var html = require('choo/html')
var css = require('sheetify')
var buttons = require("../buttons.json").scribeButtons

css('../styles/scribeButton.css')

function buttonGenerate (state, emit){

  var render = function (button){
    return html`
      <button
        type="button"
        class=${button.class}
        id=${button.id}
        onclick=${onclick}
        onblur=${onblur}>
          ${button.text}
      </button>
    `
  }

  function onclick(e){
    emit('changeDraw', e.target.id)
  }

  function onblur(e){
    setTimeout(()=>{
      if (e.target.id === state.drawType){
        e.target.focus()
      }
    }, 120)
  }

  return render
}

module.exports = (state, emit)=>{
  return html`
    <div class="draw">
      ${buttons.map(buttonGenerate(state, emit))}
    </div>
  `
}
