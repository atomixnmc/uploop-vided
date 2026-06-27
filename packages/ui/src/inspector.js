/**
 * UploopInspector — property inspector web component
 *
 * <uploop-inspector></uploop-inspector>
 */

import { Clip } from '@uploop/timeline'
import { Layer, Effect, blendModes } from '@uploop/compositor'

const CSS = /* css */ `
:host {
  display: block;
  background: #0a0a0f;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 12px;
  min-width: 220px;
}
#title {
  font-size: 13px;
  color: #888;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.field {
  margin-bottom: 10px;
}
.field label {
  display: block;
  font-size: 11px;
  color: #888;
  margin-bottom: 3px;
}
.field input,
.field select {
  width: 100%;
  box-sizing: border-box;
  background: #151520;
  border: 1px solid #222;
  color: #e0e0e0;
  padding: 5px 8px;
  border-radius: 3px;
  font-size: 13px;
}
.field input:focus,
.field select:focus {
  outline: none;
  border-color: #4f8;
}
.field input[type="range"] {
  padding: 0;
  accent-color: #4f8;
}
#empty {
  text-align: center;
  color: #555;
  font-size: 13px;
  padding: 20px 0;
}
`

export class UploopInspector extends HTMLElement {
  constructor() {
    super()
    this._target = null
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this._render()
  }

  _render() {
    this.shadowRoot.innerHTML = /* html */ `
      <style>${CSS}</style>
      <div id="title"></div>
      <div id="fields"><div id="empty">Select a clip, layer, or effect to inspect</div></div>
    `
    this._titleEl = this.shadowRoot.querySelector('#title')
    this._fieldsEl = this.shadowRoot.querySelector('#fields')
  }

  get target() {
    return this._target
  }

  /**
   * Inspect a target object and render its properties.
   * @param {Clip|Layer|Effect} target
   */
  inspect(target) {
    this._target = target
    if (!target) {
      this._titleEl.textContent = ''
      this._fieldsEl.innerHTML = '<div id="empty">Select a clip, layer, or effect to inspect</div>'
      return
    }
    this._fieldsEl.innerHTML = ''

    if (target instanceof Clip) {
      this._inspectClip(target)
    } else if (target instanceof Layer) {
      this._inspectLayer(target)
    } else if (target instanceof Effect) {
      this._inspectEffect(target)
    } else {
      this._titleEl.textContent = 'Unknown Type'
      this._fieldsEl.innerHTML = '<div id="empty">Unsupported target type</div>'
    }
  }

  // --- Clip inspector ---

  _inspectClip(clip) {
    this._titleEl.textContent = `Clip: ${clip.id.slice(-8)}`
    this._titleEl.style.color = '#44ff88'

    this._addField('inPoint', 'In Point (s)', 'number', clip.inPoint, (v) => { clip.inPoint = parseFloat(v) })
    this._addField('outPoint', 'Out Point (s)', 'number', clip.outPoint, (v) => { clip.outPoint = parseFloat(v) })
    this._addField('source', 'Source', 'text', clip.source, (v) => { clip.source = v })
    this._addField('opacity', 'Opacity', 'range', clip.props?.opacity ?? 1, (v) => { clip.props = { ...clip.props, opacity: parseFloat(v) } }, { min: 0, max: 1, step: 0.01 })
    this._addField('scale', 'Scale', 'number', clip.props?.scale ?? 1, (v) => { clip.props = { ...clip.props, scale: parseFloat(v) } }, { step: 0.1 })
    this._addField('rotation', 'Rotation', 'number', clip.props?.rotation ?? 0, (v) => { clip.props = { ...clip.props, rotation: parseFloat(v) } }, { step: 1 })
    this._addField('x', 'Position X', 'number', clip.props?.x ?? 0, (v) => { clip.props = { ...clip.props, x: parseFloat(v) } })
    this._addField('y', 'Position Y', 'number', clip.props?.y ?? 0, (v) => { clip.props = { ...clip.props, y: parseFloat(v) } })
  }

  // --- Layer inspector ---

  _inspectLayer(layer) {
    this._titleEl.textContent = `Layer: ${layer.name || layer.id.slice(-8)}`
    this._titleEl.style.color = '#44aaff'

    this._addField('name', 'Name', 'text', layer.name, (v) => { layer.name = v })
    this._addField('opacity', 'Opacity', 'range', layer.opacity, (v) => { layer.opacity = parseFloat(v) }, { min: 0, max: 1, step: 0.01 })

    // Blend mode selector
    const modes = Object.keys(blendModes)
    this._addSelect('blendMode', 'Blend Mode', modes, layer.blendMode || 'normal', (v) => { layer.blendMode = v })

    this._addField('x', 'X', 'number', layer.x, (v) => { layer.x = parseFloat(v) })
    this._addField('y', 'Y', 'number', layer.y, (v) => { layer.y = parseFloat(v) })

    this._addField('scaleX', 'Scale X', 'number', layer.scaleX, (v) => { layer.scaleX = parseFloat(v) }, { step: 0.1 })
    this._addField('scaleY', 'Scale Y', 'number', layer.scaleY, (v) => { layer.scaleY = parseFloat(v) }, { step: 0.1 })

    this._addField('rotation', 'Rotation', 'number', layer.rotation, (v) => { layer.rotation = parseFloat(v) }, { step: 1 })

    // Visible toggle
    this._addField('visible', 'Visible', 'checkbox', layer.visible, (v) => { layer.visible = v })
  }

  // --- Effect inspector ---

  _inspectEffect(effect) {
    this._titleEl.textContent = `Effect: ${effect.type}`
    this._titleEl.style.color = '#ffaa44'

    this._addField('type', 'Type', 'text', effect.type, (v) => { effect.type = v }, null, true)

    // Render params as fields
    for (const [key, value] of Object.entries(effect.params)) {
      const inputType = typeof value === 'number' ? 'number' : 'text'
      this._addField(`param-${key}`, key, inputType, value, (v) => {
        const parsed = inputType === 'number' ? parseFloat(v) : v
        effect.params[key] = parsed
      })
    }

    // Add param button
    const addRow = document.createElement('div')
    addRow.className = 'field'
    addRow.style.display = 'flex'
    addRow.style.gap = '4px'
    const keyInput = document.createElement('input')
    keyInput.placeholder = 'param name'
    keyInput.style.flex = '1'
    const valInput = document.createElement('input')
    valInput.placeholder = 'value'
    valInput.style.flex = '1'
    const addBtn = document.createElement('button')
    addBtn.textContent = '+'
    addBtn.style.cssText = `
      background: #151520; border: 1px solid #222; color: #4f8;
      cursor: pointer; padding: 5px 10px; border-radius: 3px; font-size: 13px;
    `
    addBtn.addEventListener('click', () => {
      const k = keyInput.value.trim()
      if (!k) return
      const v = isNaN(valInput.value) ? valInput.value : parseFloat(valInput.value)
      effect.params[k] = v
      keyInput.value = ''
      valInput.value = ''
      this.inspect(effect)
    })
    addRow.append(keyInput, valInput, addBtn)
    this._fieldsEl.appendChild(addRow)
  }

  // --- Helpers ---

  _addField(id, label, type, value, onChange, opts = {}, readonly = false) {
    const div = document.createElement('div')
    div.className = 'field'

    const lbl = document.createElement('label')
    lbl.textContent = label
    div.appendChild(lbl)

    let input
    if (type === 'checkbox') {
      input = document.createElement('input')
      input.type = 'checkbox'
      input.checked = !!value
      input.style.width = 'auto'
      input.addEventListener('change', () => {
        onChange(input.checked)
        this._emitChange(id, input.checked)
      })
    } else if (type === 'select') {
      // handled separately via _addSelect
    } else {
      input = document.createElement('input')
      input.type = type === 'range' ? 'range' : type
      input.value = value ?? ''
      if (opts.min !== undefined) input.min = opts.min
      if (opts.max !== undefined) input.max = opts.max
      if (opts.step !== undefined) input.step = opts.step
      if (readonly) input.readOnly = true
      input.addEventListener('input', () => {
        const val = type === 'number' || type === 'range' ? parseFloat(input.value) : input.value
        onChange(val)
        this._emitChange(id, val)
      })
    }
    div.appendChild(input)
    this._fieldsEl.appendChild(div)
  }

  _addSelect(id, label, options, currentValue, onChange) {
    const div = document.createElement('div')
    div.className = 'field'

    const lbl = document.createElement('label')
    lbl.textContent = label
    div.appendChild(lbl)

    const select = document.createElement('select')
    for (const opt of options) {
      const o = document.createElement('option')
      o.value = opt
      o.textContent = opt
      if (opt === currentValue) o.selected = true
      select.appendChild(o)
    }
    select.addEventListener('change', () => {
      onChange(select.value)
      this._emitChange(id, select.value)
    })
    div.appendChild(select)
    this._fieldsEl.appendChild(div)
  }

  _emitChange(prop, value) {
    this.dispatchEvent(new CustomEvent('uploop:property-change', {
      bubbles: true, composed: true,
      detail: { target: this._target, property: prop, value },
    }))
  }

  disconnectedCallback() {
    // cleanup
  }
}

customElements.define('uploop-inspector', UploopInspector)
