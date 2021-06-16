/*
 * @Author: dali
 * @Date: 2021-06-07 17:08:09
 * @Last Modified by: dali
 * @Last Modified time: 2021-06-16 16:54:02
 */
const WebSocket = window.WebSocket || window.MozWebSocket

export default async function RunEngine(config, data, fn) {
  if (!WebSocket) {
    console.log(new Error('检测到您的浏览器不支持WebSocket'))
    return false
  }

  const lvs = new Lvs(config.url)
  const engine = new Engine({
    id: config.domId,
    appId: data.appId ? data.appId : null,
  }) // 有appId就传， 没有就传null
  try {
    let res = await lvs.connect(data)
    engine.run(res, fn)
  } catch (err) {
    new Error('lvs连接失败：' + err)
  }
  return engine
}

/*
 * json and arr
 */
const myjson = {
  json2Arr: function (json) {
    return JSON.parse(json)
  },
  arr2Json: function (arr) {
    return JSON.stringify(arr)
  },
}

/*
 * lvs 服务
 */
class Lvs {
  constructor(host) {
    this.ws = new WebSocket(host)
  }
  connect(data) {
    return new Promise((resolve, reject) => {
      var timeInvate = null
      this.ws.onmessage = (data) => {
        data = myjson.json2Arr(data.data)
        if (data.success) {
          resolve('ws://' + data.data.host + ':' + data.data.port)
        } else {
          reject(data.message)
        }
      }
      this.ws.onopen = () => {
        this.ws.send(myjson.arr2Json(data))
        timeInvate = setInterval(() => {
          this.ws.send(
            myjson.arr2Json({
              type: 'ping',
            })
          )
        }, 60000)
      }
      this.ws.onclose = (e) => {
        if (timeInvate) {
          clearInterval(timeInvate)
        }
      }
      this.ws.onerror = () => {
        if (timeInvate) {
          clearInterval(timeInvate)
        }
      }
    })
  }
}

/*
 * webrtc 服务
 */
const ToClientMessageType = {
  QualityControlOwnership: 0,
  Response: 1,
  Command: 2,
  FreezeFrame: 3,
  UnfreezeFrame: 4,
  VideoEncoderAvgQP: 5,
}
class Webrtc {
  setSws(sws, appId) {
    this.sws = sws
    let _this = this
    this.sws.onopen = () => {
      this.sendMsg({
        type: 'ready',
        data: appId,
      })
      _this.timeInvate = setInterval(() => {
        _this.sendMsg({
          type: 'ping',
        })
      }, 60000)
    }
    this.sws.onerror = (event) => {
      console.log('SWS error:', event)
      if (_this.timeInvate) {
        clearInterval(_this.timeInvate)
      }
    }
    this.sws.onclose = (event) => {
      if (_this.timeInvate) {
        clearInterval(_this.timeInvate)
      }
    }
    return this
  }

  init() {
    let _this = this
    this.sws.onmessage = (event) => {
      var msg = JSON.parse(event.data)
      switch (msg.type) {
        case 'config':
          _this.config(msg)
          break
        case 'answer':
          _this.answer(msg)
          break
        case 'iceCandidate':
          _this.iceCandidate(msg)
          break
      }
    }
    return this
  }
  setStreamHandel(fun) {
    this.streamHandel = fun
    return this
  }

  async config(msg) {
    let _this = this
    let config = msg.peerConnectionOptions
    config.sdpSemantics = 'unified-plan'
    this.pc = new RTCPeerConnection(config)
    this.pc.addEventListener('icecandidate', (e) => {
      if (e.candidate) {
        _this.sendMsg({
          type: 'iceCandidate',
          candidate: e.candidate,
        })
      }
    })
    this.pc.addEventListener('track', (e) => {
      _this.streamHandel(e.streams[0])
    })

    this.dcClient = this.pc.createDataChannel('cirrus', { ordered: true })
    this.dcClient.onopen = function (e) {
      console.log(`data channel connect`)
    }

    this.dcClient.onclose = function (e) {
      console.log(`data channel closed`)
    }
    // TODO:: 渲染端响应事件
    this.dcClient.onmessage = function (e) {
      let data = e.data
      var view = new Uint8Array(data)
      // 当约定返回第一位为1时
      if (view[0] === ToClientMessageType.Response) {
        let response = new TextDecoder('utf-16').decode(data.slice(1))
        if (_this.dataHandel) {
          _this.dataHandel(response)
        }
      }
    }

    const offer = await this.getOffer()
    this.sendMsg(offer)
  }

  answer(msg) {
    var answerDesc = new RTCSessionDescription(msg)
    this.pc.setRemoteDescription(answerDesc)
  }
  // 冰片 - 交互
  iceCandidate(msg) {
    let candidate = new RTCIceCandidate(msg.candidate)
    this.pc.addIceCandidate(candidate).then((_) => {
      console.log('ICE candidate successfully added')
    })
  }

  async getOffer() {
    let offer = await this.pc.createOffer({
      offerToReceiveAudio: 1, // 1开启  0关闭
      offerToReceiveVideo: 1,
    })
    await this.pc.setLocalDescription(offer)
    offer.sdp = offer.sdp.replace(
      /(a=fmtp:\d+ .*level-asymmetry-allowed=.*)\r\n/gm,
      '$1;x-google-start-bitrate=10000;x-google-max-bitrate=20000\r\n'
    )
    return offer
  }

  sendMsg(msg) {
    this.sws.send(myjson.arr2Json(msg))
  }

  getDcClient(label, options) {
    return this.dcClient
  }

  setDataHandle(fn) {
    this.dataHandel = fn
    return this
  }
}

/*
 * 引擎服务
 */
class Engine {
  constructor(config) {
    this.option = config
  }
  run(host, fn) {
    this.ws = new WebSocket(host)
    this.initCanvas(fn)
    return this
  }
  initCanvas(fn) {
    this.webrtc = new Webrtc()
    let runBox = document.getElementById(this.option.id)

    if (runBox) {
      let canvas = new videoCanvas()
      canvas.init(runBox)
      let _this = this
      this.webrtc
        .setSws(this.ws, this.option.appId)
        .setDataHandle(fn)
        .setStreamHandel((stream) => {
          _this.dcClient = _this.webrtc.getDcClient()
          canvas.setDcClient(_this.dcClient)
          canvas.play(stream)
        })
        .init()
    }
  }

  // TODO:设置分辨率
  setRes(width, height) {
    let descriptor = {
      Console: 'r.' + 'setres ' + width + 'x' + height + 'w',
    }
    this.emitUIInteraction(descriptor)
  }
  // TODO:设置ui
  emitUIInteraction(descriptor) {
    this.emitDescriptor(MessageType.UIInteraction, descriptor)
  }
  // 事件操作方法 （参数：事件类型，描述符）
  emitDescriptor(messageType, descriptor) {
    console.log('发送消息：', messageType, descriptor)
    // 将描述符对象转换为JSON字符串。
    let descriptorAsString = JSON.stringify(descriptor)

    // 将UTF-16 JSON字符串添加到数组字节缓冲区，每次两个字节。
    let data = new DataView(
      new ArrayBuffer(1 + 2 + 2 * descriptorAsString.length)
    )
    let byteIdx = 0
    data.setUint8(byteIdx, messageType)
    byteIdx++
    data.setUint16(byteIdx, descriptorAsString.length, true)
    byteIdx += 2
    for (let i = 0; i < descriptorAsString.length; i++) {
      data.setUint16(byteIdx, descriptorAsString.charCodeAt(i), true)
      byteIdx += 2
    }

    this.dcClient.send(data.buffer)
  }
  // TODO: cim直接发送消息
  send(data) {
    console.log('引擎 send:', data)
    this.dcClient.send(data)
  }
}

var MessageType = {
  /**********************************************/
  /*
   * Control Messages. Range = 0..49.
   */
  IFrameRequest: 0,
  RequestQualityControl: 1,
  MaxFpsRequest: 2,
  AverageBitrateRequest: 3,
  StartStreaming: 4,
  StopStreaming: 5,

  /**********************************************/
  /*
   * Input Messages. Range = 50..89.
   */
  // Generic Input Messages. Range = 50..59.
  UIInteraction: 50,
  Command: 51,

  // Keyboard Input Message. Range = 60..69.
  KeyDown: 60,
  KeyUp: 61,
  KeyPress: 62,

  // Mouse Input Messages. Range = 70..79.
  MouseEnter: 70,
  MouseLeave: 71,
  MouseDown: 72,
  MouseUp: 73,
  MouseMove: 74,
  MouseWheel: 75,

  // Touch Input Messages. Range = 80..89.
  TouchStart: 80,
  TouchEnd: 81,
  TouchMove: 82,

  /***********************************************/
}
// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
const MouseButtonsMask = {
  PrimaryButton: 1, // Left button.
  SecondaryButton: 2, // Right button.
  AuxiliaryButton: 4, // Wheel button.
  FourthButton: 8, // Browser Back button.
  FifthButton: 16, // Browser Forward button.
}
// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const MouseButton = {
  MainButton: 0, // Left button.
  AuxiliaryButton: 1, // Wheel button.
  SecondaryButton: 2, // Right button.
  FourthButton: 3, // Browser Back button.
  FifthButton: 4, // Browser Forward button.
}
var requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame

class videoCanvas {
  constructor() {
    isMouseDown: false // 是鼠标按下？
  }
  init(canvasEl) {
    let _this = this
    this.fingers = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    this.fingerIds = {}
    this.isPlaying = false
    this.canvas = canvasEl
    // 设置好canvas宽高
    this.canvasHeight = canvasEl.clientHeight
    this.canvasWidth = canvasEl.clientWidth
    this.ratio = 1
    this.video = document.createElement('video')
    this.video.playsInline = true
    this.video.muted = true

    this.video.addEventListener('loadedmetadata', (e) => {
      _this.setCanvasSize(_this.video.videoWidth, _this.video.videoHeight)
    })
    this.initCanvas()
    this.drawCanvas()
  }
  play(stream) {
    if (this.video.srcObject !== stream) {
      this.video.srcObject = stream
    }
  }
  setCanvasSize(videoWidth, videoHeight) {
    this.ratio = videoWidth / this.canvasWidth

    this.canvas.setAttribute('width', this.canvasWidth)
    this.canvas.setAttribute('height', this.canvasHeight)
  }

  initCanvas() {
    let _this = this

    this.canvas.onmousedown = (e) => {
      _this.emitMouseDown(e.button, e.offsetX, e.offsetY)
      this.isMouseDown = true
      e.preventDefault()
    }
    this.canvas.onmousemove = (e) => {
      if (!this.isMouseDown) return false
      // offsetX 为正  为负  offsetY 为正  为负
      _this.emitMouseMove(e.offsetX, e.offsetY, e.movementX, e.movementY)
      e.preventDefault()
    }

    this.canvas.onmouseup = (e) => {
      _this.emitMouseUp(e.button, e.offsetX, e.offsetY)
      this.isMouseDown = false
      e.preventDefault()
    }

    this.canvas.pressMouseButtons = (e) => {
      _this.pressMouseButtons(e.buttons, x, y)
    }
    this.canvas.releaseMouseButtons = (e) => {
      _this.releaseMouseButtons(e.buttons, x, y)
    }

    this.canvas.addEventListener('contextmenu', (e) => {
      _this.emitMouseUp(e.button, e.offsetX, e.offsetY)
      e.preventDefault()
    })
    this.canvas.ontouchstart = function (e) {
      for (let t = 0; t < e.changedTouches.length; t++) {
        _this.rememberTouch(e.changedTouches[t])
      }
      _this.emitTouchData(MessageType.TouchStart, e.changedTouches)
      e.preventDefault()
    }

    this.canvas.ontouchend = function (e) {
      _this.emitTouchData(MessageType.TouchEnd, e.changedTouches)

      // Re-cycle unique identifiers previously assigned to each touch.
      for (let t = 0; t < e.changedTouches.length; t++) {
        _this.forgetTouch(e.changedTouches[t])
      }
      e.preventDefault()
    }

    this.canvas.ontouchmove = function (e) {
      _this.emitTouchData(MessageType.TouchMove, e.touches)
      e.preventDefault()
    }

    if ('onmousewheel' in this.canvas) {
      this.canvas.onmousewheel = (e) => {
        _this.emitMouseWheel(e.wheelDelta, e.offsetX, e.offsetY)
        e.preventDefault()
      }
    } else {
      this.canvas.addEventListener(
        'DOMMouseScroll',
        (e) => {
          _this.emitMouseWheel(e.detail * -120, e.offsetX, e.offsetY)
          e.preventDefault()
        },
        false
      )
    }
  }

  rememberTouch(touch) {
    let finger = this.fingers.pop()
    this.fingerIds[touch.identifier] = finger
  }

  forgetTouch(touch) {
    this.fingers.push(this.fingerIds[touch.identifier])
    delete this.fingerIds[touch.identifier]
  }

  emitTouchData(type, touches) {
    let data = new DataView(new ArrayBuffer(2 + 6 * touches.length))
    data.setUint8(0, type)
    data.setUint8(1, touches.length)
    let byte = 2
    for (let t = 0; t < touches.length; t++) {
      let touch = touches[t]
      let x = touch.clientX - this.canvas.offsetLeft
      let y = touch.clientY - this.canvas.offsetTop
      let coord = this.normalizeAndQuantizeUnsigned(x, y)
      data.setUint16(byte, coord.x, true)
      byte += 2
      data.setUint16(byte, coord.y, true)
      byte += 2
      data.setUint8(byte, this.fingerIds[touch.identifier], true)
      byte += 1
      data.setUint8(byte, 255 * touch.force, true) // force is between 0.0 and 1.0 so quantize into byte.
      byte += 1
    }
    this.send(data.buffer)
  }

  emitMouseDown(button, x, y) {
    let coord = this.normalizeAndQuantizeUnsigned(x, y)
    var Data = new DataView(new ArrayBuffer(6))
    Data.setUint8(0, MessageType.MouseDown)
    Data.setUint8(1, button)
    Data.setUint16(2, coord.x, true)
    Data.setUint16(4, coord.y, true)
    this.send(Data.buffer)
  }

  emitMouseMove(x, y, deltaX, deltaY) {
    let coord = this.normalizeAndQuantizeUnsigned(x, y)
    let delta = this.normalizeAndQuantizeSigned(deltaX, deltaY)
    var Data = new DataView(new ArrayBuffer(9))
    Data.setUint8(0, MessageType.MouseMove)
    Data.setUint16(1, coord.x, true)
    Data.setUint16(3, coord.y, true)
    Data.setInt16(5, delta.x, true)
    Data.setInt16(7, delta.y, true)
    this.send(Data.buffer)
  }

  emitMouseUp(button, x, y) {
    let coord = this.normalizeAndQuantizeUnsigned(x, y)
    var Data = new DataView(new ArrayBuffer(6))
    Data.setUint8(0, MessageType.MouseUp)
    Data.setUint8(1, button)
    Data.setUint16(2, coord.x, true)
    Data.setUint16(4, coord.y, true)
    this.send(Data.buffer)
  }

  emitMouseWheel(delta, x, y) {
    let coord = this.normalizeAndQuantizeUnsigned(x, y)
    var Data = new DataView(new ArrayBuffer(7))
    Data.setUint8(0, MessageType.MouseWheel)
    Data.setInt16(1, delta, true)
    Data.setUint16(3, coord.x, true)
    Data.setUint16(5, coord.y, true)
    this.send(Data.buffer)
  }

  // If the user has any mouse buttons pressed then release them.
  releaseMouseButtons(buttons, x, y) {
    if (buttons & MouseButtonsMask.PrimaryButton) {
      this.emitMouseUp(MouseButton.MainButton, x, y)
    }
    if (buttons & MouseButtonsMask.SecondaryButton) {
      this.emitMouseUp(MouseButton.SecondaryButton, x, y)
    }
    if (buttons & MouseButtonsMask.AuxiliaryButton) {
      this.emitMouseUp(MouseButton.AuxiliaryButton, x, y)
    }
    if (buttons & MouseButtonsMask.FourthButton) {
      this.emitMouseUp(MouseButton.FourthButton, x, y)
    }
    if (buttons & MouseButtonsMask.FifthButton) {
      this.emitMouseUp(MouseButton.FifthButton, x, y)
    }
  }

  // If the user has any mouse buttons pressed then press them again.
  pressMouseButtons(buttons, x, y) {
    if (buttons & MouseButtonsMask.PrimaryButton) {
      this.emitMouseDown(MouseButton.MainButton, x, y)
    }
    if (buttons & MouseButtonsMask.SecondaryButton) {
      this.emitMouseDown(MouseButton.SecondaryButton, x, y)
    }
    if (buttons & MouseButtonsMask.AuxiliaryButton) {
      this.emitMouseDown(MouseButton.AuxiliaryButton, x, y)
    }
    if (buttons & MouseButtonsMask.FourthButton) {
      this.emitMouseDown(MouseButton.FourthButton, x, y)
    }
    if (buttons & MouseButtonsMask.FifthButton) {
      this.emitMouseDown(MouseButton.FifthButton, x, y)
    }
  }

  normalizeAndQuantizeUnsigned(x, y) {
    let widthRatio = x / this.canvasWidth //0-1之间占比
    let heightRatio = y / this.canvasHeight //0-1之间占比
    let normalizedX = widthRatio
    let normalizedY = heightRatio
    return {
      inRange: true,
      x: normalizedX * 65536,
      y: normalizedY * 65536,
    }
  }
  normalizeAndQuantizeSigned(x, y) {
    let widthRatio = x / (this.canvasWidth / 2) //0-1之间占比
    let heightRatio = y / (this.canvasHeight / 2) //0-1之间占比
    let normalizedX = widthRatio
    let normalizedY = heightRatio
    return {
      x: normalizedX * 32767,
      y: normalizedY * 32767,
    }
  }
  //发送消息
  send(data) {
    this.dcClient.send(data)
  }

  setDcClient(client) {
    this.dcClient = client
  }

  drawCanvas() {
    if (!this.isPlaying) {
      try {
        this.video.play()
        this.isPlaying = true
      } catch (e) {}
    }
    let ctx = this.canvas.getContext('2d')

    ctx.drawImage(this.video, 0, 0, this.canvasWidth, this.canvasHeight)
    requestAnimationFrame(this.drawCanvas.bind(this))
  }
}
