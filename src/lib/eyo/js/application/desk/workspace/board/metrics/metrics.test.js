describe('Basic metrics IN PROGRESS', function () {
  it ('scaling divs', function () {
    var div0 = document.querySelector('#eyo-desk')
    var div1 = goog.dom.createDom('div')
    goog.dom.appendChild(div0.parentNode, div1)
    var style = div1.style
    var w  = 100
    var h = 100
    var s = 1.5
    style.width = `${w}px`
    style.height = `${h}px`
    style.background = 'blue'
    style.transform = `translate(${-w / 2}px, ${-h / 2}px) scale(${s}) translate(${w / 2}px, ${h / 2}px)`
  })
  it ('place and scroll basics', function() {
    var div0 = document.querySelector('#eyo-desk')
    var metrics = new eYo.Metrics()
    metrics.view_.size = eYo.Where.xy(parseInt(div0.style.width), parseInt(div0.style.height))
    var div1 = goog.dom.createDom('div')
    goog.dom.appendChild(div0.parentNode, div1)
    div1.style.position='relative'
    div1.style.width = `${metrics.view_.width}px`
    div1.style.height = `${metrics.view_.height}px`
    div1.style.overflow = 'hidden'
    var svg = eYo.NS_Svg.newElementSvg(div1, 'eyo-svg')
    svg.style.position='absolute'
    svg.setAttribute('preserveAspectRatio', 'xMinYMin slice')
    var content = metrics.port_
    content.origin = eYo.Where.cl(-8, -2)
    content.size = eYo.Where.cl(80, 20)
    svg.setAttribute('viewBox', `${content.x} ${content.y} ${content.width} ${content.height}`)
    metrics.scale_ = 1.1
    metrics.drag = eYo.Where.cl(4, 2)
    content = metrics.portInView
    svg.setAttribute('width', `${content.width}px`)
    svg.setAttribute('height', `${content.height}px`)
    svg.style.transform = `translate(${content.x}px,${content.y}px)`
    for (var i = -1 ; i < 11 ; i++) {
      eYo.NS_Svg.newElement('rect', {
        x: 8 * i * eYo.Unit.x,
        y: 2 * i * eYo.Unit.y,
        width: 8 * eYo.Unit.x,
        height: 2 * eYo.Unit.y,
        fill: 'yellow'
      },
      svg)
      eYo.NS_Svg.newElement('rect', {
        x: 8 * (i + 1) * eYo.Unit.x,
        y: 2 * i * eYo.Unit.y,
        width: 8 * eYo.Unit.x,
        height: 2 * eYo.Unit.y,
        fill: 'green'
      },
      svg)
      eYo.NS_Svg.newElement('rect', {
        x: 8 * i * eYo.Unit.x,
        y: 2 * (i + 1) * eYo.Unit.y,
        width: 8 * eYo.Unit.x,
        height: 2 * eYo.Unit.y,
        fill: 'red'
      },
      svg)
    }
    eYo.NS_Svg.newElement('circle',
    {cx: 20, cy: 13, r: 10, fill: 'red'},
    svg)
  })
  it ('SVG scaling', function() {

  })
  it ('place and scale basics', function() {
    var div0 = document.querySelector('#eyo-desk')
    var metrics = new eYo.Metrics()
    metrics.view_.size = eYo.Where.xy(parseInt(div0.style.width), parseInt(div0.style.height))
    var div1 = goog.dom.createDom('div')
    goog.dom.appendChild(div0.parentNode, div1)
    div1.style.position='relative'
    div1.style.width = `${metrics.view_.width}px`
    div1.style.height = `${metrics.view_.height}px`
    div1.style.overflow = 'hidden'
    var svg = eYo.NS_Svg.newElementSvg(div1, 'eyo-svg')
    svg.style.position='absolute'
    svg.setAttribute('preserveAspectRatio', 'xMinYMin slice')
    var content = metrics.port_
    content.origin = eYo.Where.cl(-8, -2)
    content.size = eYo.Where.cl(80, 20)
    svg.setAttribute('viewBox', `${content.x} ${content.y} ${content.width} ${content.height}`)
    metrics.scale_ = 1.5
    metrics.drag = eYo.Where.cl(4, 2)
    content = metrics.portInView
    svg.setAttribute('width', `${content.width}px`)
    svg.setAttribute('height', `${content.height}px`)
    svg.style.transform = `translate(${content.x}px,${content.y}px)`
    for (var i = -1 ; i < 11 ; i++) {
      eYo.NS_Svg.newElement('rect', {
        x: 8 * i * eYo.Unit.x,
        y: 2 * i * eYo.Unit.y,
        width: 8 * eYo.Unit.x,
        height: 2 * eYo.Unit.y,
        fill: 'yellow'
      },
      svg)
      eYo.NS_Svg.newElement('rect', {
        x: 8 * (i + 1) * eYo.Unit.x,
        y: 2 * i * eYo.Unit.y,
        width: 8 * eYo.Unit.x,
        height: 2 * eYo.Unit.y,
        fill: 'green'
      },
      svg)
      eYo.NS_Svg.newElement('rect', {
        x: 8 * i * eYo.Unit.x,
        y: 2 * (i + 1) * eYo.Unit.y,
        width: 8 * eYo.Unit.x,
        height: 2 * eYo.Unit.y,
        fill: 'red'
      },
      svg)
    }
    eYo.NS_Svg.newElement('circle',
    {cx: 20, cy: 13, r: 10, fill: 'red'},
    svg)
  })
  it ('getBoundingClientRect truncated to 1/64th', function () {
    var div0 = document.querySelector('#eyo-desk')
    var div1 = goog.dom.createDom('div')
    goog.dom.appendChild(div0.parentNode, div1)
    div1.style.width = `${1/64}px`
    div1.style.height = `${1/64}px`
    var r = div1.getBoundingClientRect()
    console.error('getBoundingClientRect', 1/64, r.width)
    chai.assert(1/64 === r.width)
    div1.style.width = `${1/128}px`
    div1.style.height = `${1/128}px`
    var r = div1.getBoundingClientRect()
    chai.assert(0 === r.width)
  })
  it ('desk: metrics scaling', function () {
    var desk = new eYo.Desk({})
    chai.assert(desk !== eYo.app.Desk)
    var board = desk.board
    var before = board.metrics
    board.metrics_.scale = 0.5
    var after = board.metrics
    chai.assert(before.view.equals(after.view))
  })  
})
