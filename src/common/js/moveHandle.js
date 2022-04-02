export const EVENT_TYPE = {
  START: 'start',
  MOVE: 'move',
  END: 'end'
}

class MoveHandle {
  constructor() {
    this.eventList = []
    this.move = null
    this.bodyUserSelect = null

    this._startHandle = this.startHandle.bind(this)
    this._moveHandle = this.moveHandle.bind(this)
    this._upHandle = this.upHandle.bind(this)

    this.init()
  }

  init() {
    document.documentElement.addEventListener('mousemove', this._moveHandle)
    document.documentElement.addEventListener('mouseup', this._upHandle)
  }

  startHandle(e) {
    this.handle(EVENT_TYPE.START, e)
    this.move = this.eventList.find(item => item.el === e.currentTarget)

    if (this.move) {
      this.bodyUserSelect = document.body.style.userSelect
      document.body.style.userSelect = 'none'
    }
  }

  moveHandle(e) {
    if (!this.move) {
      return
    }

    this.handle(EVENT_TYPE.MOVE, e)
  }

  upHandle(e) {
    this.handle(EVENT_TYPE.END, e)
    this.move = null

    document.body.style.userSelect = this.bodyUserSelect
    this.bodyUserSelect = null
  }

  handle(type, e) {
    if (!this.move) {
      return
    }

    const fn = this.move.handle[type]

    fn && fn(type, e)
  }

  add(el, handle) {
    this.addEvent(el)
    this.eventList.push({ el, handle })
  }

  addEvent(dom) {
    dom.addEventListener('mousedown', this._startHandle)
  }

  remove(el) {
    const index = this.eventList.findIndex(item => item.el === el)

    if (index === -1) {
      return
    }

    this.eventList.splice(index, 1)

    el.removeEventListener('mousedown', this._startHandle)
  }

  destroy() {
    this.eventList.forEach(item => {
      item.el.removeEventListener('mousedown', this._startHandle)
    })
    document.documentElement.removeEventListener('mousemove', this._moveHandle)
    document.documentElement.removeEventListener('mouseup', this._upHandle)
  }
}

export default new MoveHandle()
